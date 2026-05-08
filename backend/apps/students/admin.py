from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("student_code", "full_name", "room", "status")
    list_filter = ("status", "room__floor__building")
    search_fields = ("student_code", "full_name", "email", "phone")
