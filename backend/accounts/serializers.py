from rest_framework import serializers
from .models import User

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
