from django.urls import path
from . import views

urlpatterns = [
    path('<int:user_id>/', views.get_cart_by_userid, name="get_cart"),
    path('<int:user_id>/add/', views.add_to_cart, name='add_to_cart'),
    path('<int:user_id>/item/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('<int:user_id>/item/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
]