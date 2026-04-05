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
            "semester": student.semester,
            "requires_password_change": student.requires_password_change
        })

class StudentChangePasswordView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not all([user_id, old_password, new_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(id=user_id)
            user = student.user
            
            if not user:
                 return Response({"error": "User profile not found"}, status=status.HTTP_400_BAD_REQUEST)

            # Check old password
            auth_user = authenticate(username=user.username, password=old_password)
            if auth_user is None:
                return Response({"error": "Invalid old password"}, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.set_password(new_password)
            user.save()

            # Clear requires_password_change flag
            student.requires_password_change = False
            student.save()

            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "An error occurred while changing password"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

class StudentProfileDetailView(APIView):
    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        from .serializers import StudentProfileSerializer
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data)

    def put(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        from .serializers import StudentProfileSerializer
        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from core.models import StudyNote
class StudentStudyNotesView(APIView):
    def get(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Filter notes by student's department and semester
        notes = StudyNote.objects.filter(
            department=student.department,
            semester=student.semester
        ).select_related('subject', 'uploaded_by')
        
        data = []
        for note in notes:
            data.append({
                "id": note.id,
                "title": note.title,
                "file_url": request.build_absolute_uri(note.file.url) if note.file else None,
                "subject_name": note.subject.name,
                "uploaded_by": note.uploaded_by.name,
                "uploaded_at": note.uploaded_at,
            })
            
        return Response(data)
