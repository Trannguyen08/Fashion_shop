from json import JSONDecodeError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Account
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        phone = data.get("phone")

        if Account.objects.filter(email=email).exists() | Account.objects.filter(phone=phone).exists():
            return JsonResponse({"error": "Số điện thoại hoặc email đã tồn tại"}, status=400)
        user = Account.objects.create_user(username=username, password=password, email=email, phone=phone)
        return JsonResponse({"message": "Đăng ký thành công"})
    return JsonResponse({"error": "Phương thức không hợp lệ"})


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        username = data.get("username")
        password = data.get("password")
        user = Account.objects.filter(Q(username=username)).first()

        if user is None:
            return JsonResponse({'error': 'Account không tồn tại'}, status=400)

        if not user.check_password(password):
            return JsonResponse({'error': 'Mật khẩu không chính xác'}, status=400)

        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "message": "Đăng nhập thành công",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user" : {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'role': user.role
            }
        })
    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def refresh_token_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode('utf-8'))
            refresh_token_str = data.get("refresh_token")
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dữ liệu JSON không hợp lệ'}, status=400)

        if not refresh_token_str:
            return JsonResponse({'error': 'Thiếu refresh token'}, status=400)

        try:
            refresh = RefreshToken(refresh_token_str)
            new_access_token = str(refresh.access_token)
            new_refresh_token = str(RefreshToken.for_user(refresh.user))
            return JsonResponse({"access_token" : new_access_token, "refresh" : new_refresh_token})
        except TokenError as e:
            return JsonResponse({'error': f'Refresh Token không hợp lệ: {e}'}, status=401)

    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)
