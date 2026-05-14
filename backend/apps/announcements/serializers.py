from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)
    read_count = serializers.IntegerField(read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = "__all__"

    def get_is_read(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        if hasattr(obj, "user_read"):
            return bool(obj.user_read)
        return obj.reads.filter(user=user).exists()
