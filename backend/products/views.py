from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from .models import Product, Review
from .serializers import ProductSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_product(request):
    try:
        products = Product.objects.select_related("category").prefetch_related('product_imgs', 'product_variants')
        if not products.exists():
            return JsonResponse({"message": "Danh sách sản phẩm trống"}, status=200)
        serializer = ProductSerializer(products, many=True)
        return JsonResponse(serializer.data)
    except IOError:
        return JsonResponse({'error': 'Lỗi truy cập dữ liệu'})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_product(request):
    FEATURED_KEY = "home_featured_products"
    NEW_KEY = "home_new_products"
    REVIEW_KEY = "home_review"

    featured = cache.get(FEATURED_KEY)
    news = cache.get(NEW_KEY)
    reviews = cache.get(REVIEW_KEY)

    if featured is None or news is None or reviews is None:
        feature_qs = Product.objects.filter(is_featured=True)[:4]
        new_qs = Product.objects.filter(is_new=True)[:4]
        review_qs = Review.objects.order_by("rating")[:4]

        featured_products = ProductSerializer(feature_qs, many=True).data
        new_products = ProductSerializer(new_qs, many=True).data


        cache.set(FEATURED_KEY, featured, timeout=86400)
        cache.set(NEW_KEY, new_products, timeout=86400)

    return JsonResponse({
        "featured": featured_products,
        "new": new_products
    })



