from django.urls import path
from . import views

urlpatterns = [
    path('get_all/', views.get_all_product, name="get_all_product"),
    path('get_home_products/', views.get_home_product, name="get_all_product"),
]