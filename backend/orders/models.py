from contextlib import nullcontext

from django.db import models
from accounts.models import Account
from customers.models import CustomerAddress
from products.models import Product, ProductVariant


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Account, on_delete=models.CASCADE, null=False)
    address = models.ForeignKey(CustomerAddress, on_delete=models.CASCADE, null=False)
    order_date = models.DateTimeField(auto_now_add=True)
    ship_method = models.CharField(max_length=50)
    payment_method = models.CharField(max_length=50)
    note = models.TextField(default=nullcontext)
    ship_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_status = models.CharField(max_length=20, default='Pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_rating = models.BooleanField(default=False)

    def __str__(self):
        return f"Order #{self.id} - {self.customer}"

# OrderItem (chi tiết sản phẩm trong đơn)
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=12, decimal_places=2)  # lưu giá tại thời điểm mua

    def __str__(self):
        return f"{self.product_variant} x {self.quantity}"
