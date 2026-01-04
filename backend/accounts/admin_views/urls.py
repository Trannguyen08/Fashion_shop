from django.urls import path
from accounts.admin_views import views

urlpatterns = [
    path('all-customers/', views.get_all_customers),
    path('update-status/<int:account_id>/', views.toggle_account_status),
]