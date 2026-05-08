from django.db import models

from apps.buildings.models import Floor
from apps.core.models import TimestampedModel


class Room(TimestampedModel):
    class RoomStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        FULL = "full", "Full"
        MAINTENANCE = "maintenance", "Maintenance"
        INACTIVE = "inactive", "Inactive"

    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name="rooms")
    code = models.CharField(max_length=40, unique=True)
    room_type = models.CharField(max_length=80, default="Standard")
    capacity = models.PositiveIntegerField(default=4)
    current_occupancy = models.PositiveIntegerField(default=0)
    monthly_price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    status = models.CharField(max_length=20, choices=RoomStatus.choices, default=RoomStatus.AVAILABLE)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["floor__building__name", "floor__number", "code"]

    def __str__(self) -> str:
        return self.code
