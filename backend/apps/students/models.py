from django.db import models

from apps.core.models import TimestampedModel
from apps.rooms.models import Room


from django.conf import settings

class Student(TimestampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile", null=True, blank=True)
    class StudentStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending"
        MOVED_OUT = "moved_out", "Moved out"
        SUSPENDED = "suspended", "Suspended"
        EXPIRED = "expired", "Expired"

    class Gender(models.TextChoices):
        MALE = "male", "Nam"
        FEMALE = "female", "Nữ"
        OTHER = "other", "Khác"

    student_code = models.CharField(max_length=30, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    school = models.CharField(max_length=160, blank=True)
    major = models.CharField(max_length=160, blank=True)
    class_name = models.CharField(max_length=80, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")
    registered_at = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StudentStatus.choices, default=StudentStatus.PENDING)

    class Meta:
        ordering = ["student_code"]

    def __str__(self) -> str:
        return f"{self.student_code} - {self.full_name}"
