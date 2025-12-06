from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_variant', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'address', 'ship_method',
            'payment_method', 'note', 'ship_status',
            'payment_status', 'total_amount', 'items'
        ]
        read_only_fields = ['total_amount', 'ship_status', 'payment_status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        # Tính tổng tiền
        total = sum([item['price'] * item['quantity'] for item in items_data])

        order = Order.objects.create(total_amount=total, **validated_data)

        # Tạo OrderItem
        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order
