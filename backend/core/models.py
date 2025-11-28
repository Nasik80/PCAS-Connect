from django.db import models
from django.db.models import Count

# ------------------------
# Department
# ------------------------
class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)

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
    name = models.CharField(max_length=100)
    register_number = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()

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

# ------------------------
# Teacher
# ------------------------
class Teacher(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

# ------------------------
# Enrollment (Student-Subject Link)
# ------------------------
class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date_enrolled = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} → {self.subject.name}"

# ------------------------
# Attendance (Subject-wise)
# ------------------------
class Attendance(models.Model):

    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ('student', 'subject', 'date')

    def __str__(self):
        return f"{self.student.name} - {self.subject.name} - {self.status}"
