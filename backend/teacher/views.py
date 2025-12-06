from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from core.models import Teacher, Subject, Student, Attendance, Enrollment, TimeTable, Department, Period, TeacherSubject, Announcement
from core.serializers import SubjectSerializer, TimeTableSerializer
from datetime import datetime, date

# --------------------------------------------------------------------------------
# LOGIN
# --------------------------------------------------------------------------------
class TeacherLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=email, password=password)

        if user is None:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Check if this user is linked to a Teacher profile
            teacher = Teacher.objects.get(user=user)
        except Teacher.DoesNotExist:
             return Response({"error": "No teacher profile found for this user"}, status=status.HTTP_400_BAD_REQUEST)

        # Check for HOD role
        role = "HOD" if teacher.is_hod else "TEACHER"

        return Response({
            "message": "Login successful",
            "role": role,
            "teacher_id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "department": teacher.department.name,
            "department_id": teacher.department.id,
        })

# --------------------------------------------------------------------------------
# SHARED / TEACHER VIEWS
# --------------------------------------------------------------------------------

class TeacherSubjectsView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        subjects = teacher.subjects()

        return Response({
            "teacher": teacher.name,
            "subjects": [
                {
                    "subject_id": s.id,
                    "name": s.name,
                    "code": s.code,
                    "semester": s.semester
                }
                for s in subjects
            ]
        })

class StudentsInSubjectView(APIView):
    def get(self, request, subject_id):
        enrollments = Enrollment.objects.filter(subject_id=subject_id)

        students = [
            {
                "id": e.student.id,
                "name": e.student.name,
                "register_number": e.student.register_number
            }
            for e in enrollments
        ]

        return Response(students)

class MarkAttendanceView(APIView):
    def post(self, request):
        teacher_id = request.data.get("teacher_id")
        subject_id = request.data.get("subject_id")
        period_id = request.data.get("period_id")
        date_str = request.data.get("date")

        attendance_data = request.data.get("attendance")  
        # List of {student_id: 1, status: "P"}

        if not all([teacher_id, subject_id, period_id, date_str, attendance_data]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent duplicate attendance for same period+subject+date
        processed_count = 0
        skipped_count = 0

        for entry in attendance_data:
            student_id = entry["student_id"]
            attendance_status = entry["status"]

            # Check duplicate
            exists = Attendance.objects.filter(
                student_id=student_id,
                subject_id=subject_id,
                period_id=period_id,
                date=date_str
            ).exists()

            if exists:
                skipped_count += 1
                continue  # skip duplicate

            Attendance.objects.create(
                student_id=student_id,
                subject_id=subject_id,
                period_id=period_id,
                teacher_id=teacher_id,
                date=date_str,
                status=attendance_status
            )
            processed_count += 1

        return Response({
            "message": "Attendance process completed",
            "saved": processed_count,
            "skipped": skipped_count
        }, status=status.HTTP_200_OK)

class TeacherTodayTimetableView(APIView):
    def get(self, request, teacher_id):
        today = datetime.now().strftime("%a").upper()  # MON, TUE...

        day_map = {
            "MON": "MON",
            "TUE": "TUE",
            "WED": "WED",
            "THU": "THU",
            "FRI": "FRI",
            "SAT": "SAT",
            "SUN": None,
        }

        day_code = day_map.get(today)

        if day_code is None:
            return Response({"message": "No classes today"}, status=status.HTTP_200_OK)

        timetable = TimeTable.objects.filter(teacher_id=teacher_id, day=day_code)

        serializer = TimeTableSerializer(timetable, many=True)
        return Response(serializer.data)

class TeacherTodayStatusView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        periods = teacher.get_today_periods()

        pending = [p for p in periods if not p["attendance_done"]]
        completed = [p for p in periods if p["attendance_done"]]

        return Response({
            "total_periods_today": len(periods),
            "pending_periods": pending,
            "completed_periods": completed,
            "periods": periods
        })

class TeacherMonthlySummaryView(APIView):
    def get(self, request, teacher_id, year, month):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        data = teacher.get_monthly_summary(year, month)
        return Response(data)

# --------------------------------------------------------------------------------
# HOD SPECIFIC VIEWS
# --------------------------------------------------------------------------------

class HODDashboardStatsView(APIView):
    def get(self, request, teacher_id):
        # Stats for the HOD's department
        try:
            hod = Teacher.objects.get(id=teacher_id)
            if not hod.is_hod:
                 return Response({"error": "Access Denied. Not HOD"}, status=status.HTTP_403_FORBIDDEN)
            
            department = hod.department
            
            total_students = Student.objects.filter(department=department).count()
            total_teachers = Teacher.objects.filter(department=department).count()
            total_subjects = Subject.objects.filter(department=department).count()
            
            # Simple Attendance % for today for department
            today = date.today()
            attendance_records = Attendance.objects.filter(student__department=department, date=today)
            total_p = attendance_records.filter(status='P').count()
            total_recs = attendance_records.count()
            attendance_percent = round((total_p / total_recs) * 100, 2) if total_recs > 0 else 0

            return Response({
                "department": department.name,
                "total_students": total_students,
                "total_teachers": total_teachers,
                "total_subjects": total_subjects,
                "today_attendance_percent": attendance_percent
            })

        except Teacher.DoesNotExist:
             return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

class HODStudentListView(APIView):
    def get(self, request, department_id):
        students = Student.objects.filter(department_id=department_id).order_by('semester', 'name')
        data = [
            {
                "id": s.id,
                "name": s.name,
                "reg_no": s.register_number,
                "semester": s.semester,
                "email": s.email
            }
            for s in students
        ]
        return Response(data)

class HODPromotionView(APIView):
    def post(self, request):
        department_id = request.data.get('department_id')
        current_semester = request.data.get('current_semester')
        # Promoting from current_semester to current_semester + 1

        students = Student.objects.filter(department_id=department_id, semester=current_semester)
        count = students.count()

        if count == 0:
            return Response({"message": "No students found in this semester"}, status=status.HTTP_400_BAD_REQUEST)

        # Logic: Increment semester, Remove old enrollments, Add new enrollments
        new_semester = int(current_semester) + 1
        
        # 1. Update Semester
        # 2. Update Enrollments (This is tricky, usually you enroll in new subjects based on sem)
        
        # Get subjects for new semester
        new_subjects = Subject.objects.filter(department_id=department_id, semester=new_semester)

        for student in students:
            student.semester = new_semester
            student.save()
            
            # Auto-enroll in new subjects
            # Optionally clear old enrollments or keep them for history. Let's keep them.
            status_enroll = []
            for sub in new_subjects:
                Enrollment.objects.get_or_create(student=student, subject=sub)
        
        return Response({"message": f"Promoted {count} students to Semester {new_semester}"})


class HODTeacherListView(APIView):
    def get(self, request, department_id):
        teachers = Teacher.objects.filter(department_id=department_id)
        data = [
            {
                "id": t.id,
                "name": t.name,
                "email": t.email
            }
            for t in teachers
        ]
        return Response(data)

class HODAssignTeacherView(APIView):
    def post(self, request):
        teacher_id = request.data.get('teacher_id')
        subject_id = request.data.get('subject_id')
        
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            subject = Subject.objects.get(id=subject_id)
            
            # Helper: Check if both belong to HOD's dept context (implied by logic usually, but careful)
            
            TeacherSubject.objects.create(teacher=teacher, subject=subject)
            return Response({"message": "Assigned successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class HODAnnouncementView(APIView):
    def post(self, request):
        sender_id = request.data.get('sender_id') # User ID or Teacher ID? Sender is User model.
        # We need to find the user from the teacher_id usually passed
        title = request.data.get('title')
        content = request.data.get('content')
        audience = request.data.get('audience') # 'DEPT', 'STUDENTS', etc. (Scoped to dept)
        department_id = request.data.get('department_id') # HOD's dept
        
        # Security: Allow passing user_id directly or derive from Teacher
        # Assuming we pass teacher_id and derive user
        try:
            teacher = Teacher.objects.get(id=request.data.get('teacher_id'))
            user = teacher.user
            if not user:
                 return Response({"error": "Teacher has no user account"}, status=status.HTTP_400_BAD_REQUEST)
        except:
             return Response({"error": "Invalid Teacher"}, status=status.HTTP_400_BAD_REQUEST)

        Announcement.objects.create(
            title=title,
            content=content,
            sender=user,
            audience=audience,
            department_id=department_id
        )
        return Response({"message": "Announcement Posted"})

class HODTimetableView(APIView):
    def post(self, request):
        # Create/Update Timetable Entry
        # dept, sem, day, period, subject, teacher
        data = request.data
        try:
            TimeTable.objects.update_or_create(
                department_id=data['department_id'],
                semester=data['semester'],
                day=data['day'],
                period_id=data['period_id'],
                defaults={
                    'subject_id': data['subject_id'],
                    'teacher_id': data['teacher_id']
                }
            )
            return Response({"message": "Timetable updated"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


