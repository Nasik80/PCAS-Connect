from rest_framework import serializers
from core.models import StudyNote

class StudyNoteSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)

    class Meta:
        model = StudyNote
        fields = ['id', 'title', 'file', 'department', 'department_name', 'semester', 'subject', 'subject_name', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']
