from django.db import models

from apps.core.models import TimestampedModel
from apps.rooms.models import Room


class Student(TimestampedModel):
    class StudentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        MOVED_OUT = "moved_out", "Moved out"
        SUSPENDED = "suspended", "Suspended"

    student_code = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    school = models.CharField(max_length=160, blank=True)
    major = models.CharField(max_length=160, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")
    registered_at = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StudentStatus.choices, default=StudentStatus.PENDING)

    class Meta:
        ordering = ["student_code"]

    def __str__(self) -> str:
        return f"{self.student_code} - {self.full_name}"
