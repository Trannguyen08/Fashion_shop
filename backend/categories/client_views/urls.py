from django.urls import path
from categories.client_views import views

urlpatterns = [
    path('all-category/', views.get_all_category),
    path('<category_name>/', views.get_product_by_category),
]