from rest_framework import serializers
from django.utils import timezone
from .models import Card, CardRequest


class CardSerializer(serializers.ModelSerializer):
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)

    class Meta:
        model = Card
        fields = "__all__"

    def validate_expiry_date(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("Ngày hết hạn không được nhỏ hơn ngày hiện tại.")
        return value


class CardRequestSerializer(serializers.ModelSerializer):
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_expiry_date = serializers.DateField(source="student.expiry_date", read_only=True)

    class Meta:
        model = CardRequest
        fields = "__all__"
        extra_kwargs = {
            "student": {"required": False},
        }
