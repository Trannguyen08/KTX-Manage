from django.db import models

from apps.core.models import TimestampedModel
from apps.students.models import Student


class Violation(TimestampedModel):
    class ViolationLevel(models.TextChoices):
        LIGHT = "light", "Nhẹ"
        MEDIUM = "medium", "Trung bình"
        SEVERE = "severe", "Nặng"
        CRITICAL = "critical", "Rất nặng"

    class ViolationStatus(models.TextChoices):
        PENDING = "pending", "Chờ xử lý"
        RESOLVED = "resolved", "Đã xử lý"
        CANCELLED = "cancelled", "Đã hủy"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="violations")
    title = models.CharField(max_length=200)
    description = models.TextField()
    violation_date = models.DateField()
    level = models.CharField(max_length=20, choices=ViolationLevel.choices, default=ViolationLevel.LIGHT)
    status = models.CharField(max_length=20, choices=ViolationStatus.choices, default=ViolationStatus.PENDING)
    penalty = models.CharField(max_length=255, blank=True, help_text="Hình thức xử phạt")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-violation_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.student.full_name} - {self.title}"
