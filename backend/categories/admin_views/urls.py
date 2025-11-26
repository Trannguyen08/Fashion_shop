from django.urls import path
from categories.admin_views import views

urlpatterns = [
    path('all-category/', views.get_all_category, name="get_all_category"),
    path('add/', views.add_category, name="add_category"),
    path('update/<int:category_id>/', views.update_category, name="update_category"),
    path('delete/<int:category_id>/', views.delete_category, name="delete_category")
]