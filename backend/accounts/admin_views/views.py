from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAdminUser
from accounts.models import Account, User
from accounts.serializers import UserSerializer, CustomerListSerializer
from utils.delete_cache import delete_account_cache


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_customers(request):
    try:
        customers = Account.objects.filter(role='customer').select_related().prefetch_related('user')
        serializer = CustomerListSerializer(customers, many=True)

        return JsonResponse({
            'message': 'success',
            'data': serializer.data,
            'total': customers.count()
        }, status=200)

    except Exception as e:
        print(str(e))
        return JsonResponse({
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_account_status(request, account_id):
    account = get_object_or_404(Account, pk=account_id)

    account.is_active = not account.is_active
    account.save()

    return JsonResponse({
        'message': f'Cập nhật trạng thái thành công!',
        'account_id': account.id,
    }, status=200)