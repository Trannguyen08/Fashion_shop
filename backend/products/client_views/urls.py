from django.urls import path
from products.client_views import views

urlpatterns = [
    path('all-product/', views.get_all_product, name="get_all_product"),
    path('best-seller/', views.get_bs_products, name="get_bs_product"),
    path('new-arrival/', views.get_new_products, name="get_new_product"),
    path('get_home_products/', views.get_home_product, name="get_home_product"),
    path('search/', views.get_search_products),
]