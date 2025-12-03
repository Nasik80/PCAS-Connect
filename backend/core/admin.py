from django.contrib import admin
from .models import Department, Subject, Student, Teacher, Enrollment, Attendance, TeacherSubject,  Period, TimeTable


class EnrollmentAdmin(admin.ModelAdmin):

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "subject":
            try:
                student_id = request.resolver_match.kwargs.get('object_id')
                if student_id:
                    student = Student.objects.get(id=student_id)
                    kwargs["queryset"] = Subject.objects.filter(
                        semester=student.semester,
                        department=student.department
                    )
            except:
                pass

        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'register_number', 'semester', 'total_credits')

admin.site.register(Student, StudentAdmin)
admin.site.register(Department)
admin.site.register(Subject)
admin.site.register(Teacher)
admin.site.register(Enrollment)
admin.site.register(Attendance)
admin.site.register(TeacherSubject)
admin.site.register(Period)
admin.site.register(TimeTable)