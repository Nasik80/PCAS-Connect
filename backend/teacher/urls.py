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
    HODDashboardView,
    GetAttendanceView,
    HODAttendanceStatsView,
    HODTimetableGetView,
    HODInternalMarksView,
    HODInternalMarksView,
    TeacherScheduleView,
    TeacherWeeklyTimetableView
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
    path('schedule/<int:teacher_id>/', TeacherScheduleView.as_view(), name='teacher-schedule'),
    path('timetable/weekly/<int:teacher_id>/', TeacherWeeklyTimetableView.as_view(), name='teacher-weekly-timetable'),
    path('attendance/get/', GetAttendanceView.as_view(), name='get-attendance'),
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
    path('hod/timetable/<int:dept_id>/', HODTimetableGetView.as_view(), name='hod-timetable-get'),
    path('hod/attendance/stats/<int:dept_id>/', HODAttendanceStatsView.as_view(), name='hod-attendance-stats'),
    path('hod/internal-marks/<int:dept_id>/', HODInternalMarksView.as_view(), name='hod-internal-marks'),
    path('hod/internal-marks/action/', HODInternalMarksView.as_view(), name='hod-internal-marks-action'),
]
