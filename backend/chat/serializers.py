from rest_framework import serializers
from .models import ChatMessage, ChatRoom
from accounts.models import Account


class AccountSidebarSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name")
    avatar = serializers.ImageField(source="user.avatar", allow_null=True)

    class Meta:
        model = Account
        fields = ["id", "full_name", "avatar"]


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username")

    class Meta:
        model = ChatMessage
        fields = ["id", "sender_name", "message", "created_at"]
