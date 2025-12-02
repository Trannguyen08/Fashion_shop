from rest_framework import serializers
from .models import CustomerAddress

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = '__all__'
