from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from accounts.models import Account, User
from accounts.serializers import UserSerializer
from utils.delete_cache import delete_account_cache


@api_view(['POST'])
@permission_classes([IsAdminUser])
def change_account_status(request, account_id):
    try:
        new_status = request.data.get("status")

        if not new_status:
            return JsonResponse({"error": "Thiếu trạng thái mới"}, status=400)

        account = Account.objects.filter(id=account_id).first()

        if not account:
            return JsonResponse({"error": "Không tìm thấy tài khoản"}, status=404)

        # Cập nhật trạng thái
        if new_status=="Active":
            account.is_active = 1
        else:
            account.is_active = 0
        account.save()

        delete_account_cache(account_id)

        return JsonResponse({
            "message": "Cập nhật trạng thái thành công",
            "account_id": account.id,
            "new_status": "Active" if account.is_active else "Inactive"
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    try:
        KEY = "all_users"
        users = cache.get(KEY)
        if users is None:
            users = User.objects.select_related('user').all()
        serializer = UserSerializer(users, many=True)
        cache.set(KEY, serializer.data, timeout=86400)
        return JsonResponse({
                "customers": serializer.data,
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)