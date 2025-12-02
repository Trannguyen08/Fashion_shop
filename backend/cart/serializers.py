from rest_framework import serializers

from utils.cloudinary_helper import get_cloudinary_url
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    old_price = serializers.DecimalField(
        source='product.old_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    current_price = serializers.DecimalField(
        source='product.current_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    product_img = serializers.SerializerMethodField()
    product_variant_id = serializers.IntegerField(source='product_variant.id', read_only=True)
    size = serializers.CharField(source='product_variant.size', read_only=True)
    color = serializers.CharField(source='product_variant.color', read_only=True)

    # Tính toán
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'old_price',
            'current_price',
            'product_img',
            'product_variant_id',
            'size',
            'color',
            'quantity',
            'total_price'
        ]

    def get_total_price(self, obj):
        old_price = obj.product.current_price or obj.product.old_price
        return float(old_price) * obj.quantity

    def get_product_img(self, obj):
        if obj.product.product_img:
            return get_cloudinary_url(str(obj.product.product_img.url))
        return None


class CartSerializer(serializers.ModelSerializer):
    account_id = serializers.IntegerField(source='account.id', read_only=True)
    items = CartItemSerializer(many=True, read_only=True)  # ✅ Dùng related_name='items'
    total_amount = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'account_id', 'items', 'total_amount', 'total_items']

    def get_total_amount(self, obj):
        total = 0
        for item in obj.items.all():  # ✅ Dùng related_name='items'
            old_price = item.product.current_price or item.product.old_price
            total += float(old_price) * item.quantity
        return total

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())