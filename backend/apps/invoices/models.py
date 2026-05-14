from django.db import models
from apps.core.models import TimestampedModel
from apps.rooms.models import Room
from apps.students.models import Student
from apps.services.models import UtilityService


class UtilityUsage(TimestampedModel):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="utility_usages")
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    
    electricity_reading = models.DecimalField(max_digits=12, decimal_places=2, help_text="Chỉ số điện (kWh)")
    water_reading = models.DecimalField(max_digits=12, decimal_places=2, help_text="Chỉ số nước (m3)")

    class Meta:
        unique_together = ("room", "month", "year")
        ordering = ["-year", "-month", "room"]

    def __str__(self) -> str:
        return f"{self.room.code} - {self.month}/{self.year}"


class ServiceSubscription(TimestampedModel):
    class SubscriptionStatus(models.TextChoices):
        PENDING = "pending", "Chờ xác nhận"
        ACTIVE = "active", "Đang sử dụng"
        COMPLETED = "completed", "Đã sử dụng"
        CANCELLED = "cancelled", "Đã hủy"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="service_subscriptions")
    service = models.ForeignKey(UtilityService, on_delete=models.CASCADE, related_name="subscriptions")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.PENDING)

    def __str__(self) -> str:
        return f"{self.student.student_code} - {self.service.name}"


class Invoice(TimestampedModel):
    class InvoiceStatus(models.TextChoices):
        DRAFT = "draft", "Bản nháp"
        PENDING = "pending", "Chờ thanh toán"
        PAID = "paid", "Đã thanh toán"
        CANCELLED = "cancelled", "Đã hủy"

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="invoices")
    month = models.PositiveSmallIntegerField()
    year = models.PositiveIntegerField()
    
    # Costs
    room_cost = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    electricity_reading = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    electricity_usage = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    electricity_cost = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    water_reading = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    water_usage = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    water_cost = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    service_total = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.PENDING)
    
    due_date = models.DateField()
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("room", "month", "year")
        ordering = ["-year", "-month", "-created_at"]

    def __str__(self) -> str:
        return f"HD {self.id} - {self.room.code} - {self.month}/{self.year}"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=12, decimal_places=0)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:
        return f"{self.name} - {self.amount}"
