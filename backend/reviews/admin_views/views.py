from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from reviews.models import Review
from reviews.serializers import ReviewSerializer
from utils.delete_cache import delete_review_cache


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reviews(request):
    try:
        KEY = f"all_reviews"
        reviews = cache.get(KEY)

        if reviews is None:
            reviews_qs = Review.objects.select_related(
                'product'
            ).prefetch_related(
                'account__user'
            ).all().order_by('-review_date')

            reviews = ReviewSerializer(reviews_qs, many=True).data
            cache.set(KEY, reviews, timeout=86400)

        return JsonResponse({
            "success": True,
            "data": reviews,
            "count": len(reviews)
        }, status=200)
    except Exception as e:
        print(f"Error: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_review(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
        review.is_browse = True
        delete_review_cache()

        return JsonResponse({
            "success": True,
            "message": f"Đã duyệt đánh giá số {review_id}"
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)