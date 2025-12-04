from django.contrib import admin
from django.urls import path
from core.views import teacher_subjects, students_in_subject, mark_attendance, student_login, student_dashboard, teacher_today_timetable, semester_subjects, student_attendance_today, student_attendance_monthly, teacher_today_status, teacher_monthly_summary, admin_student_attendance, admin_semester_attendance, export_semester_attendance_excel, student_timetable
from core.views import admin_login, admin_dashboard_stats 
urlpatterns = [
    path('admin/', admin.site.urls),

    # Teacher module APIs
    path('api/teacher/<int:teacher_id>/subjects/', teacher_subjects),
    path('api/subject/<int:subject_id>/students/', students_in_subject),
    path('api/attendance/mark/', mark_attendance),
    path('api/student/login/', student_login),
    path('api/student/<int:student_id>/dashboard/', student_dashboard),
    path('api/teacher/<int:teacher_id>/timetable/today/', teacher_today_timetable),
    path('api/subjects/<int:department_id>/<int:semester>/', semester_subjects),
    path('api/student/<int:student_id>/attendance/today/', student_attendance_today),
    path('api/student/<int:student_id>/attendance/monthly/<int:year>/<int:month>/', student_attendance_monthly),
    path('api/teacher/<int:teacher_id>/today-status/', teacher_today_status),
    path('api/teacher/<int:teacher_id>/attendance/monthly/<int:year>/<int:month>/', teacher_monthly_summary),
    path('api/admin/student/<int:student_id>/attendance/<int:year>/<int:month>/', admin_student_attendance),
    path('api/admin/attendance/semester/<int:department_id>/<int:semester>/<int:year>/<int:month>/', admin_semester_attendance),
    path('api/admin/export/semester/<int:department_id>/<int:semester>/<int:year>/<int:month>/',export_semester_attendance_excel),
    path('api/student/<int:student_id>/timetable/', student_timetable),
    path('api/admin/login/', admin_login),
    path('api/admin/dashboard/stats/', admin_dashboard_stats),

]
