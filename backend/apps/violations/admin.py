from django.contrib import admin

from .models import Violation


@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    list_display = ("student", "title", "violation_date", "level", "status")
    list_filter = ("level", "status", "violation_date")
    search_fields = ("student__full_name", "student__student_code", "title", "description")
    date_hierarchy = "violation_date"
    readonly_fields = ("created_at", "updated_at")
