from rest_framework import serializers

from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="floor.building.name", read_only=True)
    floor_name = serializers.CharField(source="floor.name", read_only=True)
    available_slots = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = "__all__"

    def get_available_slots(self, room):
        return max(room.capacity - room.current_occupancy, 0)
