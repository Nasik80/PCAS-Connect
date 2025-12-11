from rest_framework import serializers
from core.models import Department, Student, Teacher, Subject

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code']

class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['name', 'register_number', 'email', 'department', 'semester', 'dob']

    def create(self, validated_data):
        from django.contrib.auth.models import User
        from core.models import Enrollment, Subject
        
        name = validated_data.get('name')
        dob = validated_data.get('dob')
        email = validated_data.get('email')
        
        # Generate Password: 5 name chars (UPPER) + birth year
        clean_name = name.replace(" ", "")[:5].upper()
        year = str(dob.year) if dob else "2000"
        password = f"{clean_name}{year}"
        
        # Create User
        user = User.objects.create_user(username=email, email=email, password=password)
        
        # Create Student with user link
        student = Student.objects.create(user=user, **validated_data)

        # Auto-Enrollment
        subjects = Subject.objects.filter(
            department=student.department,
            semester=student.semester
        )
        
        enrollments = [
            Enrollment(student=student, subject=sub)
            for sub in subjects
        ]
        Enrollment.objects.bulk_create(enrollments)

        # Attach temp data for View response
        student._generated_password = password
        student._assigned_subjects_count = len(enrollments)
        
        return student

class TeacherCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['name', 'email', 'department', 'phone', 'dob', 'role', 'qualification', 'date_of_joining']
        extra_kwargs = {
            'phone': {'required': False},
            'qualification': {'required': False},
            'date_of_joining': {'required': False}
        }

    def create(self, validated_data):
        from django.contrib.auth.models import User
        
        name = validated_data.get('name')
        email = validated_data.get('email')
        dob = validated_data.get('dob')
        role = validated_data.get('role', 'TEACHER')
        
        # Generate Password: 5 name chars (UPPER) + Birth Year
        clean_name = name.replace(" ", "")[:5].upper()
        year = str(dob.year) if dob else "2000"
        password = f"{clean_name}{year}"
        
        # Create User
        user = User.objects.create_user(username=email, email=email, password=password)
        
        # Set is_hod flag based on role
        is_hod = (role == 'HOD')
        
        # Create Teacher
        teacher = Teacher.objects.create(user=user, is_hod=is_hod, **validated_data)
        
        # Attach temp data
        teacher._generated_password = password
        
        return teacher

class SubjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject 
        fields = ['name', 'code', 'semester', 'credit', 'subject_type', 'department']
