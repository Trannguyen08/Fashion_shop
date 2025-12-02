from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from categories.models import Category
from categories.serializers import CategorySerializer
from utils.delete_product_cache import delete_cache

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_category(request):
    CACHE_KEY = "all_categories"
    cached_data = cache.get(CACHE_KEY)
    if cached_data:
        return JsonResponse({"categories": cached_data}, status=200)

    category = Category.objects.all()
    if not category.exists():
        return JsonResponse({"message": "Danh sách danh mục trống"}, status=400)

    data = CategorySerializer(category, many=True).data
    cache.set(CACHE_KEY, data, timeout=86400)
    return JsonResponse({"categories": data}, status=200)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_category(request):
    try:
        data = request.data
        category_name = data.get('name')

        if not category_name:
            return JsonResponse({"error": "Category name is required."},status=400)

        category = Category.objects.create(
            name=category_name,
            status="Active"
        )
        category.save()
        cache.delete("all_categories")
        delete_cache()

        serializer = CategorySerializer(category)
        return JsonResponse(
            {"message": "Category created successfully.", "category": serializer.data},status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)},status=500)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_category(request, category_id):
    try:
        data = request.data
        category_name = data.get('category_name')
        status_value = data.get('status')  # Optional: cho phép update trạng thái

        # Tìm category
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return JsonResponse({"error": "Category not found."}, status=404)

        if category_name:
            category.name = category_name
        if status_value:
            category.status = status_value
        category.save()

        cache.delete("all_categories")
        delete_cache()

        serializer = CategorySerializer(category)
        return JsonResponse({"message": "Category updated successfully.", "category": serializer.data}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_category(request, category_id):
    try:
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return JsonResponse({"error": "Category not found."}, status=404)

        category.delete()
        cache.delete("all_categories")
        delete_cache()

        return JsonResponse({"message": "Category deleted successfully."}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
