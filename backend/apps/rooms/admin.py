from django.contrib import admin

from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("code", "floor", "capacity", "current_occupancy", "status")
    list_filter = ("status", "floor__building")
    search_fields = ("code",)
