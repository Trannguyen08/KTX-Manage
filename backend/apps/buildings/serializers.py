from rest_framework import serializers

from .models import Building, Floor


class BuildingSerializer(serializers.ModelSerializer):
    floor_count = serializers.IntegerField(read_only=True)
    room_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Building
        fields = "__all__"


class FloorSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)
    room_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Floor
        fields = "__all__"
