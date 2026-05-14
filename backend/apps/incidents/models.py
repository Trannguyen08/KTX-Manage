from django.db import models

from apps.core.models import TimestampedModel
from apps.rooms.models import Room
from apps.students.models import Student


class Incident(TimestampedModel):
    class IncidentCategory(models.TextChoices):
        ELECTRICITY = "electricity", "Điện"
        WATER = "water", "Nước"
        FURNITURE = "furniture", "Cơ sở vật chất"
        INTERNET = "internet", "Internet"
        OTHER = "other", "Khác"

    class IncidentPriority(models.TextChoices):
        LOW = "low", "Thấp"
        MEDIUM = "medium", "Trung bình"
        HIGH = "high", "Cao"
        URGENT = "urgent", "Khẩn cấp"

    class IncidentStatus(models.TextChoices):
        PENDING = "pending", "Đang chờ"
        IN_PROGRESS = "in_progress", "Đang xử lý"
        RESOLVED = "resolved", "Đã xong"
        CLOSED = "closed", "Đã đóng"

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=IncidentCategory.choices, default=IncidentCategory.OTHER)
    priority = models.CharField(max_length=20, choices=IncidentPriority.choices, default=IncidentPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=IncidentStatus.choices, default=IncidentStatus.PENDING)
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="reported_incidents")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="incidents")
    
    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    image = models.URLField(max_length=500, blank=True, help_text="Link ảnh minh chứng sự cố")
    admin_note = models.TextField(blank=True, help_text="Ghi chú từ admin/kỹ thuật")

    class Meta:
        ordering = ["-reported_at"]

    def __str__(self) -> str:
        return f"{self.title} - {self.status}"
