from rest_framework import serializers
from .models import ChatMessage, ChatRoom
from accounts.models import Account


class AccountSidebarSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ["id", "full_name", "avatar", "last_message"]

    def get_full_name(self, obj):
        user_profile = obj.user.first()
        return user_profile.full_name if user_profile else obj.username

    def get_avatar(self, obj):
        user_profile = obj.user.first()
        return user_profile.avatar_img if user_profile else None

    def get_last_message(self, obj):
        from .models import ChatMessage
        last_msg = ChatMessage.objects.filter(room__customer=obj).order_by('-created_at').first()
        return last_msg.message if last_msg else "Chưa có tin nhắn"


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username")

    class Meta:
        model = ChatMessage
        fields = ["id", "sender_name", "message", "created_at"]
