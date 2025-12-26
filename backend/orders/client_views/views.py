from django.core.cache import cache
from django.db import transaction
from django.db.models import F, Sum
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from customers.models import CustomerAddress
from products.models import ProductVariant, Product
from orders.models import Order
from orders.serializers import OrderSerializer
from utils.delete_cache import delete_order_cache
from voucher.models import Voucher, UserVoucher


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        with transaction.atomic():
            data = request.data
            items = data.get("items", [])
            variant_ids = [item["product_variant"] for item in items]
            voucher_id = data.get("voucher_id")  # Voucher optional

            # Lock variants
            locked_variants = {
                variant.id: variant
                for variant in ProductVariant.objects.select_for_update().filter(id__in=variant_ids)
            }

            if len(locked_variants) != len(variant_ids):
                return JsonResponse({"error": "Một hoặc nhiều biến thể sản phẩm không tồn tại"}, status=404)

            product_ids = set()
            for item in items:
                variant_id = item["product_variant"]
                quantity = item["quantity"]
                variant = locked_variants[variant_id]
                product_ids.add(variant.product_id)
                if variant.stock_quantity < quantity:
                    product_name = Product.objects.get(id=variant.product_id).name
                    return JsonResponse({
                        "error": f"Biến thể '{variant.name}' của sản phẩm '{product_name}' "
                                 f"không đủ hàng. Còn lại: {variant.stock_quantity}, bạn cần: {quantity}"
                    }, status=400)

            # Lock products
            locked_products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # Update variant stock
            for item in items:
                variant_id = item["product_variant"]
                qty = item["quantity"]
                ProductVariant.objects.filter(id=variant_id).update(stock_quantity=F("stock_quantity") - qty)

            # Update total stock
            for product_id in product_ids:
                total_variant_stock = ProductVariant.objects.select_for_update().filter(
                    product_id=product_id
                ).aggregate(total_sum=Sum("stock_quantity"))
                new_stock = total_variant_stock.get('total_sum') or 0
                Product.objects.filter(id=product_id).update(stock_quantity=new_stock)

            # Voucher
            user_voucher = None
            if voucher_id:
                user_voucher = UserVoucher.objects.select_for_update().filter(
                    id=voucher_id,
                    user=request.user,
                    is_used=False
                ).first()
                if not user_voucher or not user_voucher.voucher.is_valid():
                    return JsonResponse({"error": "Voucher không hợp lệ hoặc đã sử dụng"}, status=400)

            # Create order
            address = CustomerAddress.objects.get(id=data.get("address"))
            serializer = OrderSerializer(data=data)
            if serializer.is_valid():
                order = serializer.save(
                    customer=request.user,
                    address=address,
                    voucher=user_voucher.voucher if user_voucher else None,
                    user_voucher=user_voucher
                )

                # Tính giảm giá nếu có voucher
                if user_voucher:
                    voucher = user_voucher.voucher
                    if voucher.discount_type == "Percent":
                        discount = order.total_amount * voucher.discount_value / 100
                        if hasattr(voucher, "max_discount_amount") and voucher.max_discount_amount:
                            discount = min(discount, voucher.max_discount_amount)
                    else:
                        discount = voucher.discount_value

                    order.final_amount = max(order.total_amount - discount, 0)
                    order.save()

                    # Đánh dấu voucher đã dùng + tăng used_count
                    user_voucher.is_used = True
                    user_voucher.used_at = timezone.now()
                    user_voucher.save()
                    Voucher.objects.filter(id=voucher.id).update(used_count=F("used_count") + 1)

                delete_order_cache(request.user.id)

                return JsonResponse({
                    "success": True,
                    "message": "Tạo đơn hàng thành công",
                    "order_id": order.id
                }, status=200)
            else:
                return JsonResponse({"success": False, "errors": serializer.errors}, status=400)

    except Exception as e:
        print(f"Lỗi tạo đơn hàng: {str(e)}")
        return JsonResponse({"success": False, "error": "Đã xảy ra lỗi hệ thống khi tạo đơn hàng."}, status=500)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        with transaction.atomic():
            user = request.user
            order = Order.objects.select_for_update().filter(
                id=order_id,
                customer=user
            ).first()

            if not order:
                return JsonResponse({
                    "success": False,
                    "message": f"Đơn hàng {order_id} không được tìm thấy"
                }, status=404)

            product_ids = set()
            for item in order.items.all():
                variant = item.product_variant
                qty = item.quantity
                ProductVariant.objects.filter(id=variant.id).update(
                    stock_quantity=F("stock_quantity") + qty
                )
                product_ids.add(variant.product_id)

            # Update total stock
            for product_id in product_ids:
                total_variant_stock = ProductVariant.objects.filter(
                    product_id=product_id
                ).aggregate(total_sum=Sum("stock_quantity"))
                new_stock = total_variant_stock.get("total_sum") or 0
                Product.objects.filter(id=product_id).update(stock_quantity=new_stock)

            # Rollback voucher nếu có
            if order.user_voucher and order.user_voucher.is_used:
                user_voucher = order.user_voucher
                user_voucher.is_used = False
                user_voucher.used_at = None
                user_voucher.save()

                Voucher.objects.filter(id=user_voucher.voucher_id, used_count__gt=0).update(
                    used_count=F('used_count') - 1
                )

            order.ship_status = "Cancelled"
            order.save()

            delete_order_cache(user.id)

            return JsonResponse({
                "success": True,
                "message": f"Đơn hàng {order_id} đã được hủy thành công"
            }, status=200)

    except Exception as e:
        print(f"Lỗi hủy đơn hàng: {str(e)}")
        return JsonResponse({"success": False, "error": "Đã xảy ra lỗi hệ thống khi hủy đơn hàng."}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_order(request):
    try:
        KEY = f"all_orders_{request.user.id}"
        order = cache.get(KEY)

        if order is None:
            user = request.user
            order_qs = Order.objects.filter(
                customer=user
            ).order_by('-order_date')
            order = OrderSerializer(order_qs, many=True).data
            cache.set(KEY, order, timeout=86400)

        return JsonResponse({
            "success": True,
            "data": order
        }, status=200)

    except Exception as e:
        print(str(e))
        return JsonResponse({
            "error": str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_payment_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        return JsonResponse({
            'order_id': order.id,
            'payment_status': order.payment_status
        })
    except Order.DoesNotExist:
        return JsonResponse({'message': 'Order not found'}, status=404)


