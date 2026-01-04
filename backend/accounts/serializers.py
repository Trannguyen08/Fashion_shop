from rest_framework import serializers
from .models import Account, User
from orders.models import Order

class UserSerializer(serializers.ModelSerializer):
    account_id = serializers.IntegerField(source='account.id', read_only=True)
    is_active = serializers.CharField(source='account.is_active', read_only=True)

    class Meta:
        model = User
        fields = [
            'account_id',
            'full_name',
            'email',
            'phone',
            'is_active',
        ]


class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    total_orders = serializers.SerializerMethodField()
    status = serializers.BooleanField(source='is_active')

    class Meta:
        model = Account
        fields = ['id', 'full_name', 'email', 'phone', 'total_orders', 'status']

    def get_full_name(self, obj):
        user = obj.user.first()
        return user.full_name if user else ""

    def get_email(self, obj):
        user = obj.user.first()
        return user.email if user else ""

    def get_phone(self, obj):
        user = obj.user.first()
        return user.phone if user else ""

    def get_total_orders(self, obj):
        return Order.objects.filter(customer=obj).count()