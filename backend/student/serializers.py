from rest_framework import serializers
from core.models import Student

class StudentProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'register_number', 'email', 'department_name', 
            'semester', 'dob', 'phone_number', 'address', 'blood_group', 
            'profile_image'
        ]
        read_only_fields = ['id', 'name', 'register_number', 'email', 'department_name', 'semester']
