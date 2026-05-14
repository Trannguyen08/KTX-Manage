from django.contrib import admin

from .models import Incident


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "priority", "status", "student", "room", "reported_at")
    list_filter = ("status", "category", "priority", "reported_at")
    search_fields = ("title", "description", "student__full_name", "room__name")
    readonly_fields = ("reported_at", "created_at", "updated_at")
    
    def save_model(self, request, obj, form, change):
        if obj.status == Incident.IncidentStatus.RESOLVED and not obj.resolved_at:
            from django.utils import timezone
            obj.resolved_at = timezone.now()
        super().save_model(request, obj, form, change)
