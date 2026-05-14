from rest_framework import serializers
from django.utils import timezone

from apps.students.models import Student

from .models import Violation


class ViolationStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "student_code", "full_name", "room"]
        depth = 1


class ViolationSerializer(serializers.ModelSerializer):
    student_details = ViolationStudentSerializer(source="student", read_only=True)

    class Meta:
        model = Violation
        fields = "__all__"
        extra_kwargs = {
            "student": {"required": False},
            "violation_date": {"required": False},
        }

    def validate(self, attrs):
        attrs.setdefault("violation_date", timezone.localdate())
        if attrs["violation_date"] > timezone.localdate():
            raise serializers.ValidationError({"violation_date": "Ngày vi phạm không được lớn hơn ngày hiện tại."})
        return attrs
