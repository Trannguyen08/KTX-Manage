from django.contrib import admin

from .models import DormitoryRegistration


@admin.register(DormitoryRegistration)
class DormitoryRegistrationAdmin(admin.ModelAdmin):
    list_display = ("student_code", "full_name", "faculty", "department", "selected_room", "selected_bed", "status", "created_at")
    list_filter = ("status", "gender", "faculty", "education_type", "selected_room__floor__building")
    search_fields = ("student_code", "full_name", "identity_number", "phone", "email", "permanent_address")
