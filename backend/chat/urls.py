from django.urls import path
from . import views

urlpatterns = [

    # ADMIN
    path("api/customers/", views.admin_sidebar_customers),
    path("api/<int:customer_id>/messages/", views.admin_get_messages),
    path("api/room/<int:room_id>/send/", views.admin_send_message),

    # USER
    path("messages/", views.user_get_messages),
    path("room/<int:room_id>/send/", views.user_send_message),
]
