from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant
from utils.cloudinary_helper import get_cloudinary_url

class ProductImageSerializer(serializers.ModelSerializer):
    PI_img = serializers.SerializerMethodField()
    class Meta:
        model = ProductImage
        fields = ['id', 'PI_img']

    def get_PI_img(self, obj):
        if obj.PI_img:
            return get_cloudinary_url(str(obj.PI_img.url))
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    PV_img = serializers.SerializerMethodField()
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'size', 'color', 'stock_quantity', 'PV_img', 'status']

    def get_PV_img(self, obj):
        if obj.PV_img:
            return get_cloudinary_url(str(obj.PV_img.url))
        return None

class ProductSerializer(serializers.ModelSerializer):
    product_img = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    product_imgs = ProductImageSerializer(many=True, read_only=True)
    product_variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'old_price', 'current_price', 'description',
            'stock_quantity', 'status', 'product_img', 'is_featured',
            'is_new', 'average_rating', 'created_at',
            'category_name', 'product_imgs', 'product_variants'
        ]

    def get_product_img(self, obj):
        if obj.product_img:
            return get_cloudinary_url(str(obj.product_img.url))
        return None

