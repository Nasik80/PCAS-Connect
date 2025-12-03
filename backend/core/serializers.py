from rest_framework import serializers
from .models import TimeTable, Period, Subject, Teacher

class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = ['id', 'number', 'start_time', 'end_time']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'credit']

class TimeTableSerializer(serializers.ModelSerializer):
    period = PeriodSerializer()
    subject = SubjectSerializer()
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = TimeTable
        fields = [
            'id',
            'day',
            'period',
            'subject',
            'teacher_name'
        ]
class StudentAttendanceSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    status = serializers.CharField()  # "P" or "A"
