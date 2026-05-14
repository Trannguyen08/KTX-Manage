from rest_framework import serializers

from apps.core.validators import validate_adult_birthdate, validate_student_code, validate_vn_phone

from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    room_code = serializers.CharField(source="room.code", read_only=True)
    building_name = serializers.CharField(source="room.floor.building.name", read_only=True)

    class Meta:
        model = Student
        fields = "__all__"

    def validate_phone(self, value):
        return validate_vn_phone(value)

    def validate_date_of_birth(self, value):
        return validate_adult_birthdate(value)

    def validate_student_code(self, value):
        return validate_student_code(value)
