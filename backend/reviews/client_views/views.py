from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from orders.models import Order
from products.models import Product
from reviews.models import Review
from reviews.serializers import ReviewSerializer
from utils.delete_cache import delete_review_cache


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request):
    try:
        data = request.data
        user = request.user
        order_id = data.get("order_id")

        order = Order.objects.prefetch_related('items__product_variant__product').get(id=order_id)

        # Verify ownership
        if order.customer != user:
            return JsonResponse({
                "success": False,
                "message": "You don't have permission to review this order"
            }, status=403)

        reviews_created = []

        # Create review for each item
        for order_item in order.items.all():
            product = order_item.product_variant.product

            if Review.objects.filter(account=user, product=product).exists():
                continue

            review = Review.objects.create(
                account=user,
                product=product,
                rating=data.get("rating"),
                comment=data.get("comment", "")
            )
            reviews_created.append(product.name)

        if not reviews_created:
            return JsonResponse({
                "success": False,
                "message": "All products in this order have already been reviewed"
            }, status=400)

        order.is_rating = True
        order.save()
        delete_review_cache()

        return JsonResponse({
            "success": True,
            "message": f"Đã thêm đánh giá cho {len(reviews_created)} sản phẩm",
            "products": reviews_created
        }, status=201)

    except Order.DoesNotExist:
        return JsonResponse({
            "success": False,
            "message": "Order not found"
        }, status=404)

    except Exception as e:
        print(str(e))
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reviews_by_product_id(request, product_id):
    try:
        KEY = f"all_reviews_{product_id}"
        reviews = cache.get(KEY)

        if reviews is None:
            product_qs = Product.objects.get(id=product_id)
            reviews_qs = Review.objects.filter(product=product_qs
            ).select_related(
                'product'
            ).prefetch_related(
                'account__user'
            ).filter(status='approved').order_by('-review_date')
            reviews = ReviewSerializer(reviews_qs, many=True).data
            cache.set(KEY, reviews, timeout=86400)

        return JsonResponse({
            "success": True,
            "data": reviews
        }, status=200)
    except Exception as e:
        return JsonResponse({
            "success": False,
            "message": str(e)
        }, status=500)




