from django.db import models
from products.models import Product, ProductVariant
from accounts.models import Account

class Cart(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="account_id")

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="cart_id",)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_id")
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="product_variant_id")
    quantity = models.IntegerField(default=1)

    def total_price(self):
        return self.product.current_price * self.quantity
