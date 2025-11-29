from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Cấu hình schema view
schema_view = get_schema_view(
   openapi.Info(
      title="My Shop API",
      default_version='v1',
      description="API documentation cho project bán hàng",
      terms_of_service="https://www.example.com/terms/",
      contact=openapi.Contact(email="contact@example.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include('accounts.client_views.urls')),
    path('api/account/', include('accounts.admin_views.urls')),
    path('product/', include('products.client_views.urls')),
    path('api/product/', include('products.admin_views.urls')),
    path('api/category/', include('categories.admin_views.urls')),
    path('cart/', include('cart.urls')),
    path('customers/', include('customers.urls')),

    # Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # Redoc UI (tùy chọn)
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
