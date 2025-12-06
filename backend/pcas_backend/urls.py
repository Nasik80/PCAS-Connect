from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Routes
    path('api/student/', include('student.urls')),
    path('api/teacher/', include('teacher.urls')),
    path('api/admin/', include('adminpanel.urls')),
]