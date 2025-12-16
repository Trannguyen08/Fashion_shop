from django.db import models
from accounts.models import Account


class ChatRoom(models.Model):
    customer = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="customer_room")
    admin = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name="admin_room")

class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(Account, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
