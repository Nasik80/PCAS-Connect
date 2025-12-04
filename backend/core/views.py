from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Teacher, TeacherSubject, Enrollment, TimeTable
from datetime import date
from .models import Attendance, Subject, Student
from django.contrib.auth import authenticate
from .serializers import SubjectSerializer  
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from .models import Student, Department, Subject, User

@api_view(['GET'])
def teacher_subjects(request, teacher_id):
    try:
        teacher = Teacher.objects.get(id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

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

@api_view(['GET'])
def students_in_subject(request, subject_id):
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

@api_view(['POST'])
def mark_attendance(request):
    subject_id = request.data.get("subject_id")
    student_id = request.data.get("student_id")
    status = request.data.get("status")  # "P" or "A"

    # Validate subject
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response({"error": "Subject not found"}, status=404)

    # Validate student
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    # Create or update attendance for today
    attendance, created = Attendance.objects.update_or_create(
        student=student,
        subject=subject,
        date=date.today(),
        defaults={"status": status},
    )

    return Response({
        "message": "Attendance updated" if not created else "Attendance marked",
        "student": student.name,
        "subject": subject.name,
        "status": status
    })


@api_view(['POST'])
def student_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(username=email, password=password)

    if user is None:
        return Response({"error": "Invalid email or password"}, status=401)

    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response({"error": "Not a student account"}, status=400)

    return Response({
        "message": "Login successful",
        "student_id": student.id,
        "name": student.name,
        "email": student.email,
        "department": student.department.name,
        "semester": student.semester
    })

@api_view(['GET'])
def student_dashboard(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

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


from datetime import datetime
from .serializers import TimeTableSerializer

@api_view(['GET'])
def teacher_today_timetable(request, teacher_id):
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
        return Response({"message": "No classes today"}, status=200)

    timetable = TimeTable.objects.filter(teacher_id=teacher_id, day=day_code)

    serializer = TimeTableSerializer(timetable, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def semester_subjects(request, department_id, semester):
    subjects = Subject.objects.filter(department_id=department_id, semester=semester)
    data = SubjectSerializer(subjects, many=True).data
    return Response(data)

@api_view(['POST'])
def mark_attendance(request):
    teacher_id = request.data.get("teacher_id")
    subject_id = request.data.get("subject_id")
    period_id = request.data.get("period_id")
    date = request.data.get("date")

    attendance_data = request.data.get("attendance")  
    # List of {student_id: 1, status: "P"}

    if not all([teacher_id, subject_id, period_id, date, attendance_data]):
        return Response({"error": "Missing required fields"}, status=400)

    # Prevent duplicate attendance for same period+subject+date
    from .models import Attendance

    for entry in attendance_data:
        student_id = entry["student_id"]
        status = entry["status"]

        # Check duplicate
        exists = Attendance.objects.filter(
            student_id=student_id,
            subject_id=subject_id,
            period_id=period_id,
            date=date
        ).exists()

        if exists:
            continue  # skip duplicate

        Attendance.objects.create(
            student_id=student_id,
            subject_id=subject_id,
            period_id=period_id,
            teacher_id=teacher_id,
            date=date,
            status=status
        )

    return Response({"message": "Attendance saved successfully!"}, status=200)

@api_view(['GET'])
def student_attendance_today(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    data = student.get_today_attendance()
    return Response(data)

@api_view(['GET'])
def student_attendance_monthly(request, student_id, year, month):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    data = student.get_monthly_attendance(year, month)
    return Response(data)

@api_view(['GET'])
def teacher_today_status(request, teacher_id):
    try:
        teacher = Teacher.objects.get(id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    periods = teacher.get_today_periods()

    pending = [p for p in periods if not p["attendance_done"]]
    completed = [p for p in periods if p["attendance_done"]]

    return Response({
        "total_periods_today": len(periods),
        "pending_periods": pending,
        "completed_periods": completed,
        "periods": periods
    })
@api_view(['GET'])
def teacher_monthly_summary(request, teacher_id, year, month):
    try:
        teacher = Teacher.objects.get(id=teacher_id)
    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)

    data = teacher.get_monthly_summary(year, month)
    return Response(data)
@api_view(['GET'])
def admin_student_attendance(request, student_id, year, month):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    monthly = student.get_monthly_attendance(year, month)
    daily = Attendance.objects.filter(
        student=student,
        date__year=year,
        date__month=month
    ).order_by('date', 'period__number')

    daily_list = [
        {
            "date": a.date,
            "period": a.period.number,
            "subject": a.subject.name,
            "teacher": a.teacher.name,
            "status": a.status
        }
        for a in daily
    ]

    return Response({
        "student": student.name,
        "roll_number": student.roll_number if hasattr(student, "roll_number") else None,
        "monthly_summary": monthly,
        "daily_records": daily_list
    })
@api_view(['GET'])
def admin_semester_attendance(request, department_id, semester, year, month):
    from core.models import Student, Attendance

    # Get all students in this semester
    students = Student.objects.filter(department_id=department_id, semester=semester)

    # Total periods conducted in this month
    total_classes = Attendance.objects.filter(
        student__department_id=department_id,
        student__semester=semester,
        date__year=year,
        date__month=month
    ).values('date', 'period').distinct().count()

    student_summaries = []

    for s in students:
        # Get student monthly summary from earlier logic
        summary = s.get_monthly_attendance(year, month)

        student_summaries.append({
            "student_id": s.id,
            "name": s.name,
            "present": summary["present"],
            "total": summary["total"],
            "percentage": summary["percentage"]
        })

    # Sort in descending order of percentage (rank)
    ranked = sorted(student_summaries, key=lambda x: x['percentage'], reverse=True)

    # Low attendance list (<75%)
    low_attendance = [s for s in ranked if s["percentage"] < 75]

    return Response({
        "department_id": department_id,
        "semester": semester,
        "month": month,
        "year": year,
        "total_classes_conducted": total_classes,
        "students": ranked,
        "low_attendance": low_attendance
    })

from openpyxl import Workbook
from django.http import HttpResponse

@api_view(['GET'])
def export_semester_attendance_excel(request, department_id, semester, year, month):
    from core.models import Student

    students = Student.objects.filter(department_id=department_id, semester=semester)

    wb = Workbook()
    ws = wb.active
    ws.title = "Attendance Report"

    # Excel header
    ws.append(["Student", "Present", "Total", "Percentage"])

    for s in students:
        summary = s.get_monthly_attendance(year, month)
        ws.append([
            s.name,
            summary['present'],
            summary['total'],
            summary['percentage']
        ])

    # Prepare response
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    filename = f"attendance_{department_id}_sem{semester}_{month}_{year}.xlsx"
    response['Content-Disposition'] = f'attachment; filename={filename}'

    wb.save(response)
    return response

@api_view(['GET'])
def student_timetable(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    # Fetch timetable for student's department & semester
    timetable = TimeTable.objects.filter(
        department=student.department,
        semester=student.semester
    ).order_by('period__number')  # Sort by period number

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



# ... keep existing views ...

# ---------------------------------------------------
# ADMIN DASHBOARD API
# ---------------------------------------------------

@api_view(['POST'])
def admin_login(request):
    username = request.data.get("username") # Admin uses username usually, or email
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)
    
    if not user.is_staff:
        return Response({"error": "Access Denied: Not an Admin"}, status=403)

    return Response({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "is_superuser": user.is_superuser
    })

@api_view(['GET'])
def admin_dashboard_stats(request):
    # This endpoint returns the counts for the dashboard cards
    student_count = Student.objects.count()
    teacher_count = Teacher.objects.count()
    dept_count = Department.objects.count()
    subject_count = Subject.objects.count()

    return Response({
        "students": student_count,
        "teachers": teacher_count,
        "departments": dept_count,
        "subjects": subject_count
    })