from django.urls import path
from reviews.admin_views import views

urlpatterns = [
    path('all-reviews/', views.get_all_reviews),
    path('update-review/<int:review_id>/', views.update_review),
]