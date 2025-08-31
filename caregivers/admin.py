from django.contrib import admin

# Register your models here.
from .models import CaregiverProfile, CaregiverBooking

admin.site.register(CaregiverProfile)
admin.site.register(CaregiverBooking)
