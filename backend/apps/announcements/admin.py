from django.contrib import admin

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ("title", "target_audience", "status", "is_urgent", "created_at")
    list_filter = ("status", "target_audience", "is_urgent")
    search_fields = ("title", "content")
