from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users import views

urlpatterns = [
    path('admin/', admin.site.urls),

    
    path('api/auth/', include('djoser.urls')),

    # JWT authentication endpoints
    path('api/auth/', include('djoser.urls.jwt')),  
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # App-specific routes
    path('api/caregivers/', include('caregivers.urls')),
    path('api/users/', include('users.urls')),

    # Cashfree order API
    path("api/create-cashfree-order/", views.create_cashfree_order, name="create_cashfree_order"),
]
