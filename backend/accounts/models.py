from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class AccountManager(BaseUserManager):
    def create_user(self, username=None, password=None):
        user = self.model(username=username)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username=None, password=None):
        user = self.create_user(username=username, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Account(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
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
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username}"

class User(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='user')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    avatar_img = models.TextField()