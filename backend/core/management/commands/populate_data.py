
from django.core.management.base import BaseCommand
from core.models import User, Department, Teacher, Student, Subject, Enrollment, TimeTable, Period, TeacherSubject, Attendance, InternalMark
from django.utils import timezone
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Populates the database with demo data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting Data Population...")
        
        # 1. Clean Data (Optional - Keep existing if needed, but for 'demo' script usually better to ensure specific state)
        # self.stdout.write("Cleaning old data...")
        # Attendance.objects.all().delete()
        # InternalMark.objects.all().delete()
        # Student.objects.all().delete()
        # TimeTable.objects.all().delete()
        # TeacherSubject.objects.all().delete()
        # Subject.objects.all().delete()
        # Teacher.objects.all().delete()
        # Department.objects.all().delete()
        # User.objects.filter(is_superuser=False).delete()
        
        # 2. Departments
        cs_dept, _ = Department.objects.get_or_create(name="Computer Science", code="CS")
        comm_dept, _ = Department.objects.get_or_create(name="Commerce", code="COM")
        
        # 3. Periods
        for i in range(1, 7):
            Period.objects.get_or_create(
                number=i,
                defaults={
                    'start_time': f"{9+i}:00",
                    'end_time': f"{10+i}:00"
                }
            )
        periods = list(Period.objects.all())

        # 4. Teachers (HODs)
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True})
        if not admin_user.check_password('admin'):
            admin_user.set_password('admin')
            admin_user.save()

        # CS HOD
        hod_cs_user, _ = User.objects.get_or_create(username='hod_cs', defaults={'email': 'hod.cs@pcas.edu'})
        hod_cs_user.set_password('password123')
        hod_cs_user.save()
        
        hod_cs, created = Teacher.objects.get_or_create(
            user=hod_cs_user,
            defaults={
                'name': "Dr. Alan Turing",
                'email': "hod.cs@pcas.edu",
                'department': cs_dept,
                'is_hod': True,
                'phone': "9998887771",
                'gender': 'Male'
            }
        )

        # Commerce HOD
        hod_com_user, _ = User.objects.get_or_create(username='hod_com', defaults={'email': 'hod.com@pcas.edu'})
        hod_com_user.set_password('password123')
        hod_com_user.save()
        
        hod_com, created = Teacher.objects.get_or_create(
            user=hod_com_user,
            defaults={
                'name': "Dr. Adam Smith",
                'email': "hod.com@pcas.edu",
                'department': comm_dept,
                'is_hod': True,
                'phone': "9998887772",
                'gender': 'Male'
            }
        )

        # Teachers
        teachers_list = [
            ("Ada Lovelace", "ada@pcas.edu", cs_dept),
            ("Grace Hopper", "grace@pcas.edu", cs_dept),
            ("Luca Pacioli", "luca@pcas.edu", comm_dept),
            ("John Maynard", "john@pcas.edu", comm_dept)
        ]

        created_teachers = []
        for name, email, dept in teachers_list:
            u, _ = User.objects.get_or_create(username=email.split('@')[0], defaults={'email': email})
            u.set_password('password123')
            u.save()
            t, _ = Teacher.objects.get_or_create(
                user=u,
                defaults={'name': name, 'email': email, 'department': dept, 'phone': '1234567890'}
            )
            created_teachers.append(t)

        all_cs_teachers = [hod_cs] + [t for t in created_teachers if t.department == cs_dept]

        # 5. Subjects
        subjects_data = [
            # CS Sem 1
            ("Programming in C", "CS101", 1, cs_dept),
            ("Calculus", "MAT101", 1, cs_dept),
            ("Digital Electronics", "CS102", 1, cs_dept),
            # CS Sem 3
            ("Data Structures", "CS301", 3, cs_dept),
            ("Java Programming", "CS302", 3, cs_dept),
            ("DBMS", "CS303", 3, cs_dept),
            # CS Sem 6
            ("Major Project", "CS601", 6, cs_dept),
            ("Cloud Computing", "CS602", 6, cs_dept)
        ]

        created_subjects = []
        for name, code, sem, dept in subjects_data:
            s, _ = Subject.objects.get_or_create(
                code=code,
                defaults={'name': name, 'semester': sem, 'department': dept, 'credit': 4, 'subject_type': 'CORE'}
            )
            created_subjects.append(s)

        # Assign Subjects to Teachers
        for i, sub in enumerate(created_subjects):
            # Round robin assignment
            teacher = all_cs_teachers[i % len(all_cs_teachers)]
            TeacherSubject.objects.get_or_create(teacher=teacher, subject=sub)

        # 6. Students
        # Generate 10 students for Sem 1, 3, 6
        student_names = [
            "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
            "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Anika", "Navya", "Angel", "Myra", "Siya"
        ]

        for sem in [1, 3, 6]:
            for i in range(5): # 5 students per batch
                name = f"{random.choice(student_names)} {random.choice(['Kumar', 'Sharma', 'Singh', 'Patel'])}"
                reg = f"PCAS{cs_dept.code}{sem}00{i+1}"
                
                u, _ = User.objects.get_or_create(username=reg, defaults={'email': f"{reg.lower()}@pcas.edu"})
                u.set_password('password123')
                u.save()
                
                s, _ = Student.objects.get_or_create(
                    register_number=reg,
                    defaults={
                        'name': name,
                        'email': f"{reg.lower()}@pcas.edu",
                        'department': cs_dept,
                        'semester': sem,
                        'user': u,
                        'dob': date(2000+sem, 1, 1)
                    }
                )
                
                # Enroll in semester subjects
                batch_subjects = [sub for sub in created_subjects if sub.semester == sem]
                for sub in batch_subjects:
                    Enrollment.objects.get_or_create(student=s, subject=sub)
                    
                    # 7. Internal Marks
                    if random.random() > 0.3: # 70% chance to have marks
                         InternalMark.objects.get_or_create(
                             student=s,
                             subject=sub,
                             defaults={
                                 'test_1': random.randint(15, 20),
                                 'test_2': random.randint(15, 20),
                                 'assignment': random.randint(8, 10),
                                 'attendance_score': random.randint(4, 5),
                                 'total': random.randint(40, 50),
                                 'is_submitted': True,
                                 'is_approved': random.choice([True, False])
                             }
                         )

        # 7. Timetable (For CS Sem 1 & 3)
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
        for sem in [1, 3]:
            batch_subjects = [sub for sub in created_subjects if sub.semester == sem]
            if not batch_subjects: continue
            
            for day in days:
                for p in periods:
                    # Random subject
                    sub = random.choice(batch_subjects)
                    # Get assigned teacher
                    ts = TeacherSubject.objects.filter(subject=sub).first()
                    teacher = ts.teacher if ts else all_cs_teachers[0]
                    
                    TimeTable.objects.get_or_create(
                         department=cs_dept,
                         semester=sem,
                         day=day,
                         period=p,
                         defaults={'subject': sub, 'teacher': teacher}
                    )

        # 8. Attendance (Last 7 days)
        # Iterate dates, get timetable, get students, mark 'P' or 'A'
        start_date = date.today() - timedelta(days=7)
        end_date = date.today()
        
        delta = timedelta(days=1)
        curr = start_date
        while curr <= end_date:
            day_str = curr.strftime("%a").upper()
            if day_str in days:
                entries = TimeTable.objects.filter(department=cs_dept, day=day_str)
                for entry in entries:
                    students = Student.objects.filter(department=cs_dept, semester=entry.semester)
                    for stud in students:
                        status = 'P' if random.random() > 0.1 else 'A' # 90% Present
                        Attendance.objects.get_or_create(
                            student=stud,
                            subject=entry.subject,
                            teacher=entry.teacher,
                            period=entry.period,
                            date=curr,
                            defaults={'status': status}
                        )
            curr += delta

        self.stdout.write(self.style.SUCCESS('Successfully populated database with demo data'))
