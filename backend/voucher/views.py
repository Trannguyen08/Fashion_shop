from django.utils import timezone
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.core.cache import cache
from utils.delete_cache import delete_voucher_cache
from .models import Voucher, UserVoucher
from .serializers import VoucherSerializer, UserVoucherSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny


# --- ADMIN VOUCHER ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_list_vouchers(request):
    vouchers = Voucher.objects.all().order_by('-created_at')
    serializer = VoucherSerializer(vouchers, many=True)
    return JsonResponse({
        "success": True,
        "data": serializer.data,
        "message": "Danh sách voucher cho admin"
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_voucher(request):
    serializer = VoucherSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        delete_voucher_cache()
        return JsonResponse({
            "success": True,
            "data": serializer.data,
            "message": "Tạo voucher thành công"
        }, status=201)
    return JsonResponse({
        "success": False,
        "data": serializer.errors,
        "message": "Lỗi tạo voucher"
    }, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def admin_edit_voucher(request, voucher_id):
    voucher = get_object_or_404(Voucher, id=voucher_id)
    serializer = VoucherSerializer(voucher, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        delete_voucher_cache()
        return JsonResponse({
            "success": True,
            "data": serializer.data,
            "message": "Cập nhật voucher thành công"
        }, status=200)
    return JsonResponse({
        "success": False,
        "data": serializer.errors,
        "message": "Lỗi cập nhật voucher"
    }, status=400)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_hide_voucher(request):
    voucher_id = request.data.get("id")
    voucher = get_object_or_404(Voucher, id=voucher_id)
    if voucher.is_active:
        voucher.is_active = False
    voucher.is_active = True
    voucher.save()
    delete_voucher_cache()
    return JsonResponse({
        "success": True,
        "data": {"id": voucher.id, "code": voucher.code},
        "message": f"Voucher {voucher.code} đã bị ẩn"
    }, status=200)


# --- USER VOUCHER ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_active_vouchers(request):
    from django.core.cache import cache
    now = timezone.now()
    key = f"user_active_vouchers_{request.user.id}"
    data = cache.get(key)

    if not data:
        # FIX: Thay uservoucher -> user_vouchers
        vouchers = Voucher.objects.filter(
            user_vouchers__user=request.user,
            is_active=True,
            end_date__gte=now,
            used_count__lt=F("quantity")
        ).order_by('end_date')
        serializer = VoucherSerializer(vouchers, many=True)
        data = serializer.data
        cache.set(key, data, timeout=3600)

    return JsonResponse({
        "success": True,
        "data": data,
        "message": "Danh sách voucher còn hiệu lực của bạn"
    }, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_vouchers(request):
    now = timezone.now()
    key = "all_active_vouchers"
    data = cache.get(key)

    if not data:
        vouchers = Voucher.objects.filter(
            is_active=True,
            end_date__gte=now,
            used_count__lt=F("quantity")
        ).order_by('end_date')
        serializer = VoucherSerializer(vouchers, many=True)
        data = serializer.data
        cache.set(key, data, timeout=3600)

    return JsonResponse({
        "success": True,
        "data": data,
        "message": "Danh sách voucher còn hiệu lực"
    }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_collect_voucher(request, voucher_id):
    voucher = get_object_or_404(Voucher, id=voucher_id)

    if not voucher.is_valid():
        return JsonResponse({
            "success": False,
            "data": {},
            "message": "Voucher không còn hiệu lực"
        }, status=400)

    obj, created = UserVoucher.objects.get_or_create(
        user=request.user,
        voucher=voucher
    )

    delete_voucher_cache(request.user.id)

    if not created:
        return JsonResponse({
            "success": False,
            "data": {},
            "message": "Bạn đã lưu voucher này rồi"
        }, status=400)

    return JsonResponse({
        "success": True,
        "data": {"voucher_id": voucher.id, "code": voucher.code},
        "message": "Lưu voucher thành công"
    }, status=201)