
class HODAttendanceStatsView(APIView):
    def get(self, request, dept_id):
        # 1. Overall Dept Attendance (Last 30 days)
        today = date.today()
        month_ago = today - timedelta(days=30)
        
        # All attendance records for this dept in last 30 days
        recs = Attendance.objects.filter(
            student__department_id=dept_id,
            date__gte=month_ago
        )
        
        total = recs.count()
        present = recs.filter(status='P').count()
        overall_pct = round((present / total * 100), 1) if total > 0 else 0
        
        # 2. Subject-wise Attendance
        subject_stats = (
            recs.values('subject__name')
            .annotate(
                total=Count('id'),
                present=Count('id', filter=Q(status='P'))
            )
            .order_by('subject__name')
        )
        
        subjects_data = []
        for s in subject_stats:
            p = round((s['present'] / s['total'] * 100), 1) if s['total'] > 0 else 0
            subjects_data.append({
                "subject": s['subject__name'],
                "percentage": p
            })
            
        # 3. Low Attendance Students (Below 75%)
        # This requires aggregation per student.
        # We'll calculate for ALL students in dept.
        students = Student.objects.filter(department_id=dept_id)
        low_attendance = []
        
        for stud in students:
            # Quick calc - maybe redundant if `attendance_percentage` method exists but that's per subject
            # Let's do overall per student
            s_recs = Attendance.objects.filter(student=stud)
            s_total = s_recs.count()
            s_present = s_recs.filter(status='P').count()
            s_pct = round((s_present / s_total * 100), 1) if s_total > 0 else 0
            
            if s_pct < 75 and s_total > 0:
                low_attendance.append({
                    "id": stud.id,
                    "name": stud.name,
                    "reg_no": stud.register_number,
                    "percentage": s_pct,
                    "semester": stud.semester
                })
        
        # Sort by lowest first
        low_attendance.sort(key=lambda x: x['percentage'])
        
        return Response({
            "overall_percentage": overall_pct,
            "subject_breakdown": subjects_data,
            "low_attendance_students": low_attendance
        })

class HODTimetableGetView(APIView):
    def get(self, request, dept_id):
        # Fetch all timetable entries for dept
        entries = TimeTable.objects.filter(department_id=dept_id).select_related('subject', 'teacher')
        
        data = []
        for e in entries:
            data.append({
                "id": e.id,
                "day": e.day,
                "period": e.period.number if e.period else 0,
                "subject": e.subject.name,
                "subject_id": e.subject.id,
                "teacher": e.teacher.name if e.teacher else "Unassigned",
                "teacher_id": e.teacher.id if e.teacher else None,
                "semester": e.semester
            })
            
        return Response(data)
