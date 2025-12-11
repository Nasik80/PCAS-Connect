from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from core.models import Student, Teacher, Department, Subject, Attendance
from core.serializers import SubjectSerializer
from .serializers import DepartmentSerializer, StudentCreateSerializer, TeacherCreateSerializer, SubjectCreateSerializer
from django.db.models import Count, Q
from openpyxl import Workbook
from django.http import HttpResponse

class AdminLoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({"error": "Access Denied: Not an Admin"}, status=status.HTTP_403_FORBIDDEN)

        return Response({
            "message": "Login successful",
            "user_id": user.id,
            "username": user.username,
            "is_superuser": user.is_superuser
        })

class AdminDashboardStatsView(APIView):
    def get(self, request):
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

class SearchStudentsView(APIView):
    def get(self, request):
        query = request.GET.get('q', '')
        if not query:
            return Response([])

        # Search by name or register number
        students = Student.objects.filter(
            Q(name__icontains=query) | 
            Q(register_number__icontains=query)
        )[:20]  # Limit to 20 results

        data = [
            {
                "id": s.id,
                "name": s.name,
                "register_number": s.register_number,
                "department": s.department.name,
                "semester": s.semester
            }
            for s in students
        ]
        return Response(data)

class GetDepartmentsView(APIView):
    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

class AdminStudentAttendanceView(APIView):
    def get(self, request, student_id, year, month):
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

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
            "roll_number": student.register_number if hasattr(student, "register_number") else None,
            "monthly_summary": monthly,
            "daily_records": daily_list
        })

class AdminSemesterAttendanceView(APIView):
    def get(self, request, department_id, semester, year, month):
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
            # Get student monthly summary
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

class ExportSemesterAttendanceExcelView(APIView):
    def get(self, request, department_id, semester, year, month):
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

class SemesterSubjectsView(APIView):
    def get(self, request, department_id, semester):
        subjects = Subject.objects.filter(department_id=department_id, semester=semester)

class AddStudentView(APIView):
    def post(self, request):
        serializer = StudentCreateSerializer(data=request.data)
        if serializer.is_valid():
            student = serializer.save()
            
            response_data = serializer.data
            # Attach extra info if available
            if hasattr(student, '_generated_password'):
                response_data['generated_password'] = student._generated_password
            if hasattr(student, '_assigned_subjects_count'):
                response_data['assigned_subjects_count'] = student._assigned_subjects_count
                
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddTeacherView(APIView):
    def post(self, request):
        serializer = TeacherCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddDepartmentView(APIView):
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddSubjectView(APIView):
    def post(self, request):
        serializer = SubjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PromoteStudentsView(APIView):
    def post(self, request):
        department_id = request.data.get('department')
        current_semester = request.data.get('current_semester')
        
        if not department_id or not current_semester:
            return Response({"error": "Department and Current Semester required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # 1. Get Students
            students = Student.objects.filter(department_id=department_id, semester=current_semester)
            if not students.exists():
                return Response({"message": "No students found"}, status=status.HTTP_404_NOT_FOUND)
            
            target_semester = int(current_semester) + 1
            
            # 2. Get New Subjects
            new_subjects = Subject.objects.filter(department_id=department_id, semester=target_semester)
            
            promoted_count = 0
            
            from core.models import Enrollment
            
            for student in students:
                # 3. Update Semester
                student.semester = target_semester
                student.save()
                
                # 4. Clear Old Enrollments (Optional: Or Keep history? Requirement said "Removes previous subjects")
                # Let's delete for now as per requirement "Removes previous subjects"
                Enrollment.objects.filter(student=student).delete()
                
                # 5. Assign New Subjects
                new_enrollments = [
                    Enrollment(student=student, subject=sub)
                    for sub in new_subjects
                ]
                Enrollment.objects.bulk_create(new_enrollments)
                promoted_count += 1
                
            return Response({
                "message": f"Successfully promoted {promoted_count} students to Semester {target_semester}",
                "students_promoted": promoted_count
            })
            

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminStudentListView(APIView):
    def get(self, request):
        dept_id = request.GET.get('department_id')
        semester = request.GET.get('semester')
        query = request.GET.get('search')

        students = Student.objects.all()

        if dept_id:
            students = students.filter(department_id=dept_id)
        if semester:
            students = students.filter(semester=semester)
        if query:
            students = students.filter(
                Q(name__icontains=query) | 
                Q(register_number__icontains=query) |
                Q(email__icontains=query)
            )

        data = [
            {
                "id": s.id,
                "name": s.name,
                "register_number": s.register_number,
                "email": s.email,
                "department_id": s.department.id,
                "department_name": s.department.name,
                "semester": s.semester,
                "dob": s.dob,
                "phone": s.phone_number if hasattr(s, 'phone_number') else ""
            }
            for s in students
        ]
        return Response(data)

class AdminStudentDetailView(APIView):
    def get_object(self, pk):
        try:
            return Student.objects.get(pk=pk)
        except Student.DoesNotExist:
            return None

    def get(self, request, pk):
        student = self.get_object(pk)
        if not student:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Could use serializer, but manual dict is fine for control
        data = {
            "id": student.id,
            "name": student.name,
            "register_number": student.register_number,
            "email": student.email,
            "phone_number": getattr(student, 'phone_number', ''),
            "address": getattr(student, 'address', ''),
            "dob": student.dob,
            "department": student.department.id,
            "department_name": student.department.name,
            "semester": student.semester,
        }
        return Response(data)

    def put(self, request, pk):
        student = self.get_object(pk)
        if not student:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        
        # Track if semester is changing
        old_semester = student.semester
        new_semester = int(data.get('semester', old_semester))
        
        # Update Fields
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.register_number = data.get('register_number', student.register_number)
        student.phone_number = data.get('phone_number', getattr(student, 'phone_number', ''))
        student.address = data.get('address', getattr(student, 'address', ''))
        
        if 'department' in data:
             student.department_id = data['department']

        # Handle Semester Change Logic
        if new_semester != old_semester:
             # 1. Update Semester
             student.semester = new_semester
             
             # 2. Re-enrollment
             from core.models import Enrollment, Subject
             Enrollment.objects.filter(student=student).delete()
             
             new_subjects = Subject.objects.filter(department=student.department, semester=new_semester)
             new_enrollments = [Enrollment(student=student, subject=sub) for sub in new_subjects]
             Enrollment.objects.bulk_create(new_enrollments)

        student.save()
        
        # Also update User model if email changed
        if student.user:
            student.user.email = student.email
            student.user.username = student.email
            student.user.save()

        return Response({"message": "Student updated successfully"})

    def delete(self, request, pk):
        student = self.get_object(pk)
        if not student:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if student.user:
            student.user.delete() # Deletes user and student (cascade)
        else:
            student.delete()
            
        return Response({"message": "Student deleted successfully"})

class AdminStudentPasswordResetView(APIView):
    def post(self, request, pk):
        try:
            student = Student.objects.get(pk=pk)
            if not student.user:
                 return Response({"error": "Student has no linked user account"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate Password
            clean_name = student.name.replace(" ", "")[:5].upper()
            year = str(student.dob.year) if student.dob else "2000"
            new_password = f"{clean_name}{year}"
            
            student.user.set_password(new_password)
            student.user.save()
            
            return Response({"message": "Password reset successfully", "new_password": new_password})
            
        except Student.DoesNotExist:
             return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

class AdminTeacherListView(APIView):
    def get(self, request):
        dept_id = request.GET.get('department_id')
        query = request.GET.get('search')
        
        teachers = Teacher.objects.filter(role='TEACHER') # Only list regular teachers, or all? Spec said "Manage Teachers". Assuming role=TEACHER.
        # Actually spec implies all teachers. Let's include HODs if they are teachers? 
        # But commonly we might want to see everyone. Let's just list all Teacher objects.
        teachers = Teacher.objects.all()

        if dept_id:
            teachers = teachers.filter(department_id=dept_id)
        if query:
            teachers = teachers.filter(
                Q(name__icontains=query) | 
                Q(email__icontains=query) |
                Q(phone__icontains=query)
            )

        data = [
            {
                "id": t.id,
                "name": t.name,
                "email": t.email,
                "phone": t.phone,
                "department_id": t.department.id,
                "department_name": t.department.name,
                "role": t.role,
                "is_hod": t.is_hod
            }
            for t in teachers
        ]
        return Response(data)

class AdminTeacherDetailView(APIView):
    def get_object(self, pk):
        try:
            return Teacher.objects.get(pk=pk)
        except Teacher.DoesNotExist:
            return None

    def get(self, request, pk):
        teacher = self.get_object(pk)
        if not teacher:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get Assigned Subjects
        from core.models import TeacherSubject
        assigned_subjects = TeacherSubject.objects.filter(teacher=teacher)
        subjects_data = [
            {
                "id": ts.subject.id,
                "name": ts.subject.name,
                "code": ts.subject.code,
                "semester": ts.subject.semester
            }
            for ts in assigned_subjects
        ]

        data = {
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "phone": teacher.phone,
            "dob": teacher.dob,
            "gender": teacher.gender,
            "qualification": teacher.qualification,
            "department": teacher.department.id,
            "department_name": teacher.department.name,
            "role": teacher.role,
            "is_hod": teacher.is_hod,
            "subjects": subjects_data
        }
        return Response(data)

    def put(self, request, pk):
        teacher = self.get_object(pk)
        if not teacher:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        
        old_dept_id = teacher.department.id
        
        # Update Fields
        teacher.name = data.get('name', teacher.name)
        teacher.email = data.get('email', teacher.email)
        teacher.phone = data.get('phone', teacher.phone)
        
        if 'department' in data:
            new_dept_id = int(data['department'])
            if new_dept_id != old_dept_id:
                # Department Changed!
                teacher.department_id = new_dept_id
                
                # Remove previous subject linking
                from core.models import TeacherSubject
                TeacherSubject.objects.filter(teacher=teacher).delete()
        
        teacher.save()
        
        # Update User
        if teacher.user:
            teacher.user.email = teacher.email
            teacher.user.username = teacher.email
            teacher.user.save()

        return Response({"message": "Teacher updated successfully"})

    def delete(self, request, pk):
        teacher = self.get_object(pk)
        if not teacher:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if teacher.user:
            teacher.user.delete()
        else:
            teacher.delete()
            
        return Response({"message": "Teacher deleted successfully"})

class AdminTeacherPasswordResetView(APIView):
    def post(self, request, pk):
        try:
            teacher = Teacher.objects.get(pk=pk)
            if not teacher.user:
                 return Response({"error": "Teacher has no linked user account"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate Password: FIRST 5 letters of name (uppercase) + year_of_birth
            clean_name = teacher.name.replace(" ", "")[:5].upper()
            year = str(teacher.dob.year) if teacher.dob else "2000" # Fallback if DOB missing
            new_password = f"{clean_name}{year}"
            
            teacher.user.set_password(new_password)
            teacher.user.save()
            
            return Response({"message": "Password reset successfully", "new_password": new_password})
            
        except Teacher.DoesNotExist:
             return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)
