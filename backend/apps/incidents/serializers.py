from rest_framework import serializers

from apps.rooms.models import Room
from apps.students.models import Student

from .models import Incident


class IncidentStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "student_code", "full_name"]


class IncidentRoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="floor.building.name", read_only=True)

    class Meta:
        model = Room
        fields = ["id", "code", "building_name"]


class IncidentSerializer(serializers.ModelSerializer):
    student_details = IncidentStudentSerializer(source="student", read_only=True)
    room_details = IncidentRoomSerializer(source="room", read_only=True)

    class Meta:
        model = Incident
        fields = "__all__"
        extra_kwargs = {
            "student": {"required": False},
            "room": {"required": False},
        }
