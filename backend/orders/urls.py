from django.urls import path
from orders import views

urlpatterns = [
    path('create-order/', views.create_order),
    path('all-orders/', views.get_user_order),
    path('cancel-order/<int:order_id>/', views.cancel_order),
]
