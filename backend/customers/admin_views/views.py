from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from accounts.models import Account, User
from customers.models import CustomerAddress
from orders.models import Order
from reviews.models import Review


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_user_detail(request, account_id):
    try:
        # Lấy đồng thời Account và User profile (nếu quan hệ là OneToOne hoặc ForeignKey)
        user_profile = get_object_or_404(User.objects.select_related('account'), account_id=account_id)
        account_base = user_profile.account

        # 1. Xử lý địa chỉ (Sử dụng list comprehension và join để tránh lỗi None)
        addr = CustomerAddress.objects.filter(account_id=account_id, is_default=True).first()
        full_address = ", ".join(
            filter(None, [addr.address_detail, addr.ward, addr.district, addr.province])) if addr else "Chưa cập nhật"

        # 2. Thống kê đơn hàng (Dùng ship_status theo Model choices)
        orders = Order.objects.filter(customer=account_base)
        order_stats = orders.aggregate(
            total_orders=Count('id'),
            total_spent=Sum('total_amount')
        )

        # 3. Danh sách đơn hàng & Đánh giá (Sử dụng get_FIELD_display() để bỏ map thủ công)
        order_list = [{
            'id': f"DH{o.id:03d}",
            'date': o.order_date.strftime('%d/%m/%Y') if o.order_date else None,
            'total': float(o.total_amount or 0),
            'status': o.ship_status,
            'payment_method': o.payment_method,
            'ship_method': o.ship_method
        } for o in orders.order_by('-order_date')[:10]]

        reviews = Review.objects.filter(account=account_base).select_related('product').order_by('-review_date')
        review_list = [{
            'id': r.id,
            'product': r.product.name if r.product else 'N/A',
            'rating': r.rating,
            'comment': r.comment or '',
            'date': r.review_date.strftime('%d/%m/%Y') if r.review_date else None,
            'status': r.status
        } for r in reviews[:10]]

        # 4. Gom dữ liệu trả về
        return Response({
            'success': True,
            'data': {
                'account_id': account_base.id,
                'name': user_profile.full_name,
                'email': user_profile.email,
                'phone': user_profile.phone,
                'address': full_address,
                'avatar': user_profile.avatar_img,
                'is_active': account_base.is_active,
                'role': 'Khách hàng thân thiết' if (order_stats['total_orders'] or 0) >= 5 else 'Khách hàng',

                'orderCount': order_stats['total_orders'] or 0,
                'totalSpent': float(order_stats['total_spent'] or 0),
                'purchaseHistory': order_list,
                'reviewHistory': review_list,

                'reviewStats': {
                    'total': reviews.count(),
                    'approved': reviews.filter(status='approve').count(),
                    'pending': reviews.filter(status='pending').count(),
                }
            }
        })

    except Exception as e:
        print(str(e))
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)