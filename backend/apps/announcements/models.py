from django.db import models

from apps.buildings.models import Building
from apps.core.models import TimestampedModel


class Announcement(TimestampedModel):
    class TargetAudience(models.TextChoices):
        ALL = "all", "All"
        STUDENTS = "students", "Students"
        STAFF = "staff", "Staff"
        BUILDING = "building", "Building"

    class AnnouncementStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=180)
    content = models.TextField()
    target_audience = models.CharField(max_length=20, choices=TargetAudience.choices, default=TargetAudience.ALL)
    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True, blank=True, related_name="announcements")
    status = models.CharField(max_length=20, choices=AnnouncementStatus.choices, default=AnnouncementStatus.DRAFT)
    is_urgent = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title
