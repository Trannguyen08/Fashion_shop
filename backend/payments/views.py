# payment/views.py
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Payment
from .vnpay import Vnpay
from django.conf import settings
from datetime import datetime
import django_rq
from .tasks import process_vnpay_ipn
from orders.models import Order


@api_view(['POST'])
def create_payment(request):
    order_id = request.data.get('order_id')

    if not order_id:
        return Response({'message': 'Missing order_id'}, status=400)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'message': 'Order not found'}, status=404)

    with transaction.atomic():
        # tạo payment nếu chưa có
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'amount': int(order.total_amount),
                'status': 'PENDING'
            }
        )

        if not created and payment.status == 'SUCCESS':
            return Response({'message': 'Order already paid'}, status=400)

    # tạo URL VNPAY
    vnpay = Vnpay()
    vnpay.add_param('vnp_Version', '2.1.0')
    vnpay.add_param('vnp_Command', 'pay')
    vnpay.add_param('vnp_TmnCode', settings.VNPAY_TMN_CODE)
    vnpay.add_param('vnp_Amount', int(payment.amount) * 100)
    vnpay.add_param('vnp_CurrCode', 'VND')
    vnpay.add_param('vnp_TxnRef', str(order.id))
    vnpay.add_param('vnp_OrderInfo', f'Thanh toan Order #{order.id}')
    vnpay.add_param('vnp_OrderType', 'other')
    vnpay.add_param('vnp_Locale', 'vn')
    vnpay.add_param('vnp_ReturnUrl', settings.VNPAY_RETURN_URL)
    vnpay.add_param('vnp_IpAddr', request.META.get('REMOTE_ADDR', '127.0.0.1'))
    vnpay.add_param('vnp_CreateDate', datetime.now().strftime('%Y%m%d%H%M%S'))

    payment_url = vnpay.create_payment_url()
    return Response({"success": True,
        'payment_url': payment_url})


@api_view(['GET'])
def vnpay_return(request):
    params = request.GET.dict()
    vnpay = Vnpay()

    if not vnpay.verify_return(params):
        return Response({'message': 'Invalid signature'}, status=400)

    response_code = params.get('vnp_ResponseCode')
    order_id = params.get('vnp_TxnRef')

    try:
        order = Order.objects.get(id=order_id)
        payment = order.payment  # liên kết 1-1
    except (Order.DoesNotExist, Payment.DoesNotExist):
        return Response({'message': 'Order/Payment not found'}, status=404)

    # Return URL chỉ dùng để hiển thị
    if response_code == '00':
        return Response({'message': 'Payment success'})
    else:
        return Response({'message': 'Payment failed'})


@api_view(['GET'])
def vnpay_ipn(request):
    params = request.GET.dict()
    django_rq.enqueue(process_vnpay_ipn, params)
    return Response({"RspCode": "00", "Message": "Received"})


