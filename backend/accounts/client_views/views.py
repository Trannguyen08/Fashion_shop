from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.models import Account, User
from accounts.serializers import UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    phone = data.get("phone")
    full_name = data.get("full_name")

    # Kiểm tra username đã tồn tại
    if Account.objects.filter(username=username).exists():
        return JsonResponse({"error": "Tên tài khoản đã tồn tại"}, status=400)

    # Kiểm tra email và phone đã tồn tại
    if User.objects.filter(Q(email=email) | Q(phone=phone)).exists():
        return JsonResponse({"error": "Số điện thoại hoặc email đã tồn tại"}, status=400)

    try:
        # Tạo Account
        account = Account.objects.create_user(username=username, password=password)

        # Tạo User liên kết
        user = User.objects.create(
            account=account,
            full_name=full_name or username,
            email=email,
            phone=phone
        )

        refresh = RefreshToken.for_user(account)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        user_data = {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "avatar_img": user.avatar_img,
        }

        return JsonResponse({
            "message": "Đăng ký thành công",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user_data
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    data = request.data
    username = data.get("username")
    password = data.get("password")

    # Tìm Account theo username
    account = Account.objects.filter(username=username).first()
    if account is None:
        return JsonResponse({'error': 'Tài khoản không tồn tại'}, status=400)

    if not account.check_password(password):
        return JsonResponse({'error': 'Mật khẩu không chính xác'}, status=400)

    # Lấy User liên kết
    user = User.objects.filter(account=account).first()

    # Tạo token
    refresh = RefreshToken.for_user(account)

    return JsonResponse({
        "message": "success",
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "user": {
            'id': account.id,
            'username': account.username,
            'full_name': user.full_name if user else None,
            'email': user.email if user else None,
            'phone': user.phone if user else None,
            'role': account.role,
            'avatar_img': user.avatar_img if user else None
        }
    }, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token_str = request.data.get("refresh_token")

    if not refresh_token_str:
        return JsonResponse({'error': 'Thiếu refresh token'}, status=400)

    try:
        refresh = RefreshToken(refresh_token_str)

        account_id = refresh.get("account_id")
        if account_id is None:
            return JsonResponse({'error': 'Refresh Token không chứa account_id'}, status=401)

        # Lấy user từ DB
        user = Account.objects.get(id=account_id)

        new_refresh = RefreshToken.for_user(user)
        new_access = new_refresh.access_token

        return JsonResponse({
            "access_token": str(new_access),
            "refresh_token": str(new_refresh)
        }, status=200)

    except TokenError:
        return JsonResponse({'error': 'Refresh Token không hợp lệ'}, status=401)

    except Account.DoesNotExist:
        return JsonResponse({'error': 'User không tồn tại'}, status=404)


@api_view(['GET'])
def get_user_info(request, account_id):
    try:
        cache_key = f"user_{account_id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return JsonResponse({"user": cached_data}, status=200)

        user = User.objects.get(account_id=account_id)
        serializer = UserSerializer(user)
        cache.set(cache_key, serializer.data, timeout=86400)

        return JsonResponse({"user": serializer.data}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"error": "User không tồn tại"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
def update_user_info(request, account_id):
    try:
        user = User.objects.get(account_id=account_id)
        data = request.data

        user.full_name = data.get("full_name", user.full_name)
        user.phone = data.get("phone", user.phone)
        user.email = data.get("email", user.email)
        user.save()

        cache_key = f"user_{account_id}"
        cache.delete(cache_key)

        serializer = UserSerializer(user)
        return JsonResponse({"user": serializer.data, "message": "Cập nhật thành công"}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"error": "User không tồn tại"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([AllowAny])
def change_password(request, account_id):
    try:
        data = request.data

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        account = Account.objects.get(id=account_id)

        if not account.check_password(current_password):
            return JsonResponse({"error": "Mật khẩu hiện tại không chính xác!"}, status=400)

        # Đặt mật khẩu mới
        account.set_password(new_password)
        account.save()

        return JsonResponse({"message": "Đổi mật khẩu thành công!"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

