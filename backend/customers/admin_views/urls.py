# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('details/<int:account_id>/', views.get_user_detail),
]