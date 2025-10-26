from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Account
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        full_name = data.get("full_name")
        password = data.get("password")
        email = data.get("email")
        phone = data.get("phone")

        if Account.objects.filter(email=email).exists() | Account.objects.filter(phone=phone).exists():
            return JsonResponse({"error": "Số điện thoại hoặc email đã tồn tại"}, status=400)
        user = Account.objects.create_user(full_name=full_name, password=password, email=email, phone=phone)
        return JsonResponse({"message": "Đăng ký thành công"})
    return JsonResponse({"error": "Phương thức không hợp lệ"})


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body.decode('utf-8'))
        username = data.get("username")
        password = data.get("password")
        user = Account.objects.filter(Q(phone=username) | Q(email=username)).first()

        if user is None:
            return JsonResponse({'error': 'Số điện thoại hoặc email không tồn tại'}, status=400)

        if not user.check_password(password):
            return JsonResponse({'error': 'Mật khẩu không chính xác'}, status=400)

        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "message": "Đăng nhập thành công",
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user" : {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role
            }
        })
    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)
