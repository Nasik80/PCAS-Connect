
class TeacherScheduleView(APIView):
    def get(self, request, teacher_id):
        date_str = request.GET.get('date')
        if not date_str:
            return Response({"error": "Date parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
             return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

        schedule = teacher.get_periods_for_date(target_date)
        return Response(schedule)
