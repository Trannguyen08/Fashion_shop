# payment/models.py
from django.db import models
from orders.models import Order

class Payment(models.Model):
    STATUS = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=20, default='VNPAY')
    amount = models.BigIntegerField()
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    transaction_no = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id}"
