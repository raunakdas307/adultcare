from rest_framework import serializers
from .models import CaregiverProfile, CaregiverBooking

class CaregiverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaregiverProfile
        fields = '__all__'
    
class CaregiverBookingSerializer(serializers.ModelSerializer):
    class Meta:
     model = CaregiverBooking
     fields = '__all__'
     read_only_fields = ['booked_by']