from rest_framework import serializers

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    room_code = serializers.CharField(source="room.code", read_only=True)
    building_name = serializers.CharField(source="room.floor.building.name", read_only=True)

    class Meta:
        model = Student
        fields = "__all__"
