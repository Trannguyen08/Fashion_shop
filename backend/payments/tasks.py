# payment/tasks.py
from django.db import transaction
from .models import Payment
from .vnpay import Vnpay

def process_vnpay_ipn(params):
    vnpay = Vnpay()

    if not vnpay.verify_return(params):
        return

    order_id = params.get('vnp_TxnRef')
    response_code = params.get('vnp_ResponseCode')

    try:
        with transaction.atomic():
            # Khóa payment để tránh race condition
            payment = Payment.objects.select_for_update().get(order_id=order_id)

            # Chống callback nhiều lần
            if payment.status == 'SUCCESS':
                return

            if response_code == '00':
                payment.status = 'SUCCESS'
                payment.transaction_no = params.get('vnp_TransactionNo')
                payment.save()

                # Cập nhật luôn trạng thái thanh toán của order
                if hasattr(payment, 'order'):
                    payment.order.payment_status = 'Paid'
                    payment.order.save()
            else:
                payment.status = 'FAILED'
                payment.save()
                if hasattr(payment, 'order'):
                    payment.order.payment_status = 'Failed'
                    payment.order.save()

    except Payment.DoesNotExist:
        return
