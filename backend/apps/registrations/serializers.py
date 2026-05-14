from rest_framework import serializers
from apps.core.validators import validate_adult_birthdate, validate_student_code, validate_vn_identity_number, validate_vn_phone
from apps.buildings.models import Building
from apps.rooms.models import Room
from .models import DormitoryRegistration, RegistrationPayment


class DormitoryRegistrationSerializer(serializers.ModelSerializer):
    room_code = serializers.CharField(source="selected_room.code", read_only=True)
    building_name = serializers.CharField(source="selected_room.floor.building.name", read_only=True)
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = DormitoryRegistration
        fields = "__all__"
        read_only_fields = ["approved_user", "status"]

    def get_payment_status(self, registration):
        payment = registration.payments.order_by("-created_at").first()
        return payment.status if payment else ""

    def validate_identity_number(self, value):
        return validate_vn_identity_number(value)

    def validate_phone(self, value):
        return validate_vn_phone(value, "Số điện thoại cá nhân")

    def validate_guardian_phone(self, value):
        return validate_vn_phone(value, "Số điện thoại người thân")

    def validate_date_of_birth(self, value):
        return validate_adult_birthdate(value)

    def validate_student_code(self, value):
        return validate_student_code(value)


class RegistrationPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationPayment
        fields = "__all__"


class CreatePaymentSerializer(serializers.Serializer):
    registration = DormitoryRegistrationSerializer()
    amount = serializers.IntegerField(min_value=1000)


class ConfirmPaymentSerializer(serializers.Serializer):
    orderCode = serializers.IntegerField()
    status = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField(required=False, allow_blank=True)
    cancel = serializers.CharField(required=False, allow_blank=True)


class RegistrationRoomOptionSerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "code",
            "room_type",
            "capacity",
            "current_occupancy",
            "monthly_price",
            "status",
            "gender",
            "available_slots",
        ]

    def get_available_slots(self, room):
        return max(room.capacity - room.current_occupancy, 0)


class RegistrationBuildingOptionSerializer(serializers.ModelSerializer):
    floors = serializers.SerializerMethodField()

    class Meta:
        model = Building
        fields = ["id", "name", "code", "floors"]

    def get_floors(self, building):
        rooms = self.context.get("rooms_by_building", {}).get(building.id, [])
        grouped = {}
        for room in rooms:
            floor = room.floor
            grouped.setdefault(floor.id, {"id": floor.id, "name": floor.name, "number": floor.number, "rooms": []})
            grouped[floor.id]["rooms"].append(RegistrationRoomOptionSerializer(room).data)
        return sorted(grouped.values(), key=lambda item: item["number"])
