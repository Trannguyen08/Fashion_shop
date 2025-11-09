from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant, Category, Review, User

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'PI_img']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'size', 'color', 'stock_quantity', 'PV_img', 'status']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    product_images = ProductImageSerializer(many=True, read_only=True)
    product_variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'old_price', 'current_price', 'description',
            'stock_quantity', 'status', 'product_img', 'is_featured',
            'is_new', 'average_rating', 'created_at',
            'category_name', 'product_imgs', 'product_variants'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='account.user.full_name', read_only=True)
    avatar_img = serializers.ImageField(source='account.user.avatar_img', read_only=True, allow_null=True, use_url=True)

    class Meta:
        model = Review
        fields = ['id', 'full_name', 'avatar_img', 'rating', 'comment']