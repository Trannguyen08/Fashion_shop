from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from .models import Product, Review, Category
from .serializers import ProductSerializer, ReviewSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_product(request):
    """Récupère tous les produits avec leurs relations"""
    try:
        products = Product.objects.select_related("category").prefetch_related(
            'product_imgs','product_variants'
        ).all()

        if not products.exists():
            return JsonResponse(
                {"message": "Danh sách sản phẩm trống"},
                status=200
            )

        serializer = ProductSerializer(products, many=True)
        return JsonResponse(
            {"products": serializer.data},
            status=200,
            safe=False
        )
    except Exception as e:
        return JsonResponse(
            {
                'error': 'Lỗi truy cập dữ liệu',
                'detail': str(e)
            },
            status=500
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_product(request):
    FEATURED_KEY = "home_featured_products"
    NEW_KEY = "home_new_products"
    REVIEW_KEY = "home_review"

    featured = cache.get(FEATURED_KEY)
    news = cache.get(NEW_KEY)
    reviews = cache.get(REVIEW_KEY)

    if featured is None:
        feature_qs = Product.objects.select_related("category").prefetch_related(
            'product_imgs','product_variants'
        ).filter(is_featured=True)[:4]
        featured = ProductSerializer(feature_qs, many=True).data
        cache.set(FEATURED_KEY, featured, timeout=86400)

    if news is None:
        new_qs = Product.objects.select_related(
            "category"
        ).prefetch_related(
            'product_imgs',
            'product_variants'
        ).filter(is_new=True)[:4]
        news = ProductSerializer(new_qs, many=True).data
        cache.set(NEW_KEY, news, timeout=86400)

    if reviews is None:
        review_qs = Review.objects.select_related(
            'account'
        ).order_by('-rating')[:4]
        reviews = ReviewSerializer(review_qs, many=True).data
        cache.set(REVIEW_KEY, reviews, timeout=86400)

    return JsonResponse({
        "featured": featured,
        "new": news,
        "reviews": reviews
    }, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_new_products(request):
    NEW_PRODUCT_KEY = "new_products"
    all_product = cache.get(NEW_PRODUCT_KEY)

    if all_product is None:
        product_qs = Product.objects.select_related("category").prefetch_related(
            'product_imgs','product_variants'
        ).filter(is_new=True)
        all_product = ProductSerializer(product_qs, many=True).data
        cache.set(NEW_PRODUCT_KEY, all_product, timeout=86400)

    return JsonResponse({
        'products': all_product,
    }, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_bs_products(request):
    BS_PRODUCT_KEY = "bs_products"
    bs_product = cache.get(BS_PRODUCT_KEY)

    if bs_product is None:
        product_qs = Product.objects.select_related("category").prefetch_related(
            'product_imgs', 'product_variants'
        ).filter(is_new=True)[:32]
        bs_product = ProductSerializer(product_qs, many=True).data
        cache.set(BS_PRODUCT_KEY, bs_product, timeout=86400)

    return JsonResponse({
        'products': bs_product,
    }, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_category(request, category_name):
    CATEGORY_KEY = f"category_{category_name.lower()}"
    products = cache.get(CATEGORY_KEY)

    if products is None:
        try:
            category = Category.objects.get(name__iexact=category_name)
        except Category.DoesNotExist:
            return JsonResponse(
                {"error": "Category không tồn tại."},
                status=404
            )

        product_qs = (
            Product.objects
            .filter(category=category)
            .select_related("category")
            .prefetch_related("product_imgs", "product_variants")
            .order_by("-created_at")
        )

        products = ProductSerializer(product_qs, many=True).data
        cache.set(CATEGORY_KEY, products, timeout=60 * 60 * 6)

    return JsonResponse({"products": products}, status=200)
