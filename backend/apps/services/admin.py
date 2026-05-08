from django.contrib import admin

from .models import UtilityService


@admin.register(UtilityService)
class UtilityServiceAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "price", "unit", "is_required", "is_active")
    list_filter = ("is_required", "is_active", "billing_cycle")
    search_fields = ("code", "name")
