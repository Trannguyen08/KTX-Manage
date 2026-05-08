from rest_framework import serializers

from .models import UtilityService


class UtilityServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityService
        fields = "__all__"
