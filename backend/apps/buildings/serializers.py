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
    student_count = serializers.IntegerField(read_only=True)
    male_room_count = serializers.IntegerField(read_only=True)
    female_room_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Floor
        fields = "__all__"

    def validate_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Số tầng phải lớn hơn 0.")
        return value
