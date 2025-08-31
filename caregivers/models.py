from django.db import models
from django.db import models
from django.conf import settings

class CaregiverProfile(models.Model):
    name = models.CharField(max_length=255,default ='Unknown')
    avatar = models.URLField(blank=True, null=True)  
    specialization = models.CharField(max_length=255,default ='Unknown')
    qualification = models.CharField(max_length=255,default ='Unknown')
    fees = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    def __str__(self):
        return self.name

class CaregiverBooking(models.Model):
    caregiver = models.ForeignKey(CaregiverProfile, on_delete=models.CASCADE)
    booked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    time_slot = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.booked_by.username} booked {self.caregiver.name} on {self.date}"
