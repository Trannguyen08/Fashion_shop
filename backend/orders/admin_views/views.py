from django.core.cache import cache
from django.db import transaction
from django.db.models import F, Sum
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from orders.models import Order
from orders.serializers import OrderSerializer
from products.models import ProductVariant, Product
from utils.delete_cache import delete_order_cache


# 1. API lấy toàn bộ đơn hàng (Admin)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_orders_admin(request):
    try:
        orders_qs = Order.objects.all().order_by('-order_date')
        orders_data = OrderSerializer(orders_qs, many=True).data

        return JsonResponse({
            "success": True,
            "data": orders_data
        }, status=200)

    except Exception as e:
        print(str(e))
        return JsonResponse({"error": str(e)}, status=500)


# 2. API cập nhật trạng thái (Admin)
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_order_status_admin(request, order_id):
    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order_id)

            new_status = request.data.get("status")
            cancel_reason = request.data.get("cancelReason", "")

            if new_status == "Đã hủy" and order.ship_status != "Đã hủy":
                product_ids = set()
                for item in order.items.all():
                    variant = item.product_variant
                    qty = item.quantity
                    ProductVariant.objects.filter(id=variant.id).update(
                        stock_quantity=F("stock_quantity") + qty
                    )
                    product_ids.add(variant.product_id)

                for p_id in product_ids:
                    total_stock = ProductVariant.objects.filter(product_id=p_id).aggregate(Sum("stock_quantity"))[
                        'stock_quantity__sum']
                    Product.objects.filter(id=p_id).update(stock_quantity=total_stock or 0)

            # Cập nhật thông tin đơn
            order.ship_status = new_status
            if cancel_reason:
                order.notes = f"Lý do hủy: {cancel_reason}"

            order.save()

            # Xóa cache liên quan
            delete_order_cache(order.customer.account_id)

            return JsonResponse({
                "success": True,
                "message": f"Cập nhật đơn hàng {order_id} thành công"
            }, status=200)

    except Order.DoesNotExist:
        return JsonResponse({"success": False, "error": "Đơn hàng không tồn tại"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)