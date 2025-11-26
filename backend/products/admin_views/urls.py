from django.urls import path
from products.admin_views import views

urlpatterns = [
    path('all-product/', views.get_all_product, name="get_all_product"),
    path('add/', views.add_product, name="add_product"),
    path('update/<int:product_id>/', views.update_product, name="update_product"),
    path('update/status/<int:product_id>/', views.update_status, name="update_product")

]