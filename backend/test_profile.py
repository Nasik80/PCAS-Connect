import os
import django
import sys
import requests

# Setup Django environment
sys.path.append('/home/mohammednasikk/Desktop/PCAS-Connect/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pcas_backend.settings')
django.setup()

from core.models import Student
student = Student.objects.first()

base_url = 'http://localhost:8000'
login_data = {'email': student.email, 'password': f"{student.name.replace(' ', '')[:5].upper()}{student.dob.year}"}

print(f'Trying to login to student account {student.email} with password {login_data["password"]}...')
try:
    response = requests.post(f'{base_url}/api/student/login/', json=login_data, timeout=5)
    if response.status_code == 200:
        student_id = response.json().get('student_id')
        print(f'Logged in successfully! Student ID: {student_id}')
        
        # Test getting profile
        print('Fetching profile data...')
        prof_res = requests.get(f'{base_url}/api/student/{student_id}/profile/', timeout=5)
        print(f'Profile status: {prof_res.status_code}')
        print(prof_res.json())
        
        # Test updating profile (without image)
        print('Updating profile data...')
        update_data = {'blood_group': 'O+', 'phone_number': '1234567890'}
        update_res = requests.put(f'{base_url}/api/student/{student_id}/profile/', json=update_data, timeout=5)
        print(f'Update status: {update_res.status_code}')
        print(update_res.json())
        
        print('Fetching profile again...')
        prof_res2 = requests.get(f'{base_url}/api/student/{student_id}/profile/', timeout=5)
        print(f'Profile status 2: {prof_res2.status_code}')
        print(prof_res2.json())
        
    else:
        print(f'Failed to login: {response.status_code}', response.text)
except requests.exceptions.RequestException as e:
    print(f'Request failed: {e}')
except Exception as e:
    print(f'Error: {e}')
