from rest_framework import serializers
from products.models import Product, ProductVariant
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    size = serializers.CharField(source='product_variant.size', read_only=True)
    color = serializers.CharField(source='product_variant.color', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'product_name', 'size', 'color', 'quantity', 'total_price']


class CartSerializer(serializers.ModelSerializer):
    account = serializers.IntegerField(source='account.id', read_only=True)
    items = CartItemSerializer(source='cart_id', many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['cartId', 'userId', 'items']
