from django.urls import path
from .views import (
    AdminLoginView,
    AdminDashboardStatsView,
    SearchStudentsView,
    GetDepartmentsView,
    AdminStudentAttendanceView,
    AdminSemesterAttendanceView,
    ExportSemesterAttendanceExcelView,
    SemesterSubjectsView,
    AddStudentView,
    AddTeacherView,
    AddDepartmentView,
    AddSubjectView,
    PromoteStudentsView,
    AdminStudentListView,
    AdminStudentDetailView,
    AdminStudentPasswordResetView,
    AdminTeacherListView,
    AdminTeacherDetailView,
    AdminTeacherPasswordResetView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('search/students/', SearchStudentsView.as_view(), name='search-students'),
    path('utils/departments/', GetDepartmentsView.as_view(), name='get-departments'),
    path('student/<int:student_id>/attendance/<int:year>/<int:month>/', AdminStudentAttendanceView.as_view(), name='admin-student-attendance'),
    path('attendance/semester/<int:department_id>/<int:semester>/<int:year>/<int:month>/', AdminSemesterAttendanceView.as_view(), name='admin-semester-attendance'),
    path('export/semester/<int:department_id>/<int:semester>/<int:year>/<int:month>/', ExportSemesterAttendanceExcelView.as_view(), name='export-semester-attendance'),
    # Shared / Admin APIs that seem to fit here or need a home. Since SemesterSubjectsView was "Shared / Admin" in original urls.

    path('subjects/<int:department_id>/<int:semester>/', SemesterSubjectsView.as_view(), name='semester-subjects'),
    
    # Creation Endpoints
    path('add/student/', AddStudentView.as_view(), name='add-student'),
    path('add/teacher/', AddTeacherView.as_view(), name='add-teacher'),
    path('add/department/', AddDepartmentView.as_view(), name='add-department'),
    path('add/subject/', AddSubjectView.as_view(), name='add-subject'),
    
    # Promotion
    path('promote/students/', PromoteStudentsView.as_view(), name='promote-students'),
    
    # Student Management
    path('students/list/', AdminStudentListView.as_view(), name='admin-student-list'),
    path('student/<int:pk>/', AdminStudentDetailView.as_view(), name='admin-student-detail'),
    path('student/<int:pk>/reset-password/', AdminStudentPasswordResetView.as_view(), name='admin-student-password-reset'),

    # Teacher Management
    path('teachers/list/', AdminTeacherListView.as_view(), name='admin-teacher-list'),
    path('teacher/<int:pk>/', AdminTeacherDetailView.as_view(), name='admin-teacher-detail'),
    path('teacher/<int:pk>/reset-password/', AdminTeacherPasswordResetView.as_view(), name='admin-teacher-password-reset'),
]
