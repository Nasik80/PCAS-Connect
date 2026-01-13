
# ------------------------
# Internal Marks
# ------------------------
class InternalMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    
    test_1 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    test_2 = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    assignment = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    attendance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    total = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Workflow Status
    is_draft = models.BooleanField(default=True)
    is_submitted = models.BooleanField(default=False) # Teacher submitted
    is_approved = models.BooleanField(default=False)  # HOD approved (Locked)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject')

    def __str__(self):
        return f"{self.student.name} - {self.subject.code} ({self.total})"
