from django.db import models
from accounts.models import Account
from products.models import Product

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews_product')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='reviews_account')
    rating = models.IntegerField(default=0)
    comment = models.TextField(blank=True)
    review_date = models.DateTimeField(auto_now_add=True)
    is_browse = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["product"]),  # auto but ok
            models.Index(fields=["account"]),
            models.Index(fields=["product", "-review_date"]),  # BEST
        ]

    def __str__(self):
        return f"{self.account.username} - {self.product.name} ({self.rating}★)"

