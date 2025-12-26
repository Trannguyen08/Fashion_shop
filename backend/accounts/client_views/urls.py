from django.urls import path
from accounts.client_views import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_view),
    path('token/refresh/', views.refresh_token_view),
    path('info/<int:account_id>/', views.get_user_info),
    path('update-info/<int:account_id>/', views.update_user_info),
    path('change-password/<int:account_id>/', views.change_password),
    path('send-otp/', views.send_otp),
    path('verify-otp/', views.verify_otp),
    path('reset-password/', views.reset_password),
]