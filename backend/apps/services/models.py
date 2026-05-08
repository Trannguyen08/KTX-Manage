from django.db import models

from apps.core.models import TimestampedModel


class UtilityService(TimestampedModel):
    class BillingCycle(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        USAGE = "usage", "Usage"
        ONE_TIME = "one_time", "One time"

    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=30, unique=True)
    unit = models.CharField(max_length=40, default="Month")
    price = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    billing_cycle = models.CharField(max_length=20, choices=BillingCycle.choices, default=BillingCycle.MONTHLY)
    description = models.CharField(max_length=255, blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
