from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from categories.models import Category
from categories.serializers import CategorySerializer
from products.models import Product
from products.serializers import ProductSerializer


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


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_category(request):
    CACHE_KEY = "all_categories"
    cached_data = cache.get(CACHE_KEY)
    if cached_data:
        return JsonResponse({"categories": cached_data}, status=200)

    category = Category.objects.filter(status="Active")
    if not category.exists():
        return JsonResponse({"message": "Danh sách danh mục trống"}, status=400)

    data = CategorySerializer(category, many=True).data
    cache.set(CACHE_KEY, data, timeout=86400)
    return JsonResponse({"categories": data}, status=200)