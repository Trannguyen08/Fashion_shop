from random import random
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.models import Account, User
from accounts.serializers import UserSerializer
from backend import settings
from utils.delete_cache import delete_account_cache


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    phone = data.get("phone")
    full_name = data.get("full_name")
    staff = data.get("is_staff")

    # Kiểm tra username đã tồn tại
    if Account.objects.filter(username=username).exists():
        return JsonResponse({"error": "Tên tài khoản đã tồn tại"}, status=400)

    # Nếu KHÔNG phải staff thì mới cần kiểm tra email / phone
    if not staff and User.objects.filter(Q(email=email) | Q(phone=phone)).exists():
        return JsonResponse({"error": "Số điện thoại hoặc email đã tồn tại"}, status=400)

    try:
        # Tạo Account
        account = Account.objects.create_user(username=username, password=password)

        # Nhánh STAFF
        if staff:
            account.is_staff = True
            account.save()

            refresh = RefreshToken.for_user(account)
            return JsonResponse({
                "message": "Tạo tài khoản STAFF thành công",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "account": {
                    "username": account.username,
                    "is_staff": account.is_staff
                }
            }, status=201)

        # Nhánh NORMAL USER
        user = User.objects.create(
            account=account,
            full_name=full_name or username,
            email=email,
            phone=phone
        )

        refresh = RefreshToken.for_user(account)

        return JsonResponse({
            "message": "Đăng ký thành công",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "avatar_img": user.avatar_img,
            }
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

        account_id = refresh.get("id")
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
@permission_classes([IsAuthenticated])
def get_user_info(request, account_id):
    try:
        cache_key = f"user_{account_id}"
        data = cache.get(cache_key)

        if data is None:
            user = User.objects.get(account_id=account_id)
            data = UserSerializer(user).data
            cache.set(cache_key, data, timeout=86400)

        return JsonResponse({"user": data}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"error": "User không tồn tại"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_info(request, account_id):
    try:
        user = User.objects.get(account_id=account_id)
        data = request.data

        user.full_name = data.get("full_name", user.full_name)
        user.phone = data.get("phone", user.phone)
        user.email = data.get("email", user.email)
        user.save()

        delete_account_cache(account_id)

        serializer = UserSerializer(user)
        return JsonResponse({"user": serializer.data, "message": "Cập nhật thành công"}, status=200)

    except User.DoesNotExist:
        return JsonResponse({"error": "User không tồn tại"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
def change_password(request):
    try:
        data = request.data
        user = request.user

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        account = Account.objects.get(id=user.id)

        if not account.check_password(current_password):
            return JsonResponse({"error": "Mật khẩu hiện tại không chính xác!"}, status=400)

        # Đặt mật khẩu mới
        account.set_password(new_password)
        account.save()

        return JsonResponse({"message": "Đổi mật khẩu thành công!"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# --- 1. GỬI OTP ---
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    email = request.data.get("email")

    user_exists = User.objects.filter(email=email).exists()
    if not user_exists:
        return JsonResponse({"error": "Email này chưa được đăng ký trong hệ thống!"}, status=404)

    otp = str(random.randint(100000, 999999))

    cache.set(f"otp_forgot_{email}", otp, timeout=300)

    try:
        subject = "Mã xác thực khôi phục mật khẩu"
        message = f"Mã OTP của bạn là: {otp}. Mã có hiệu lực trong 5 phút. Vui lòng không cung cấp mã này cho bất kỳ ai."
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        send_mail(subject, message, from_email, recipient_list)

        return JsonResponse({"success": True, "message": "Mã OTP đã được gửi!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": "Không thể gửi email. Vui lòng thử lại sau."}, status=500)


# --- 2. XÁC THỰC OTP ---
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    otp_input = request.data.get("otp")

    cached_otp = cache.get(f"otp_forgot_{email}")

    if cached_otp and cached_otp == otp_input:
        cache.set(f"verified_reset_{email}", True, timeout=300)
        return JsonResponse({"success": True, "message": "Xác thực OTP thành công!"}, status=200)

    return JsonResponse({"error": "Mã OTP không chính xác hoặc đã hết hạn!"}, status=400)


# --- 3. ĐẶT LẠI MẬT KHẨU ---
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get("email")
    password = request.data.get("password")

    is_verified = cache.get(f"verified_reset_{email}")
    if not is_verified:
        return JsonResponse({"error": "Yêu cầu không hợp lệ. Vui lòng xác thực OTP trước!"}, status=403)

    try:
        user_profile = User.objects.get(email=email)
        account = Account.objects.get(id=user_profile.account_id)

        # Cập nhật mật khẩu mới
        account.password = make_password(password)
        account.save()

        # Xóa các cache liên quan sau khi thành công
        cache.delete(f"otp_forgot_{email}")
        cache.delete(f"verified_reset_{email}")

        return JsonResponse({"success": True, "message": "Mật khẩu đã được cập nhật thành công!"}, status=200)
    except Exception as e:
        return JsonResponse({"error": "Đã xảy ra lỗi khi cập nhật mật khẩu."}, status=500)