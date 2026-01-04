from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from products.models import Product
from products.serializers import ProductSerializer
from reviews.models import Review
from reviews.serializers import ReviewSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_product(request):
    ALL_PRODUCTS_KEY = "all_products"
    alls = cache.get(ALL_PRODUCTS_KEY)
    if alls is None:
        products = Product.objects.select_related("category").prefetch_related(
            'product_imgs','product_variants'
        ).filter(status="Active")
        alls = ProductSerializer(products, many=True).data
        cache.set(ALL_PRODUCTS_KEY, alls, timeout=86400)

        if not products.exists():
            return JsonResponse(
                {"message": "Danh sách sản phẩm trống"},
                status=200
            )
    return JsonResponse(
         {"products": alls},
         status=200,
         safe=False
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_product(request):
    FEATURED_KEY = "home_featured_products"
    NEW_KEY = "home_new_products"
    REVIEW_KEY = "home_review"

    cache.delete(REVIEW_KEY)
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
        review_qs = Review.objects.filter(status="approved"
                    ).select_related(
                        'product'
                    ).prefetch_related(
                        'account__user'
                    ).all().order_by('-review_date')[:4]
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
def get_search_products(request):
    search = request.GET.get('q', '')
    if not search:
        return JsonResponse({'products': []})
    KEY = f"search_products_{search}"
    bs_product = cache.get(KEY)

    if bs_product is None:
        product_qs = Product.objects.select_related("category").prefetch_related(
            'product_imgs', 'product_variants'
        ).filter(
            Q(name__icontains=search) |
            Q(product_variants__sku__icontains=search)
        ).distinct()
        bs_product = ProductSerializer(product_qs, many=True).data
        cache.set(KEY, bs_product, timeout=86400)

    return JsonResponse({
        'products': bs_product,
    }, status=200)


