from django.urls import path
from accounts.admin_views import views

urlpatterns = [
    path('update-status/<int:account_id>/', views.change_account_status),
    path('all-customers/', views.get_all_users)
]