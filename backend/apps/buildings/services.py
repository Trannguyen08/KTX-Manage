from django.db.models import Count

from apps.rooms.models import Room

from .models import Building


class BuildingService:
    @staticmethod
    def queryset():
        return Building.objects.annotate(
            floor_count=Count("floors", distinct=True),
            room_count=Count("floors__rooms", distinct=True),
        )

    @staticmethod
    def summary():
        return {
            "total_buildings": Building.objects.count(),
            "active_buildings": Building.objects.filter(is_active=True).count(),
            "total_rooms": Room.objects.count(),
        }
