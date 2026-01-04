# payment/urls.py
from django.urls import path
from .views import create_payment, vnpay_return

urlpatterns = [
    path('create/', create_payment),
    path('vnpay-return/', vnpay_return),
]
