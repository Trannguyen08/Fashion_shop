from rest_framework import serializers
from .models import Voucher, UserVoucher

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = '__all__'

class UserVoucherSerializer(serializers.ModelSerializer):
    voucher = VoucherSerializer(read_only=True)

    class Meta:
        model = UserVoucher
        fields = ['id', 'voucher', 'is_used', 'collected_at', 'used_at']
