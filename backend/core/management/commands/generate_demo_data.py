import random
import string
from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Department, Batch, Subject, Student, Teacher, Announcement,
    TeacherSubject, Enrollment, Period, Attendance, TimeTable, InternalMark
)

class Command(BaseCommand):
    help = 'Generates comprehensive demo data for PCAS-Connect.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting demo data generation...")

        # 1. Periods
        periods_data = [
            (1, time(9, 0), time(10, 0)),
            (2, time(10, 0), time(11, 0)),
            (3, time(11, 0), time(12, 0)),
            (4, time(13, 0), time(14, 0)),
            (5, time(14, 0), time(15, 0)),
        ]
        periods = []
        for p_num, p_start, p_end in periods_data:
            period, _ = Period.objects.get_or_create(number=p_num, defaults={'start_time': p_start, 'end_time': p_end})
            periods.append(period)

        # 2. Departments
        dept_cs, _ = Department.objects.get_or_create(name="Computer Science", code="CS")
        dept_bba, _ = Department.objects.get_or_create(name="Business Administration", code="BBA")

        # 3. Batches
        batch_2023, _ = Batch.objects.get_or_create(name="2023-2026", start_year=2023, end_year=2026)
        batch_2024, _ = Batch.objects.get_or_create(name="2024-2027", start_year=2024, end_year=2027)

        # 4. Subjects
        subjects_cs_data = [
            ("Advanced Java", "CS301", 3, 4, "CORE"),
            ("Operating Systems", "CS302", 3, 4, "CORE"),
            ("Data Structures", "CS303", 3, 3, "CORE"),
            ("Software Engineering", "CS304", 3, 3, "SEC")
        ]
        subjects_bba_data = [
            ("Marketing Management", "BBA301", 3, 4, "CORE"),
            ("Financial Accounting", "BBA302", 3, 4, "CORE"),
            ("Business Statistics", "BBA303", 3, 3, "CORE"),
            ("Human Resource Mgt", "BBA304", 3, 3, "SEC")
        ]

        subjects_cs = []
        for name, code, sem, credit, stype in subjects_cs_data:
            s, _ = Subject.objects.get_or_create(code=code, defaults={
                'name': name, 'semester': sem, 'credit': credit, 'subject_type': stype, 'department': dept_cs
            })
            subjects_cs.append(s)

        subjects_bba = []
        for name, code, sem, credit, stype in subjects_bba_data:
            s, _ = Subject.objects.get_or_create(code=code, defaults={
                'name': name, 'semester': sem, 'credit': credit, 'subject_type': stype, 'department': dept_bba
            })
            subjects_bba.append(s)

        # 5. Users and Teachers/HODs
        def create_user_teacher(email, name, dept, is_hod):
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            if created:
                user.set_password('password123')
                user.save()
            role = 'HOD' if is_hod else 'TEACHER'
            teacher, _ = Teacher.objects.get_or_create(email=email, defaults={
                'name': name, 'department': dept, 'role': role, 'is_hod': is_hod, 'user': user
            })
            return teacher

        hod_cs = create_user_teacher('hod_cs@demo.com', 'Dr. Alan Turing (HOD)', dept_cs, True)
        teacher_cs1 = create_user_teacher('teacher_cs1@demo.com', 'Grace Hopper', dept_cs, False)
        teacher_cs2 = create_user_teacher('teacher_cs2@demo.com', 'Linus Torvalds', dept_cs, False)

        hod_bba = create_user_teacher('hod_bba@demo.com', 'Peter Drucker (HOD)', dept_bba, True)
        teacher_bba1 = create_user_teacher('teacher_bba1@demo.com', 'Philip Kotler', dept_bba, False)

        # 6. TeacherSubjects (assign subjects to teachers)
        TeacherSubject.objects.get_or_create(teacher=hod_cs, subject=subjects_cs[0])
        TeacherSubject.objects.get_or_create(teacher=teacher_cs1, subject=subjects_cs[1])
        TeacherSubject.objects.get_or_create(teacher=teacher_cs2, subject=subjects_cs[2])
        TeacherSubject.objects.get_or_create(teacher=teacher_cs2, subject=subjects_cs[3])

        TeacherSubject.objects.get_or_create(teacher=hod_bba, subject=subjects_bba[0])
        TeacherSubject.objects.get_or_create(teacher=teacher_bba1, subject=subjects_bba[1])

        # 7. TimeTable (Sem 3)
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
        for day in days:
            for i, p in enumerate(periods):
                # CS timetable
                sub_idx = i % len(subjects_cs)
                t_sub = TeacherSubject.objects.filter(subject=subjects_cs[sub_idx]).first()
                if t_sub:
                    TimeTable.objects.get_or_create(
                        department=dept_cs, semester=3, day=day, period=p,
                        defaults={'subject': t_sub.subject, 'teacher': t_sub.teacher}
                    )

                # BBA timetable
                sub_idx = i % len(subjects_bba)
                t_sub = TeacherSubject.objects.filter(subject=subjects_bba[sub_idx]).first()
                if t_sub:
                    TimeTable.objects.get_or_create(
                        department=dept_bba, semester=3, day=day, period=p,
                        defaults={'subject': t_sub.subject, 'teacher': t_sub.teacher}
                    )

        # 8. Students
        def create_students(dept, batch, sem, prefix, count=10):
            st_list = []
            for i in range(1, count + 1):
                email = f'student_{prefix}{i}@demo.com'
                reg_no = f'REG{dept.code}{batch.start_year}{i:03}'
                user, created = User.objects.get_or_create(username=email, defaults={'email': email})
                user.set_password('password123')
                user.save()
                st, _ = Student.objects.get_or_create(register_number=reg_no, defaults={
                    'name': f'Student {prefix.upper()} {i}', 'email': email,
                    'department': dept, 'semester': sem, 'user': user
                })
                st_list.append(st)
                
                # Enrollment
                subjects = Subject.objects.filter(department=dept, semester=sem)
                for sub in subjects:
                    Enrollment.objects.get_or_create(student=st, subject=sub)
                    
            return st_list

        students_cs = create_students(dept_cs, batch_2023, 3, 'cs', 10)
        students_bba = create_students(dept_bba, batch_2023, 3, 'bba', 10)

        # 9. Attendance
        self.stdout.write("Generating Attendance...")
        today = date.today()
        for i in range(30): # Last 30 days
            d = today - timedelta(days=i)
            day_name = d.strftime('%a').upper()
            if day_name in ('SAT', 'SUN'): continue

            for ttb in TimeTable.objects.filter(day=day_name):
                # We have to fetch all students enrolled in this ttb.subject
                students = Enrollment.objects.filter(subject=ttb.subject).values_list('student_id', flat=True)
                
                att_objs = []
                for st_id in students:
                    status = 'P' if random.random() > 0.2 else 'A' # 80% present
                    if not Attendance.objects.filter(student_id=st_id, subject=ttb.subject, date=d, period=ttb.period).exists():
                        att_objs.append(Attendance(
                            student_id=st_id, subject=ttb.subject, teacher=ttb.teacher,
                            period=ttb.period, date=d, status=status
                        ))
                if att_objs:
                    Attendance.objects.bulk_create(att_objs)

        # 10. Internal Marks
        self.stdout.write("Generating Internal Marks...")
        for st in students_cs:
            for sub in subjects_cs:
                if not InternalMark.objects.filter(student=st, subject=sub).exists():
                    InternalMark.objects.create(
                        student=st, subject=sub,
                        test_1_scored=round(random.uniform(20, 50), 2),
                        test_2_scored=round(random.uniform(25, 50), 2),
                        is_draft=False, is_submitted=True, is_approved=True
                    )
        for st in students_bba:
            for sub in subjects_bba:
                if not InternalMark.objects.filter(student=st, subject=sub).exists():
                    InternalMark.objects.create(
                        student=st, subject=sub,
                        test_1_scored=round(random.uniform(20, 50), 2),
                        test_2_scored=round(random.uniform(25, 50), 2),
                        is_draft=False, is_submitted=True, is_approved=True
                    )

        # 11. Announcements
        self.stdout.write("Generating Announcements...")
        if not Announcement.objects.exists():
            Announcement.objects.create(
                title="Upcoming CIA Exams",
                content="Please be informed that Continuous Internal Assessment exams will start next week. Check your portals for the schedule.",
                sender=hod_cs.user,
                audience='ALL'
            )
            Announcement.objects.create(
                title="Hackathon 2024",
                content="Department of CS is conducting a 24-hour hackathon. Register soon to participate and win exciting prizes!",
                sender=hod_cs.user,
                audience='DEPT',
                department=dept_cs
            )

        self.stdout.write(self.style.SUCCESS("Successfully generated all demo data!"))
        self.stdout.write("-" * 40)
        self.stdout.write("Sample Login Credentials:")
        self.stdout.write("- HOD CS: hod_cs@demo.com / password123")
        self.stdout.write("- Teacher CS: teacher_cs1@demo.com / password123")
        self.stdout.write("- Student CS 1: REGCS2023001 / password123")
        self.stdout.write("- Admin: admin / admin (if existing)")
        self.stdout.write("-" * 40)
