from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class AccountManager(BaseUserManager):
    def create_user(self, phone=None, email=None, full_name=None, password=None):
        if not phone and not email:
            raise ValueError("Người dùng phải có ít nhất số điện thoại hoặc email")

        user = self.model(phone=phone, email=self.normalize_email(email), full_name=full_name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone=None, email=None, full_name=None, password=None):
        user = self.create_user(phone=phone, email=email, full_name=full_name, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Account(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=100)
    role = models.CharField(
        max_length=20,
        choices=[
            ('customer', 'Khách hàng'),
            ('admin', 'Quản trị viên'),
        ],
        default='customer'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    # Trường dùng để login, nhưng ta sẽ override authenticate() nên không cần cố định phone
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.phone or self.email})"