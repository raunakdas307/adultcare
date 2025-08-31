from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaregiverProfileViewSet, CaregiverBookingViewSet


router = DefaultRouter()
router.register(r'profiles', CaregiverProfileViewSet, basename='caregiver-profiles')
router.register(r'bookings', CaregiverBookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
