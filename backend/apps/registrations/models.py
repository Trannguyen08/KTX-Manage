from django.db import models

from apps.core.models import TimestampedModel
from apps.rooms.models import Room


class DormitoryRegistration(TimestampedModel):
    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class EducationType(models.TextChoices):
        UNIVERSITY = "university", "University"
        COLLEGE = "college", "College"
        VOCATIONAL = "vocational", "Vocational"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        AWAITING_PAYMENT = "awaiting_payment", "Awaiting payment"
        PAYMENT_PAID = "payment_paid", "Payment paid"
        PENDING_APPROVAL = "pending_approval", "Pending approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    full_name = models.CharField(max_length=150)
    identity_number = models.CharField(max_length=30)
    date_of_birth = models.DateField(null=True, blank=True)
    portrait = models.FileField(upload_to="registration-portraits/", null=True, blank=True)
    portrait_url = models.URLField(blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    phone = models.CharField(max_length=20)
    student_code = models.CharField(max_length=30)
    faculty = models.CharField(max_length=160, blank=True)
    department = models.CharField(max_length=160, blank=True)
    class_name = models.CharField(max_length=80, blank=True)
    education_type = models.CharField(max_length=20, choices=EducationType.choices, blank=True)
    permanent_address = models.CharField(max_length=255, blank=True)
    email = models.EmailField()
    guardian_name = models.CharField(max_length=150, blank=True)
    guardian_relationship = models.CharField(max_length=80, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    guardian_address = models.CharField(max_length=255, blank=True)
    selected_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name="registrations")
    selected_bed = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AWAITING_PAYMENT)
    note = models.TextField(blank=True)
    approved_user = models.OneToOneField("auth.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="dormitory_registration")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.student_code} - {self.full_name}"


class RegistrationPayment(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"
        FAILED = "FAILED", "Failed"

    registration = models.ForeignKey(DormitoryRegistration, on_delete=models.CASCADE, related_name="payments")
    order_code = models.PositiveBigIntegerField(unique=True)
    amount = models.PositiveIntegerField()
    description = models.CharField(max_length=80)
    payment_link_id = models.CharField(max_length=120, blank=True)
    checkout_url = models.URLField(blank=True)
    qr_code = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    raw_response = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.order_code} - {self.status}"
