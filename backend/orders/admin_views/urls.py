from django.urls import path
from orders.admin_views import views

urlpatterns = [
    path('all-orders/', views.get_all_orders_admin),
    path('update/<int:order_id>/', views.update_order_status_admin),
]
