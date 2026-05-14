from rest_framework import serializers
from django.utils import timezone
from .models import Invoice, InvoiceItem, UtilityUsage, ServiceSubscription


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    room_code = serializers.CharField(source="room.code", read_only=True)
    building_name = serializers.CharField(source="room.floor.building.name", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Tháng phải nằm trong khoảng 1-12.")
        return value

    def validate_year(self, value):
        if value < 2000:
            raise serializers.ValidationError("Năm không hợp lệ.")
        return value

    def validate_due_date(self, value):
        if self.instance and self.instance.status != Invoice.InvoiceStatus.DRAFT:
            return value
        return value


class UtilityUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityUsage
        fields = "__all__"

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Tháng phải nằm trong khoảng 1-12.")
        return value

    def validate_electricity_reading(self, value):
        if value < 0:
            raise serializers.ValidationError("Chỉ số điện không được âm.")
        return value

    def validate_water_reading(self, value):
        if value < 0:
            raise serializers.ValidationError("Chỉ số nước không được âm.")
        return value


class GenerateInvoiceSerializer(serializers.Serializer):
    room_id = serializers.IntegerField(min_value=1)
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2000)
    electricity_reading = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    water_reading = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    due_date = serializers.DateField()

    def validate_due_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError("Hạn thanh toán không được nhỏ hơn ngày hiện tại.")
        return value


class ServiceSubscriptionSerializer(serializers.ModelSerializer):
    student_code = serializers.CharField(source="student.student_code", read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    service_price = serializers.DecimalField(source="service.price", max_digits=12, decimal_places=0, read_only=True)
    service_unit = serializers.CharField(source="service.unit", read_only=True)

    class Meta:
        model = ServiceSubscription
        fields = "__all__"
        extra_kwargs = {
            "student": {"required": False},
            "start_date": {"required": False},
            "end_date": {"required": False},
            "is_active": {"required": False},
            "status": {"required": False},
        }

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Ngày kết thúc không được nhỏ hơn ngày bắt đầu."})
        return attrs
