from django.db import models
from django.db.models import Count
from django.contrib.auth.models import User

# ------------------------
# Department
# ------------------------
class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)

    def __str__(self):
        return self.name

# ------------------------
# Batch (New)
# ------------------------
class Batch(models.Model):
    name = models.CharField(max_length=50) # e.g., "2023-2026"
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# ------------------------
# Subject
# ------------------------
class Subject(models.Model):

    SUBJECT_TYPES = [
        ('CORE', 'Core'),
        ('SEC', 'Skill Enhancement'),
        ('VAC', 'Value Added'),
        ('DSE', 'Discipline Specific Elective'),
        ('MDC', 'Multi Disciplinary'),
        ('AEC', 'Ability Enhancement'),
    ]

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20)
    semester = models.IntegerField()
    credit = models.IntegerField()
    subject_type = models.CharField(max_length=10, choices=SUBJECT_TYPES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} (Sem {self.semester})"


# ------------------------
# Student
# ------------------------


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    register_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()
    dob = models.DateField(null=True, blank=True)


    def __str__(self):
        return self.name

    # ✅ Total credits from enrolled subjects
    def total_credits(self):
        return sum(e.subject.credit for e in self.enrollment_set.all())

    # ✅ Attendance % for a subject
    def attendance_percentage(self, subject):
        total = Attendance.objects.filter(student=self, subject=subject).count()
        present = Attendance.objects.filter(
            student=self, subject=subject, status='P'
        ).count()

        if total == 0:
            return 0
        return round((present / total) * 100, 2)

    # In backend/core/models.py inside class Student:

    def get_today_attendance(self):
       from .models import Attendance
       from datetime import date
 
       today = date.today()

       # Fetch records with subject and period details
       records = Attendance.objects.filter(student=self, date=today).select_related('subject', 'period').order_by('period__number')

       total_periods = records.count()
       present_periods = records.filter(status='P').count()
       absent_periods = total_periods - present_periods # Calculate absents

       percentage = 0
       if total_periods > 0:
         percentage = round((present_periods / total_periods) * 100, 2)

       # Create the details list for the frontend
       details = []
       for record in records:
           details.append({
               "period": record.period.number,
               "subject": record.subject.name,
               "status": record.status
           })

       return {
        "present": present_periods,
        "absent": absent_periods, # Added absent count
        "total": total_periods,   # Frontend expects 'total'
        "percentage": percentage,
        "details": details        # Added the list of subjects
    }
    def get_monthly_attendance(self, year, month):
      from .models import Attendance
      from datetime import date

      records = Attendance.objects.filter(
        student=self,
        date__year=year,
        date__month=month
     )

      total_classes = records.count()
      present_classes = records.filter(status='P').count()

      percentage = 0
      if total_classes > 0:
        percentage = round((present_classes / total_classes) * 100, 2)

    # Subject-wise breakdown
      subjects = records.values('subject__name').distinct()

      subject_data = []
      for s in subjects:
        name = s['subject__name']
        sub_records = records.filter(subject__name=name)

        total_sub = sub_records.count()
        present_sub = sub_records.filter(status='P').count()

        sub_percent = 0
        if total_sub > 0:
            sub_percent = round((present_sub / total_sub) * 100, 2)

        subject_data.append({
            "subject": name,
            "present": present_sub,
            "total": total_sub,
            "percentage": sub_percent
        })

      return {
        "present": present_classes,
        "total": total_classes,
        "percentage": percentage,
        "subjects": subject_data
    }

# ------------------------
# Teacher
# ------------------------
class Teacher(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]

    ROLE_CHOICES = [
        ('TEACHER', 'Teacher'),
        ('HOD', 'HOD'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    
    # New fields to match DB
    phone = models.CharField(max_length=20, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    date_of_joining = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    qualification = models.CharField(max_length=100, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='TEACHER')

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    is_hod = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Announcement(models.Model):
    AUDIENCE_CHOICES = [
        ('ALL', 'Entire College'),
        ('STUDENTS', 'All Students'),
        ('TEACHERS', 'All Teachers'),
        ('DEPT', 'Department Specific'),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True) # If specific to dept
    semester = models.IntegerField(null=True, blank=True) # If specific to semester

    def __str__(self):
        return self.title
    

    # 🔥 Get all subjects handled by this teacher
    def subjects(self):
        return [ts.subject for ts in self.teachersubject_set.all()]

    # 🔥 Get all students enrolled in the teacher's subjects
    def students_for_subject(self, subject):
        return [e.student for e in Enrollment.objects.filter(subject=subject)]
    
    def get_today_periods(self):
      from datetime import datetime, date
      from core.models import TimeTable, Attendance

      today = datetime.now().strftime("%a").upper()
      today_date = date.today()

    # Get today's timetable entries for this teacher
      periods = TimeTable.objects.filter(
        teacher=self,
        day=today
     )

      result = []
      for p in periods:
        # Check if attendance exists for this period already
        attendance_done = Attendance.objects.filter(
            teacher=self,
            period=p.period,
            date=today_date,
            subject=p.subject
        ).exists()

        result.append({
            "period_number": p.period.number,
            "subject": p.subject.name,
            "attendance_done": attendance_done
        })

      return result

    def get_monthly_summary(self, year, month):
      from core.models import Attendance
      from django.db.models import Count

    # All attendance records marked by this teacher in the month
      records = Attendance.objects.filter(
        teacher=self,
        date__year=year,
        date__month=month
      )

      total_classes_taken = records.count()

    # Subject-wise summary
      subject_summary = (
        records.values('subject__name')
        .annotate(count=Count('id'))
        .order_by('subject__name')
      )

    # Dates teacher taught
      days_taught = (
        records.values_list('date', flat=True)
        .distinct()
        .order_by('date')
      )

    # Format subject data
      subjects = [
        {
            "subject": s['subject__name'],
            "classes_taken": s['count']
        }
        for s in subject_summary
      ]

      return {
        "total_classes_taken": total_classes_taken,
        "subject_breakdown": subjects,
        "days_taught": list(days_taught)
 }

class TeacherSubject(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('teacher', 'subject')

    def __str__(self):
        return f"{self.teacher.name} → {self.subject.name}"


# ------------------------
# Enrollment (Student-Subject Link)
# ------------------------
class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date_enrolled = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} → {self.subject.name}"
    
class Period(models.Model):
    number = models.IntegerField()  # 1,2,3,4,5
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Period {self.number} ({self.start_time}-{self.end_time})"

# ------------------------
# Attendance (Subject-wise)
# ------------------------
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)  # actual subject taken
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ('student', 'subject', 'date', 'period')

    def __str__(self):
        return f"{self.student.name} - {self.subject.name} - P{self.period.number} - {self.date} ({self.status})"




class TimeTable(models.Model):
    DAYS = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()
    day = models.CharField(max_length=3, choices=DAYS)
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('department', 'semester', 'day', 'period')

    def __str__(self):
        return f"{self.department.code} Sem {self.semester} - {self.get_day_display()} P{self.period.number}"
