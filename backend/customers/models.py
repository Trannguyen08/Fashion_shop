from django.db import models
from accounts.models import Account

class CustomerAddress(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='addresses')
    receiver_name = models.CharField(max_length=255)  # Tên người nhận
    phone = models.CharField(max_length=20)  # SĐT người nhận
    province = models.CharField(max_length=255)  # Tỉnh
    ward = models.CharField(max_length=255)  # Xã/phường
    address_detail = models.CharField(max_length=500)  # Số nhà, đường

    is_default = models.BooleanField(default=False)  # Đánh dấu địa chỉ mặc định
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.address_detail}, {self.ward}, {self.district}, {self.province}"
