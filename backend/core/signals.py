from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Student
from datetime import datetime

@receiver(post_save, sender=Student)
def create_student_user(sender, instance, created, **kwargs):
    if created:
        name = instance.name.strip().upper()
        first_5 = name.replace(" ", "")[:5]       # remove spaces → first 5 letters
        
        dob_year = instance.dob.year if instance.dob else "0000"

        raw_password = f"{first_5}{dob_year}"

        user = User.objects.create_user(
            username=instance.email,
            email=instance.email,
            password=raw_password,
        )

        instance.user = user
        instance.save()
