import os
import django
import sys

# Setup Django environment
sys.path.append('/home/mohammednasikk/Desktop/PCAS-Connect/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pcas_backend.settings')
django.setup()

from django.contrib.auth.models import User

try:
    # Find user
    user = User.objects.get(username='dhoni@gmail.com')
    print(f"Found User: {user.username}")
    
    # Set Password
    user.set_password('dhoni123')
    user.save()
    
    print("Password successfully reset to: dhoni123")

except User.DoesNotExist:
    print("User 'dhoni@gmail.com' not found.")
except Exception as e:
    print(f"Error: {e}")
