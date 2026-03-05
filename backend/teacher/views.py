from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from core.models import Teacher, Subject, Student, Attendance, Enrollment, TimeTable, Department, Period, TeacherSubject, Announcement
from core.serializers import SubjectSerializer, TimeTableSerializer
from datetime import datetime, date, timedelta
from django.db.models import Count, Q

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
            "requires_password_change": teacher.requires_password_change
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
        updated_count = 0


        for entry in attendance_data:
            student_id = entry["student_id"]
            attendance_status = entry["status"]

            # Upsert (Update or Create)
            obj, created = Attendance.objects.update_or_create(
                student_id=student_id,
                subject_id=subject_id,
                period_id=period_id,
                date=date_str,
                defaults={
                    'status': attendance_status,
                    'teacher_id': teacher_id # Update teacher if changed? Maybe.
                }
            )

            if created:
                processed_count += 1
            else:
                updated_count += 1

        return Response({
            "message": "Attendance process completed",
            "saved": processed_count,
            "updated": updated_count
        }, status=status.HTTP_200_OK)


class GetAttendanceView(APIView):
    def get(self, request):
        subject_id = request.GET.get('subject_id')
        period_id = request.GET.get('period_id')
        date_str = request.GET.get('date')

        if not all([subject_id, period_id, date_str]):
            return Response({"error": "Missing params"}, status=status.HTTP_400_BAD_REQUEST)

        attendance = Attendance.objects.filter(
            subject_id=subject_id,
            period_id=period_id,
            date=date_str
        )

        data = [
            {
                "student_id": a.student.id,
                "status": a.status
            }
            for a in attendance
        ]
        return Response(data)

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

class TeacherProfileView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        profile_image_url = None
        if teacher.profile_image:
            profile_image_url = request.build_absolute_uri(teacher.profile_image.url)

        data = {
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "department": teacher.department.name,
            "phone": teacher.phone,
            "dob": teacher.dob,
            "date_of_joining": teacher.date_of_joining,
            "gender": teacher.gender,
            "qualification": teacher.qualification,
            "role": teacher.role,
            "profile_image": profile_image_url
        }
        return Response(data)

    def patch(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update fields if provided
        for field in ['name', 'phone', 'dob', 'gender', 'qualification']:
            if field in request.data:
                setattr(teacher, field, request.data[field])

        # Handle file upload for profile_image
        if 'profile_image' in request.FILES:
            teacher.profile_image = request.FILES['profile_image']
        
        teacher.save()
        
        profile_image_url = None
        if teacher.profile_image:
             profile_image_url = request.build_absolute_uri(teacher.profile_image.url)

        return Response({"message": "Profile updated successfully", "profile_image": profile_image_url})

class TeacherChangePasswordView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not all([user_id, role, old_password, new_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if role in ['TEACHER', 'HOD']:
                teacher = Teacher.objects.get(id=user_id)
                user = teacher.user
            else:
                return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
                
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
            teacher.requires_password_change = False
            teacher.save()

            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "An error occurred while changing password"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                "email": t.email,
                "subjects_count": t.teachersubject_set.count() # Count assigned subjects
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
            # Fix: Lookup Period by Number (sent by frontend)
            period = Period.objects.get(number=data['period_id'])
            
            TimeTable.objects.update_or_create(
                department_id=data['department_id'],
                semester=data['semester'],
                day=data['day'],
                period=period, # Use the Period instance
                defaults={
                    'subject_id': data['subject_id'],
                    'teacher_id': data['teacher_id']
                }
            )
            return Response({"message": "Timetable updated"})
        except Period.DoesNotExist:
             return Response({"error": f"Period {data.get('period_id')} not found"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TeacherAnnouncementListView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        announcements = Announcement.objects.filter(
            audience__in=['ALL', 'TEACHERS', 'DEPT']
        ).order_by('-date')

        ann_data = [
            {
                "id": a.id,
                "title": a.title,
                "content": a.content,
                "date": a.date.strftime("%Y-%m-%d"),
                "sender": a.sender.username,
                "audience": a.audience
            }
            for a in announcements
        ]
        return Response(ann_data)

class TeacherDashboardView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Subjects
        subjects = teacher.subjects()
        subjects_data = [{"id": s.id, "name": s.name, "code": s.code} for s in subjects]

        # 2. Today's Classes & Pending Attendance
        today_periods = teacher.get_today_periods() # Returns list of dicts with 'attendance_done'
        today_total = len(today_periods)
        today_pending = len([p for p in today_periods if not p['attendance_done']])

        # 3. Latest Announcements (2)
        announcements = Announcement.objects.filter(
            audience__in=['ALL', 'TEACHERS', 'DEPT']
        ).order_by('-date')[:2]
        
        # Filter Dept specific if needed, but for simplicity show public+teachers
        # If we really want dept specific:
        # announcements = announcements.filter(Q(department=teacher.department) | Q(department__isnull=True)) 
        # For now, sticking to basic filter.

        ann_data = [
            {
                "id": a.id,
                "title": a.title,
                "date": a.date.strftime("%Y-%m-%d"),
                "sender": a.sender.username
            }
            for a in announcements
        ]

        profile_image_url = None
        if teacher.profile_image:
            profile_image_url = request.build_absolute_uri(teacher.profile_image.url)

        return Response({
            "teacher": {
                "name": teacher.name,
                "department": teacher.department.name,
                "role": "HOD" if teacher.is_hod else "TEACHER",
                "profile_image": profile_image_url
            },
            "stats": {
                "subjects_count": len(subjects),
                "today_classes": today_total,
                "pending_attendance": today_pending,
            },
            "subjects": subjects_data,
            "announcements": ann_data
        })

class HODDashboardView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            if not teacher.is_hod:
                return Response({"error": "Access Denied"}, status=status.HTTP_403_FORBIDDEN)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        department = teacher.department

        # 1. Department Stats
        student_count = Student.objects.filter(department=department).count()
        teacher_count = Teacher.objects.filter(department=department).count()
        subject_count = Subject.objects.filter(department=department).count()

        # 2. Today's Attendance Summary (Avg % of students present today or recently)
        # Simplify: Just count total students present today vs total students
        # or reuse HODDashboardStatsView logic
        today = date.today()
        attendance_recs = Attendance.objects.filter(student__department=department, date=today)
        
        # This is strictly counting 'entries' which might duplicate students if multiple periods.
        # Better metric: Unique students present at least once? Or avg session attendance.
        # Let's stick to Average Session Attendance %
        total_slots = attendance_recs.count()
        present_slots = attendance_recs.filter(status='P').count()
        attendance_percent = round((present_slots / total_slots * 100), 1) if total_slots > 0 else 0

        # 3. Low Attendance Students (Bottom 5 < 75%)
        # Fetch all students and calc their aggregate (Simplified for MVP)
        students = Student.objects.filter(department=department)
        low_attendance_list = []
        
        for stud in students:
            # Check last 30 days attendance
            s_recs = Attendance.objects.filter(student=stud)
            s_total = s_recs.count()
            s_present = s_recs.filter(status='P').count()
            s_pct = round((s_present / s_total * 100), 1) if s_total > 0 else 0
            
            if s_pct < 75 and s_total > 0:
                low_attendance_list.append({
                    "name": stud.name,
                    "attendance": s_pct
                })
        
        # Sort and take top 5 worst
        low_attendance_list.sort(key=lambda x: x['attendance'])
        low_attendance_list = low_attendance_list[:5]

        # 4. Announcements
        announcements = Announcement.objects.filter(
            audience__in=['ALL', 'TEACHERS', 'DEPT']
        ).order_by('-date')[:2]

        ann_data = [
            {
                "id": a.id,
                "title": a.title,
                "date": a.date.strftime("%Y-%m-%d"),
                "sender": a.sender.username
            }
            for a in announcements
        ]

        profile_image_url = None
        if teacher.profile_image:
            profile_image_url = request.build_absolute_uri(teacher.profile_image.url)

        return Response({
            "hod": {
                "name": teacher.name,
                "department": department.name,
                "profile_image": profile_image_url
            },
            "stats": {
                "students": student_count,
                "teachers": teacher_count,
                "subjects": subject_count,
                "today_attendance": attendance_percent
            },
            "low_attendance": low_attendance_list,
            "announcements": ann_data
        })

class HODAttendanceStatsView(APIView):
    def get(self, request, dept_id):
        # 1. Overall Dept Attendance (Last 30 days)
        today = date.today()
        month_ago = today - timedelta(days=30)
        
        # All attendance records for this dept in last 30 days
        recs = Attendance.objects.filter(
            student__department_id=dept_id,
            date__gte=month_ago
        )
        
        total = recs.count()
        present = recs.filter(status='P').count()
        overall_pct = round((present / total * 100), 1) if total > 0 else 0
        
        # 2. Subject-wise Attendance
        subject_stats = (
            recs.values('subject__name')
            .annotate(
                total=Count('id'),
                present=Count('id', filter=Q(status='P'))
            )
            .order_by('subject__name')
        )
        
        subjects_data = []
        for s in subject_stats:
            p = round((s['present'] / s['total'] * 100), 1) if s['total'] > 0 else 0
            subjects_data.append({
                "subject": s['subject__name'],
                "percentage": p
            })
            
        # 3. Low Attendance Students (Below 75%)
        students = Student.objects.filter(department_id=dept_id)
        low_attendance = []
        
        for stud in students:
            s_recs = Attendance.objects.filter(student=stud)
            s_total = s_recs.count()
            s_present = s_recs.filter(status='P').count()
            s_pct = round((s_present / s_total * 100), 1) if s_total > 0 else 0
            
            if s_pct < 75 and s_total > 0:
                low_attendance.append({
                    "id": stud.id,
                    "name": stud.name,
                    "reg_no": stud.register_number,
                    "percentage": s_pct,
                    "semester": stud.semester
                })
        
        low_attendance.sort(key=lambda x: x['percentage'])
        
        return Response({
            "overall_percentage": overall_pct,
            "subject_breakdown": subjects_data,
            "low_attendance_students": low_attendance
        })

class HODTimetableGetView(APIView):
    def get(self, request, dept_id):
        entries = TimeTable.objects.filter(department_id=dept_id).select_related('subject', 'teacher', 'period')
        
        data = []
        for e in entries:
            data.append({
                "id": e.id,
                "day": e.day,
                "period": e.period.number if e.period else 0,
                "subject": e.subject.name,
                "subject_id": e.subject.id,
                "teacher": e.teacher.name if e.teacher else "Unassigned",
                "teacher_id": e.teacher.id if e.teacher else None,
                "semester": e.semester
            })
            
        return Response(data)

class HODInternalMarksView(APIView):
    def get(self, request, dept_id):
        from core.models import InternalMark
        
        subjects = Subject.objects.filter(department_id=dept_id).order_by('semester', 'name')
        
        data = []
        for sub in subjects:
            marks = InternalMark.objects.filter(subject=sub)
            count = marks.count()
            
            status_text = "Pending"
            if count > 0:
                if marks.filter(is_approved=True).exists():
                     if marks.filter(is_approved=False).count() == 0:
                         status_text = "Approved"
                     else:
                         status_text = "Partial Approval"
                elif marks.filter(is_submitted=True).exists():
                     status_text = "Submitted"
                else:
                     status_text = "Draft"
            
            teacher_names = [ts.teacher.name for ts in TeacherSubject.objects.filter(subject=sub)]
            teacher_str = ", ".join(teacher_names) if teacher_names else "Unassigned"
            
            data.append({
                "subject_id": sub.id,
                "subject_name": sub.name,
                "code": sub.code,
                "semester": sub.semester,
                "teacher": teacher_str,
                "status": status_text,
                "student_count": count
            })
            
        return Response(data)
    
    def post(self, request):
        from core.models import InternalMark
        subject_id = request.data.get('subject_id')
        action = request.data.get('action') # 'APPROVE' or 'RETURN'
        
        if not subject_id or not action:
             return Response({"error": "Missing params"}, status=status.HTTP_400_BAD_REQUEST)
             
        marks = InternalMark.objects.filter(subject_id=subject_id)
        
        if action == 'APPROVE':
            marks.update(is_approved=True, is_submitted=True, is_draft=False)
            return Response({"message": "Marks Approved & Locked"})
            
        elif action == 'RETURN':
            marks.update(is_approved=False, is_submitted=False, is_draft=True)
            return Response({"message": "Marks Returned to Teacher"})
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class TeacherScheduleView(APIView):
    def get(self, request, teacher_id):
        date_str = request.GET.get('date')
        if not date_str:
            return Response({"error": "Date parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
             return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        schedule = teacher.get_periods_for_date(target_date)
        return Response(schedule)

class TeacherWeeklyTimetableView(APIView):
    def get(self, request, teacher_id):
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all timetable entries for the teacher's department instead of just the teacher
        entries = TimeTable.objects.filter(department=teacher.department).select_related('teacher', 'subject', 'period', 'department')
        
        data = []
        for entry in entries:
            data.append({
                "day": entry.day, # MON, TUE...
                "period": entry.period.number,
                "subject": entry.subject.name,
                "code": entry.subject.code,
                "semester": entry.semester,
                "department": entry.department.code,
                "teacher_name": entry.teacher.name if entry.teacher else "Unassigned"
            })
            
        return Response(data)
class TeacherInternalMarkEntryView(APIView):
    def get(self, request, subject_id):
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND)
            
        enrollments = Enrollment.objects.filter(subject=subject).select_related('student')
        
        from core.models import InternalMark
        
        data = []
        for enroll in enrollments:
            student = enroll.student
            
            # Get or Init Mark
            mark_obj = InternalMark.objects.filter(student=student, subject=subject).first()
            
            if mark_obj:
                entry = {
                    "student_id": student.id,
                    "name": student.name,
                    "reg_no": student.register_number,
                    "test_1_scored": mark_obj.test_1_scored,
                    "test_1_total": mark_obj.test_1_total,
                    "test_2_scored": mark_obj.test_2_scored,
                    "test_2_total": mark_obj.test_2_total,
                    "total": mark_obj.total,
                    "is_submitted": mark_obj.is_submitted,
                    "is_approved": mark_obj.is_approved
                }
            else:
                entry = {
                    "student_id": student.id,
                    "name": student.name,
                    "reg_no": student.register_number,
                    "test_1_scored": 0,
                    "test_1_total": 50, 
                    "test_2_scored": 0,
                    "test_2_total": 50,
                    "total": 0,
                    "is_submitted": False,
                    "is_approved": False
                }
            data.append(entry)
            
        return Response({
            "subject": subject.name,
            "code": subject.code,
            "marks": data
        })

    def post(self, request, subject_id):
        marks_data = request.data.get('marks') 
        
        if not marks_data:
             return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response({"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND)
            
        from core.models import InternalMark
        
        updated_count = 0
        
        for item in marks_data:
            student_id = item.get('student_id')
            
            t1_s = float(item.get('test_1_scored', 0))
            t1_t = float(item.get('test_1_total', 50))
            
            t2_s = float(item.get('test_2_scored', 0))
            t2_t = float(item.get('test_2_total', 50))
            
            # Total Calculation: Sum of scored marks
            total = t1_s + t2_s
            
            obj, created = InternalMark.objects.update_or_create(
                student_id=student_id,
                subject=subject,
                defaults={
                    'test_1_scored': t1_s,
                    'test_1_total': t1_t,
                    'test_2_scored': t2_s,
                    'test_2_total': t2_t,
                    'total': total,
                    'is_draft': True 
                }
            )
            updated_count += 1
            
        return Response({"message": "Marks updated successfully", "count": updated_count})
