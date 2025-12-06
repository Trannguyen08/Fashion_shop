from django.urls import path
from accounts.client_views import views

urlpatterns = [
    path('register/', views.register, name="register"),
    path('login/', views.login_view, name="login"),
    path('token/refresh/', views.refresh_token_view, name='token_refresh'),
    path('info/<int:account_id>/', views.get_user_info),
    path('update-info/<int:account_id>/', views.update_user_info),
    path('change-password/<int:account_id>/', views.change_password)
]