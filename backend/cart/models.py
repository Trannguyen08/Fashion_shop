from django.db import models
from products.models import Product, ProductVariant
from accounts.models import Account


class Cart(models.Model):
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="carts"
    )

    def __str__(self):
        return f"Cart #{self.id} - User: {self.account.username}"

    class Meta:
        db_table = 'cart'


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )
    quantity = models.IntegerField(default=1)


    def __str__(self):
        return f"{self.product.name} - {self.product_variant.size}/{self.product_variant.color} x{self.quantity}"

    def get_total_price(self):
        price = self.product.current_price or self.product.price
        return price * self.quantity

    class Meta:
        db_table = 'cart_item'
        unique_together = ['cart', 'product_variant']