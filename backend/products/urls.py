from django.urls import path
from . import views

urlpatterns = [
    path('all-product/', views.get_all_product, name="get_all_product"),
    path('best-seller/', views.get_bs_products, name="get_bs_product"),
    path('new-arrival/', views.get_new_products, name="get_new_product"),
    path('get_home_products/', views.get_home_product, name="get_home_product"),
    path('category/<str:category_name>/', views.get_product_by_category, name='get_product_by_category'),
]