
class HODInternalMarksView(APIView):
    def get(self, request, dept_id):
        # Return status of internal marks for all subjects in department
        # Grouped by Semester -> Subject
        
        subjects = Subject.objects.filter(department_id=dept_id).order_by('semester', 'name')
        
        data = []
        for sub in subjects:
            # Check status of marks for this subject
            # Logic: If at least one record exists and is_submitted=True, we consider it submitted
            # If all are is_approved=True, it's Approved.
            
            marks = InternalMark.objects.filter(subject=sub)
            count = marks.count()
            
            status_text = "Pending"
            if count > 0:
                if marks.filter(is_approved=True).exists(): # optimizing logic
                     # If any are approved, assume process started. 
                     # Ideally all should be approved to be "Fully Approved".
                     if marks.filter(is_approved=False).count() == 0:
                         status_text = "Approved"
                     else:
                         status_text = "Partial Approval"
                elif marks.filter(is_submitted=True).exists():
                     status_text = "Submitted"
                else:
                     status_text = "Draft"
            
            # Find assigned teacher
            # Assuming one teacher per subject for simplicity or take first
            teacher_names = [ts.teacher.name for ts in TeacherSubject.objects.filter(subject=sub)]
            teacher_str = ", ".join(teacher_names) if teacher_names else "Unassigned"
            
            data.append({
                "subject_id": sub.id,
                "subject_name": sub.name,
                "code": sub.code,
                "semester": sub.semester,
                "teacher": teacher_str,
                "status": status_text,
                "student_count": count
            })
            
        return Response(data)
    
    def post(self, request):
        # Approve Marks for a Subject
        subject_id = request.data.get('subject_id')
        action = request.data.get('action') # 'APPROVE' or 'RETURN'
        
        if not subject_id or not action:
             return Response({"error": "Missing params"}, status=status.HTTP_400_BAD_REQUEST)
             
        marks = InternalMark.objects.filter(subject_id=subject_id)
        
        if action == 'APPROVE':
            marks.update(is_approved=True, is_submitted=True, is_draft=False)
            return Response({"message": "Marks Approved & Locked"})
            
        elif action == 'RETURN':
            # Unlock for teacher
            marks.update(is_approved=False, is_submitted=False, is_draft=True)
            return Response({"message": "Marks Returned to Teacher"})
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
