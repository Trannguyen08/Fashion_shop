from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product_variant.product.name', read_only=True)
    image_url = serializers.URLField(source='product_variant.product.product_img.url', read_only=True)
    size = serializers.CharField(source='product_variant.size', read_only=True)
    color = serializers.CharField(source='product_variant.color', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'product_variant',
            'quantity',
            'price',
            'product_name',
            'image_url',
            'size',
            'color',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    address = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'phone', 'address', 'ship_method', 'order_date',
            'payment_method', 'note', 'ship_status',
            'payment_status', 'total_amount', 'is_rating', 'items'
        ]
        read_only_fields = ['customer', 'phone', 'total_amount', 'ship_status', 'payment_status']

    # ===== CUSTOM FULL ADDRESS =====
    def get_address(self, obj):
        addr = obj.address
        if not addr:
            return None

        parts = [
            getattr(addr, "address_detail", ""),
            getattr(addr, "ward", ""),
            getattr(addr, "district", ""),
            getattr(addr, "province", ""),
        ]
        return ", ".join([p for p in parts if p])

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        total = sum(item['price'] * item['quantity'] for item in items_data)

        order = Order.objects.create(total_amount=total, **validated_data)

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order

    def get_customer(self, obj):
        profile = obj.customer.user.first()  # vì là ForeignKey
        return profile.full_name if profile else None

    def get_phone(self, obj):
        profile = obj.customer.user.first()
        return profile.phone if profile else None
