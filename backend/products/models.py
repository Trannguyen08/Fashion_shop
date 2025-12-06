from django.db import models
from django.db.models import Avg
from accounts.models import Account
from cloudinary.models import CloudinaryField
from categories.models import Category


#model product
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.TextField()
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    stock_quantity = models.IntegerField(default=0)
    status = models.CharField(max_length=50)
    product_img = CloudinaryField('image', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    average_rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["category"]),  # filter
            models.Index(fields=["-created_at"]),  # sort by new
            models.Index(fields=["is_new"]),
            models.Index(fields=["is_featured"]),
            models.Index(fields=["status"]),
            models.Index(fields=["current_price"]),  # price filter
        ]

    def update_average_rating(self):
        avg = self.reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        self.average_rating = round(avg, 1)
        self.save()

    def update_status_by_stockq(self):
        if self.stock_quantity == 0:
            self.status = "out-of-stock"
        self.save()

    def __str__(self):
        return str(self.name)


#model productVariant
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_variants')
    sku = models.CharField(max_length=20)
    size = models.CharField(max_length=3)
    color = models.CharField(max_length=15)
    stock_quantity = models.IntegerField(default=0)
    PV_img = CloudinaryField('image', blank=True, null=True)
    status = models.CharField(max_length=50)

    indexes = [
        models.Index(fields=["product"]),
        models.Index(fields=["color"]),
        models.Index(fields=["size"]),
        models.Index(fields=["status"]),
        models.Index(fields=["product", "color", "size"]),  # BEST
    ]

    def update_status_by_stock(self):
        if self.stock_quantity == 0:
            self.status = "out-of-stock"
        self.save()

    def __str__(self):
        return f"{self.product.name} ({self.color}, {self.size})"


#model productImages
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_imgs')
    PI_img = CloudinaryField('image')

    def __str__(self):
        return f"{self.product.name} Image"


#model review
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=0)
    comment = models.TextField(blank=True)
    review_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["product"]),  # auto but ok
            models.Index(fields=["account"]),
            models.Index(fields=["product", "-review_date"]),  # BEST
        ]

    def __str__(self):
        return f"{self.account.username} - {self.product.name} ({self.rating}★)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.product.update_average_rating()
