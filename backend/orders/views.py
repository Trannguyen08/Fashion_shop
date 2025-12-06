from django.core.cache import cache
from django.db import transaction
from django.db.models import F
from django.http import JsonResponse
from rest_framework.decorators import api_view
from accounts.models import Account
from products.models import ProductVariant, Product
from .models import Order
from .serializers import OrderSerializer


def delete_order_cache():
    cache.delete("all_orders")
    for key in cache.keys("all_orders_*"):
        cache.delete(key)


@api_view(['POST'])
def create_order(request):
    try:
        with transaction.atomic():

            data = request.data
            items = data.get("items", [])

            if not items:
                return JsonResponse({"error": "Giỏ hàng trống"}, status=400)

            locked_variants = {}
            locked_products = {}

            # 1. LOCK tất cả ProductVariant & Product
            for item in items:
                variant_id = item["variant"]
                quantity = item["quantity"]

                # Lock variant trước
                variant = ProductVariant.objects.select_for_update().get(id=variant_id)
                locked_variants[variant_id] = variant

                # Lock product cha
                product = Product.objects.select_for_update().get(id=variant.product_id)
                locked_products[product.id] = product

                # Kiểm tra stock variant
                if variant.stock < quantity:
                    return JsonResponse({
                        "error": f"Biến thể '{variant.name}' của sản phẩm '{product.name}' "
                                 f"không đủ hàng. Còn lại: {variant.stock}, bạn cần: {quantity}"
                    }, status=400)

            # 2. Trừ tồn kho của từng Variant trước
            for item in items:
                variant = locked_variants[item["variant"]]
                qty = item["quantity"]

                variant.stock = F("stock") - qty
                variant.save()

            # 3. Cập nhật lại stock của Product ( = tổng stock variants )
            for product_id, product in locked_products.items():
                total_variant_stock = ProductVariant.objects.filter(
                    product_id=product_id
                ).aggregate(total=F("stock"))  # tổng tất cả variants

                product.stock = total_variant_stock
                product.save()

            # 4. Tạo Order
            serializer = OrderSerializer(data=data)
            if serializer.is_valid():
                order = serializer.save()

                delete_order_cache()

                return JsonResponse({
                    "message": "Tạo đơn hàng thành công",
                    "order_id": order.id
                }, status=200)
            else:
                return JsonResponse(serializer.errors, status=400)

    except ProductVariant.DoesNotExist:
        return JsonResponse({"error": "Biến thể sản phẩm không tồn tại"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

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
def get_all_order(request):
    try:
        KEY = "all_orders"
        order = cache.get(KEY)

        if order is None:
            order_qs = Order.objects.all()
            order = OrderSerializer(order_qs).data
            cache.set(KEY, order, timeout=86400)

        return JsonResponse({
            "orders": order
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)


@api_view(['GET'])
def get_all_order_by_id(request, account_id):
    try:
        KEY = f"all_orders_{account_id}"
        order = cache.get(KEY)

        if order is None:
            account = Account.objects.filter(id=account_id)
            order_qs = Order.objects.filter(customer=account)
            order = OrderSerializer(order_qs).data
            cache.set(KEY, order, timeout=86400)

        return JsonResponse({
            "id" : account_id,
            "orders": order
        }, status=200)

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)


