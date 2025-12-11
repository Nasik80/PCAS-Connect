from django.urls import path
from .views import (
    TeacherLoginView,
    TeacherSubjectsView,
    StudentsInSubjectView,
    MarkAttendanceView,
    TeacherTodayTimetableView,
    TeacherTodayStatusView,
    TeacherMonthlySummaryView,
    HODDashboardStatsView,
    HODStudentListView,
    HODPromotionView,
    HODTeacherListView,
    HODAssignTeacherView,
    HODAnnouncementView,
    HODTimetableView,
    TeacherDashboardView,
    HODDashboardView
)

urlpatterns = [
    # Auth
    path('login/', TeacherLoginView.as_view(), name='teacher-login'),

    path('dashboard/teacher/<int:teacher_id>/', TeacherDashboardView.as_view(), name='teacher-dashboard-main'),
    path('dashboard/hod/<int:teacher_id>/', HODDashboardView.as_view(), name='hod-dashboard-main'),

    # Teacher Role
    path('<int:teacher_id>/subjects/', TeacherSubjectsView.as_view(), name='teacher-subjects'),
    path('subject/<int:subject_id>/students/', StudentsInSubjectView.as_view(), name='students-in-subject'),
    path('attendance/mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('<int:teacher_id>/timetable/today/', TeacherTodayTimetableView.as_view(), name='teacher-today-timetable'),
    path('<int:teacher_id>/today-status/', TeacherTodayStatusView.as_view(), name='teacher-today-status'),
    path('<int:teacher_id>/attendance/monthly/<int:year>/<int:month>/', TeacherMonthlySummaryView.as_view(), name='teacher-monthly-summary'),

    # HOD Role
    path('hod/stats/<int:teacher_id>/', HODDashboardStatsView.as_view(), name='hod-stats-old'), # Renamed old one to avoid conflict if needed, or just keep
    path('hod/students/<int:department_id>/', HODStudentListView.as_view(), name='hod-student-list'),
    path('hod/promote/', HODPromotionView.as_view(), name='hod-promote'),
    path('hod/teachers/<int:department_id>/', HODTeacherListView.as_view(), name='hod-teacher-list'),
    path('hod/assign-teacher/', HODAssignTeacherView.as_view(), name='hod-assign-teacher'),
    path('hod/announcement/', HODAnnouncementView.as_view(), name='hod-announcement'),
    path('hod/timetable/', HODTimetableView.as_view(), name='hod-timetable'),
]
