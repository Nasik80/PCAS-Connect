from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from core.models import Student, TimeTable
from core.serializers import TimeTableSerializer
from datetime import datetime

class StudentLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=email, password=password)

        if user is None:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            student = Student.objects.get(email=email)
        except Student.DoesNotExist:
            return Response({"error": "Not a student account"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": "Login successful",
            "student_id": student.id,
            "name": student.name,
            "email": student.email,
            "department": student.department.name,
            "semester": student.semester
        })

class StudentDashboardView(APIView):
    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        subjects = student.enrollment_set.all()

        dashboard_subjects = []
        for enrollment in subjects:
            subject = enrollment.subject
            percentage = student.attendance_percentage(subject)

            dashboard_subjects.append({
                "subject_id": subject.id,
                "subject_name": subject.name,
                "code": subject.code,
                "credit": subject.credit,
                "attendance_percentage": percentage
            })

        total_credits = student.total_credits()
        average_attendance = (
            sum(s["attendance_percentage"] for s in dashboard_subjects) / len(dashboard_subjects)
            if dashboard_subjects else 0
        )

        return Response({
            "student_name": student.name,
            "department": student.department.name,
            "semester": student.semester,
            "total_credits": total_credits,
            "average_attendance": round(average_attendance, 2),
            "subjects": dashboard_subjects
        })

class StudentAttendanceTodayView(APIView):
    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        data = student.get_today_attendance()
        return Response(data)

class StudentAttendanceMonthlyView(APIView):
    def get(self, request, student_id, year, month):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        data = student.get_monthly_attendance(year, month)
        return Response(data)

class StudentTimeTableView(APIView):
    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch timetable for student's department & semester
        timetable = TimeTable.objects.filter(
            department=student.department,
            semester=student.semester
        ).order_by('period__number')

        # Group by Day
        grouped_timetable = {
            "MON": [], "TUE": [], "WED": [], "THU": [], "FRI": [], "SAT": []
        }

        serializer = TimeTableSerializer(timetable, many=True)
        
        for entry in serializer.data:
            day = entry['day']
            if day in grouped_timetable:
                grouped_timetable[day].append(entry)

        return Response(grouped_timetable)
