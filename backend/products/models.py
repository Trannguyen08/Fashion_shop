from django.db import models

class Product(models.Model):
    id = models.CharField(max_length=255),

