from django.urls import path
from .views import create_order

urlpatterns = [
    path('add/', create_order, name='add-order'),
]
