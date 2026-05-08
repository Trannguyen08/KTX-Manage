from django.db import models

from apps.core.models import TimestampedModel


class Building(TimestampedModel):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=255, blank=True)
    manager_name = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class Floor(TimestampedModel):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="floors")
    name = models.CharField(max_length=80)
    number = models.PositiveIntegerField()
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["building__name", "number"]
        constraints = [
            models.UniqueConstraint(fields=["building", "number"], name="unique_floor_number_per_building"),
        ]

    def __str__(self) -> str:
        return f"{self.building.code} - {self.name}"
