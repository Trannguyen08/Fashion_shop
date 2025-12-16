from django.core.cache import cache
from django.db import transaction
from django.db.models import F, Sum
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from customers.models import CustomerAddress
from products.models import ProductVariant, Product
from .models import Order
from .serializers import OrderSerializer


def delete_order_cache():
    cache.delete("all_orders")
    cache.delete("all_products")
    for key in cache.keys("all_orders_*"):
        cache.delete(key)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        with transaction.atomic():
            data = request.data
            items = data.get("items", [])
            variant_ids = [item["product_variant"] for item in items]

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

            locked_products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            # update variant stock
            for item in items:
                variant_id = item["product_variant"]
                qty = item["quantity"]
                ProductVariant.objects.filter(id=variant_id).update(stock_quantity=F("stock_quantity") - qty)

            # update total stock
            for product_id in product_ids:
                total_variant_stock = ProductVariant.objects.select_for_update().filter(
                    product_id=product_id
                ).aggregate(total_sum=Sum("stock_quantity"))

                new_stock = total_variant_stock.get('total_sum') or 0
                Product.objects.filter(id=product_id).update(stock_quantity=new_stock)

            # create order
            address = CustomerAddress.objects.get(id=data.get("address"))
            serializer = OrderSerializer(data=data)
            if serializer.is_valid():
                order = serializer.save(customer=request.user, address=address)
                delete_order_cache()

                return JsonResponse({
                    "success": True,  # Thêm success: True
                    "message": "Tạo đơn hàng thành công",
                    "order_id": order.id
                }, status=200)
            else:
                print(serializer.errors)
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
            order = Order.objects.filter(
                id=order_id,
                customer=user
            ).first()

            if order is None:
                print(f"Not found order {order}")
                return JsonResponse({
                    "success": False,
                    "message": f"Đơn hàng {order_id} không được tìm thấy"
                }, status=404)

            product_ids = set()

            # update stock variant
            for item in order.items.all():
                variant = item.product_variant
                qty = item.quantity
                ProductVariant.objects.filter(id=variant.id).update(
                    stock_quantity=F("stock_quantity") + qty
                )
                product_ids.add(variant.product_id)

            # update total stock
            for product_id in product_ids:
                total_variant_stock = ProductVariant.objects.filter(
                    product_id=product_id
                ).aggregate(total_sum=Sum("stock_quantity"))

                new_stock = total_variant_stock.get("total_sum") or 0
                Product.objects.filter(id=product_id).update(stock_quantity=new_stock)

            order.ship_status = "Cancelled"
            order.save()

            delete_order_cache()

            return JsonResponse({
                "success": True,
                "message": f"Đơn hàng {order_id} đã được hủy thành công"
            }, status=200)

    except Exception as e:
        print(f"Lỗi hủy đơn hàng: {str(e)}")
        return JsonResponse({"success": False, "error": "Đã xảy ra lỗi hệ thống khi hủy đơn hàng."}, status=500)


@api_view(['PUT'])
def update_order(request, order_id):
    try:
        status = request.data.get("new_status")
        order = Order.objects.get(id=order_id)

        order.ship_status = status
        order.save()
        delete_order_cache()

        return JsonResponse({
            "message": f"Đã cập nhật trạng thái đơn ({order_id}) thành ({status})",
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)


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






