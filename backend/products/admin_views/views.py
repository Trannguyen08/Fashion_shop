from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAdminUser
from django.core.cache import cache
from ..models import Product, Category, ProductVariant, ProductImage
from ..serializers import ProductSerializer
import json
from decouple import config
from utils.delete_cache import delete_product_cache


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_product(request):
    page_number = request.query_params.get('page', 1)
    products = Product.objects.select_related("category") \
        .prefetch_related("product_imgs", "product_variants") \
        .all().order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 5
    result_page = paginator.paginate_queryset(products, request)

    serializer = ProductSerializer(result_page, many=True)
    data = {
        "products": serializer.data,
        "total_pages": paginator.page.paginator.num_pages,
        "current_page": paginator.page.number,
        "total_items": paginator.page.paginator.count
    }

    return JsonResponse(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_product(request):
    try:
        print(config("API_CLOUD_KEY"))
        print("REQUEST POST:", request.POST)
        print("REQUEST FILES:", request.FILES)

        # ✅ Dùng request.POST thay vì request.data
        data = request.POST
        category = Category.objects.get(id=data.get("category"))

        old_price = data.get("old_price")
        current_price = data.get("current_price")

        try:
            old_price = float(old_price) if old_price else None
            current_price = float(current_price) if current_price else 0
        except (ValueError, TypeError):
            return JsonResponse({"error": "Giá không hợp lệ"}, status=400)

        product = Product.objects.create(
            category=category,
            name=data.get("name"),
            old_price=old_price,
            current_price=current_price,
            description=data.get("description", ""),
            status=data.get("status", "Active"),
            is_new=str(data.get("isNew", "false")).lower() == "true",
            is_featured=str(data.get("isFeatured", "false")).lower() == "true",
        )

        main_img = request.FILES.get("mainImage")
        if main_img:
            product.product_img = main_img
            product.save()

        extra_images = request.FILES.getlist("related_images")
        for img in extra_images:
            ProductImage.objects.create(product=product, PI_img=img)

        total_stock = 0
        variants_json = data.get("variants")
        if variants_json:
            try:
                variants = json.loads(variants_json)
                for i, v in enumerate(variants):
                    if not all([v.get("sku"), v.get("size"), v.get("color")]):
                        continue
                    stock = int(v.get("stock", 0))
                    total_stock += stock
                    pv_img = request.FILES.get(f"variant_images_{i}")
                    ProductVariant.objects.create(
                        product=product,
                        sku=v.get("sku"),
                        size=v.get("size"),
                        color=v.get("color"),
                        stock_quantity=stock,
                        status=v.get("status", "Active"),
                        PV_img=pv_img,
                    )

            except json.JSONDecodeError:
                return JsonResponse({"error": "Variants JSON không hợp lệ"}, status=400)

        product.stock_quantity = total_stock
        product.update_status_by_stockq()
        product.save()

        serializer = ProductSerializer(product)
        delete_product_cache()

        return JsonResponse({
            "message": "Thêm sản phẩm thành công",
            **serializer.data
        }, status=201)

    except Exception as e:
        import traceback
        print("ERROR:", traceback.format_exc())
        return JsonResponse({"error": f"Lỗi server: {str(e)}"}, status=500)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_product(request, product_id):
    try:
        print("REQUEST POST:", request.POST)
        print("REQUEST FILES:", request.FILES)
        data = request.data
        product = Product.objects.get(id=product_id)
        category = Category.objects.get(id=data.get("category"))

        # Update basic product info
        product.category = category
        product.name = data.get("name")
        product.old_price = data.get("old_price") or None
        product.current_price = data.get("current_price")
        product.description = data.get("description", "")
        product.status = data.get("status")
        product.is_new = str(data.get("isNew")).lower() == "true"
        product.is_featured = str(data.get("isFeatured")).lower() == "true"

        # MAIN IMAGE - Chỉ update nếu có file mới
        main_img = request.FILES.get("mainImage")
        if main_img:
            product.product_img = main_img
        # Nếu không có file mới nhưng có mainImage_url thì giữ nguyên (không làm gì)
        # Nếu cả 2 đều không có thì có thể xóa ảnh chính
        elif not data.get("mainImage_url"):
            product.product_img = None

        product.save()

        # RELATED IMAGES - Xử lý cả ảnh cũ và mới
        product.product_imgs.all().delete()

        # Thêm lại các ảnh cũ (nếu có)
        existing_images = data.get("existing_related_images")
        if existing_images:
            try:
                existing_urls = json.loads(existing_images)
                for url in existing_urls:
                    # Tạo ProductImage với URL cũ (không upload lại)
                    ProductImage.objects.create(product=product, PI_img=url)
            except json.JSONDecodeError:
                pass

        # Thêm các ảnh mới được upload
        new_extra_images = request.FILES.getlist("related_images")
        for img in new_extra_images:
            ProductImage.objects.create(product=product, PI_img=img)

        # VARIANTS - Xử lý cả ảnh cũ và mới
        product.product_variants.all().delete()
        total_stock = 0
        variants_json = data.get("variants")
        if variants_json:
            variants = json.loads(variants_json)
            for i, v in enumerate(variants):
                stock = int(v.get("stock", 0))
                total_stock += stock

                # Ưu tiên file mới, nếu không có thì dùng URL cũ
                PV_img_file = request.FILES.get(f"variant_images_{i}")
                PV_img_url = v.get("image_url")

                if PV_img_file:
                    # Có file mới → upload file
                    PV_img = PV_img_file
                elif PV_img_url:
                    # Không có file mới nhưng có URL cũ → giữ nguyên URL
                    PV_img = PV_img_url
                else:
                    # Không có gì cả
                    PV_img = None

                ProductVariant.objects.create(
                    product=product,
                    sku=v.get("sku"),
                    size=v.get("size"),
                    color=v.get("color"),
                    stock_quantity=stock,
                    status=v.get("status", "Active"),
                    PV_img=PV_img,
                )

        # Update stock
        product.stock_quantity = total_stock
        product.update_status_by_stockq()
        product.save()

        serializer = ProductSerializer(product)
        delete_product_cache()

        return JsonResponse({
            "message": "Cập nhật sản phẩm thành công!",
            **serializer.data
        }, status=200)

    except Product.DoesNotExist:
        return JsonResponse({"error": "Product không tồn tại"}, status=404)
    except Category.DoesNotExist:
        return JsonResponse({"error": "Category không tồn tại"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_status(request, product_id):
    try:
        status_value = request.data.get("status")

        if status_value is None:
            return JsonResponse({"error": "Thiếu status"}, status=400)

        product = Product.objects.get(id=product_id)
        product.status = status_value
        product.save()

        delete_product_cache()

        return JsonResponse({
            "message": "Cập nhật trạng thái thành công!",
            "product_id": product.id
        }, status=200)

    except Product.DoesNotExist:
        return JsonResponse({"error": "Product không tồn tại"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
