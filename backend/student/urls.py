from django.urls import path
from .views import (
    StudentLoginView,
    StudentDashboardView,
    StudentAttendanceTodayView,
    StudentAttendanceMonthlyView,
    StudentTimeTableView,
    StudentProfileDetailView,
    StudentChangePasswordView
)

urlpatterns = [
    path('login/', StudentLoginView.as_view(), name='student-login'),
    path('<int:student_id>/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('<int:student_id>/attendance/today/', StudentAttendanceTodayView.as_view(), name='student-attendance-today'),
    path('<int:student_id>/attendance/monthly/<int:year>/<int:month>/', StudentAttendanceMonthlyView.as_view(), name='student-attendance-monthly'),
    path('<int:student_id>/timetable/', StudentTimeTableView.as_view(), name='student-timetable'),
    path('<int:student_id>/profile/', StudentProfileDetailView.as_view(), name='student-profile'),
    path('change-password/', StudentChangePasswordView.as_view(), name='student-change-password'),
]
