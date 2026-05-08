from django.db.models import Sum

from .models import Room


class RoomService:
    @staticmethod
    def queryset():
        return Room.objects.select_related("floor", "floor__building")

    @staticmethod
    def summary():
        rooms = Room.objects.all()
        return {
            "total_rooms": rooms.count(),
            "available_rooms": rooms.exclude(status=Room.RoomStatus.FULL).count(),
            "capacity": rooms.aggregate(total=Sum("capacity"))["total"] or 0,
            "occupied": rooms.aggregate(total=Sum("current_occupancy"))["total"] or 0,
        }
