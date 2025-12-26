from django.urls import path
from orders.client_views import views

urlpatterns = [
    path('create-order/', views.create_order),
    path('all-orders/', views.get_user_order),
    path('cancel-order/<int:order_id>/', views.cancel_order),
    path('get-order-payment/<int:order_id>/', views.get_order_payment_status),
]
