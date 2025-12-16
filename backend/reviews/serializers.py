from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='account.user.first.full_name', read_only=True)
    avatar_img = serializers.ImageField(source='account.user.first.avatar_img', read_only=True, allow_null=True, use_url=True)
    product_id = serializers.ReadOnlyField(source='product.id', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'full_name', 'avatar_img', 'product_id', 'rating', 'comment', 'review_date']