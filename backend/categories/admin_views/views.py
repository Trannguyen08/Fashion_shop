from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from categories.models import Category
from categories.serializers import CategorySerializer
from utils.delete_cache import delete_product_cache

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_category(request):
    category = Category.objects.all()
    data = CategorySerializer(category, many=True).data
    return JsonResponse({
        "success": True,
        "data": data},
    status=200)


@api_view(['POST'])
@permission_classes([IsAdminUser])
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
        delete_product_cache()

        serializer = CategorySerializer(category)
        return JsonResponse(
            {"message": "Category created successfully.", "category": serializer.data},status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)},status=500)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
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
        delete_product_cache()

        serializer = CategorySerializer(category)
        return JsonResponse({"message": "Category updated successfully.", "category": serializer.data}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



