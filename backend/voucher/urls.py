from django.urls import path
from . import views

urlpatterns = [
    # Admin
    path('api/get-all/', views.admin_list_vouchers),
    path('api/add/', views.admin_add_voucher),
    path('api/edit/<int:voucher_id>/', views.admin_edit_voucher),
    path('api/toggle/', views.admin_hide_voucher),

    # User
    path('get-voucher-active/', views.get_active_vouchers),
    path('get-user-voucher/', views.user_active_vouchers),
    path('save/<int:voucher_id>/', views.user_collect_voucher),
]
