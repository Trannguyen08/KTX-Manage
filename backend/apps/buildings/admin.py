from django.contrib import admin

from .models import Building, Floor


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "manager_name", "is_active")
    search_fields = ("code", "name", "manager_name")


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ("name", "number", "building")
    list_filter = ("building",)
