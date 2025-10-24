from rest_framework import serializers
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Account
        fields = ['phone', 'email', 'full_name', 'password']

    def create(self, validated_data):
        return Account.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()  # có thể là email hoặc số điện thoại
    password = serializers.CharField(write_only=True)


