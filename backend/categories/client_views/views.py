import logging
from django.core.cache import cache
from django.db.models import Prefetch
from django.http import JsonResponse
from django.utils.text import slugify
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from categories.models import Category
from categories.serializers import CategorySerializer
from products.models import Product, ProductImage, ProductVariant
from products.serializers import ProductSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_category(request, category_name):
    # Cache key
    normalized_name = category_name.lower().strip().replace(" ", "-")
    CACHE_KEY = f"category_products_{normalized_name}"

    # Kiểm tra cache
    cached_data = cache.get(CACHE_KEY)
    if cached_data is not None:
        logger.info(f"Cache hit: {category_name}")
        return JsonResponse(cached_data, status=200)

    logger.info(f"Cache miss: {category_name}")

    # Tìm category
    category = find_category_by_identifier(category_name)
    if not category:
        return JsonResponse({
            "success": False,
            "error": f"Không tìm thấy category: {category_name}"
        }, status=404)

    try:
        products_qs = (
            Product.objects
            .filter(category=category)
            .select_related("category")
            .prefetch_related("product_imgs", "product_variants")
            .order_by("-created_at")
        )

        # Serialize
        products_data = ProductSerializer(products_qs, many=True).data

        # Response
        response_data = {
            "success": True,
            "category": {
                "id": category.id,
                "name": category.name,
            },
            "products": products_data,
            "total": len(products_data)
        }

        # Cache 6 giờ
        cache.set(CACHE_KEY, response_data, timeout=60 * 60 * 6)
        logger.info(f"Cached {len(products_data)} products for: {category.name}")

        return JsonResponse(response_data, status=200)

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": "Lỗi khi lấy sản phẩm"
        }, status=500)


def find_category_by_identifier(identifier):
    identifier_lower = identifier.lower().strip()
    category = Category.objects.filter(name__iexact=identifier_lower).first()
    if category:
        return category

    # 2. Tìm theo name với các biến thể
    name_variants = [
        identifier,
        identifier.replace("-", " "),
        identifier.replace("-", " ").title(),
        identifier.replace("_", " ").title(),
    ]

    for name_variant in name_variants:
        category = Category.objects.filter(name__iexact=name_variant).first()
        if category:
            return category

    # 3. Tìm bằng generated slug
    all_categories = Category.objects.all()
    for cat in all_categories:
        if slugify(cat.name) == identifier_lower:
            return cat

    return None

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