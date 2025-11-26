from rest_framework import serializers
from .models import Category
from products.models import Product

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['id', 'name', 'status', 'product_count']

    def get_product_count(self, obj):
        return Product.objects.filter(category=obj).count()