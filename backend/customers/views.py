from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import CustomerAddressSerializer
from .models import CustomerAddress
from accounts.models import Account


@api_view(['POST'])
def add_address(request, account_id):
    try:
        account = Account.objects.get(id=account_id)
        data = request.data
        has_address = CustomerAddress.objects.filter(account_id=account_id).exists()
        is_default = data.get("is_default", False) or not has_address
        if is_default:
            CustomerAddress.objects.filter(account_id=account_id).update(is_default=False)

        address = CustomerAddress.objects.create(
            account=account,
            receiver_name=data.get("receiver_name"),
            phone=data.get("phone"),
            province=data.get("province"),
            district = data.get("district"),
            ward=data.get("ward"),
            address_detail=data.get("address_detail"),
            is_default=is_default
        )

        serializer = CustomerAddressSerializer(address)
        cache.delete(f"all_address_{account_id}")

        return JsonResponse({
            "message": "Thêm địa chỉ thành công",
            "address": serializer.data
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
def update_address(request, address_id):
    try:
        address = CustomerAddress.objects.get(id=address_id)
        data = request.data
        is_default = data.get("is_default", False)

        if is_default:
            CustomerAddress.objects.filter(account_id=address.account_id).update(is_default=False)

        address.receiver_name = data.get("receiver_name")
        address.phone = data.get("phone")
        address.province = data.get("province")
        address.ward = data.get("ward")
        address.address_detail = data.get("address_detail")
        address.is_default = is_default
        address.save()
        serializer = CustomerAddressSerializer(address)
        cache.delete(f"all_address_{address.account_id}")

        return JsonResponse({
            "message": "Cập nhật địa chỉ thành công",
            "address": serializer.data
        }, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['DELETE'])
def delete_address(request, address_id):
    try:
        address = CustomerAddress.objects.get(id=address_id)
        acc_id = address.account_id
        address.delete()
        cache.delete(f"all_address_{acc_id}")
        return Response({"message": "Xóa địa chỉ thành công"}, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['GET'])
def get_all_address(request, account_id):
    try:
        KEY = f"all_address_{account_id}"
        data = cache.get(KEY)

        if data is None:
            addresses = CustomerAddress.objects.filter(account_id=account_id).order_by('-is_default', '-created_at')
            serializer = CustomerAddressSerializer(addresses, many=True)
            data = serializer.data
            cache.set(KEY, data, timeout=86400)

        return Response({"addresses": data}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
