from rest_framework import serializers

from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="floor.building.name", read_only=True)
    floor_name = serializers.CharField(source="floor.name", read_only=True)
    available_slots = serializers.SerializerMethodField()
    current_occupancy = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = "__all__"

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Sức chứa phải lớn hơn 0.")
        return value

    def validate_monthly_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Giá phòng không được âm.")
        return value

    def validate(self, attrs):
        capacity = attrs.get("capacity", getattr(self.instance, "capacity", None))
        current_occupancy = getattr(self.instance, "current_occupancy", 0)
        if capacity is not None and current_occupancy > capacity:
            raise serializers.ValidationError({"capacity": "Sức chứa không được nhỏ hơn số sinh viên đang ở."})
        return attrs

    def get_available_slots(self, room):
        return max(room.capacity - self.get_current_occupancy(room), 0)

    def get_current_occupancy(self, room):
        if hasattr(room, "active_student_count"):
            return room.active_student_count
        return room.students.filter(status="active").count()
