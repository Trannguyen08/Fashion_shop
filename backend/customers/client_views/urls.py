from django.urls import path
from customers.client_views import views

urlpatterns = [
    path('address/add/<int:account_id>/', views.add_address),
    path('address/update/<int:address_id>/', views.update_address),
    path('address/delete/<int:address_id>/', views.delete_address),
    path('address/get-all/<int:account_id>/', views.get_all_address),
]
