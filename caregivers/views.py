from rest_framework import viewsets, generics, permissions
from .models import CaregiverProfile, CaregiverBooking
from .serializers import CaregiverProfileSerializer, CaregiverBookingSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: 
    - SAFE methods (GET, HEAD, OPTIONS) → allowed for everyone
    - POST/PUT/PATCH/DELETE → only allowed for admins
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user and request.user.is_authenticated and request.user.role == "admin"


class CaregiverProfileViewSet(viewsets.ModelViewSet):
    queryset = CaregiverProfile.objects.all()
    serializer_class = CaregiverProfileSerializer
    permission_classes = [IsAdminOrReadOnly]   # ✅ custom permission


class CaregiverBookingViewSet(viewsets.ModelViewSet):
    queryset = CaregiverBooking.objects.all()
    serializer_class = CaregiverBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        print("DEBUG: Booking by", self.request.user)
        serializer.save(booked_by=self.request.user)
