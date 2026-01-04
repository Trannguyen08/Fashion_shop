from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from accounts.models import Account


class Voucher(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percent', 'Percent'),
        ('fixed', 'Fixed amount'),
    )

    code = models.CharField(
        max_length=50,
        unique=True
    )

    discount_type = models.CharField(
        max_length=10,
        choices=DISCOUNT_TYPE_CHOICES
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    quantity = models.PositiveIntegerField(
        help_text="Tổng số voucher phát hành"
    )

    used_count = models.PositiveIntegerField(
        default=0
    )

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "voucher"

    def __str__(self):
        return self.code

    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active
            and self.start_date <= now <= self.end_date
            and self.used_count < self.quantity
        )


class UserVoucher(models.Model):
    user = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="user_vouchers"
    )

    voucher = models.ForeignKey(
        Voucher,
        on_delete=models.CASCADE,
        related_name="user_vouchers"
    )

    is_used = models.BooleanField(default=False)

    collected_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "voucher")
        db_table = "user_voucher"

    def __str__(self):
        return f"{self.user} - {self.voucher.code}"