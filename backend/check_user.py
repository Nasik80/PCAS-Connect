import os
import django
import sys

# Setup Django environment
sys.path.append('/home/mohammednasikk/Desktop/PCAS-Connect/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pcas_backend.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import Teacher

try:
    # Try searching by username or email
    users = User.objects.filter(username__icontains='dhoni') | User.objects.filter(email__icontains='dhoni')
    
    if not users.exists():
        print("No user found with 'dhoni' in username or email.")
    
    for user in users:
        print(f"User: {user.username} (ID: {user.id})")
        print(f"Email: {user.email}")
        print(f"Is Active: {user.is_active}")
        print(f"Is Superuser: {user.is_superuser}")
        
        # Check if Linked to Teacher
        try:
            teacher = Teacher.objects.get(user=user)
            print(f"Teacher Profile Found: {teacher.name}")
            print(f"Role: {teacher.role}")
            print(f"Is HOD: {teacher.is_hod}")
            print(f"Department: {teacher.department.name}")
        except Teacher.DoesNotExist:
            print("No Teacher profile linked.")
        
        print("---")

except Exception as e:
    print(f"Error: {e}")
