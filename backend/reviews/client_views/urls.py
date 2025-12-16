from django.urls import path
from reviews.client_views import views

urlpatterns = [
    path('add-review/', views.add_review),
    path('all-reviews/<int:product_id>/', views.get_all_reviews_by_product_id),
]