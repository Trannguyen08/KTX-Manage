from apps.buildings.models import Building
from apps.rooms.models import Room

from .models import DormitoryRegistration, RegistrationPayment
from .utils import generate_order_code, send_registration_paid_email, sign_payos_payload

import requests
from django.conf import settings


class RegistrationRoomService:
    @staticmethod
    def available_rooms(building_id=None, floor_id=None, search=None):
        rooms = Room.objects.select_related("floor", "floor__building").exclude(status=Room.RoomStatus.INACTIVE)
        if building_id:
            rooms = rooms.filter(floor__building_id=building_id)
        if floor_id:
            rooms = rooms.filter(floor_id=floor_id)
        if search:
            rooms = rooms.filter(code__icontains=search)
        return rooms.order_by("floor__building__name", "floor__number", "code")

    @staticmethod
    def building_options(building_id=None, floor_id=None, search=None):
        rooms = list(RegistrationRoomService.available_rooms(building_id, floor_id, search))
        building_ids = {room.floor.building_id for room in rooms}
        buildings = Building.objects.filter(id__in=building_ids).order_by("name")
        rooms_by_building = {}
        for room in rooms:
            rooms_by_building.setdefault(room.floor.building_id, []).append(room)
        return buildings, rooms_by_building


class PayOSService:
    @staticmethod
    def create_payment_link(registration, amount):
        order_code = generate_order_code()
        description = f"KTX {registration.id}"
        payload = {
            "orderCode": order_code,
            "amount": amount,
            "description": description,
            "buyerName": registration.full_name,
            "buyerEmail": registration.email,
            "buyerPhone": registration.phone,
            "items": [{"name": "Phi dang ky ky tuc xa", "quantity": 1, "price": amount}],
            "cancelUrl": settings.PAYOS["cancel_url"],
            "returnUrl": settings.PAYOS["return_url"],
        }
        payload["signature"] = sign_payos_payload(payload)

        response = requests.post(
            "https://api-merchant.payos.vn/v2/payment-requests",
            json=payload,
            headers={
                "x-client-id": settings.PAYOS["client_id"],
                "x-api-key": settings.PAYOS["api_key"],
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        response.raise_for_status()
        body = response.json()
        data = body.get("data", {})
        payment = RegistrationPayment.objects.create(
            registration=registration,
            order_code=order_code,
            amount=amount,
            description=description,
            payment_link_id=data.get("paymentLinkId", ""),
            checkout_url=data.get("checkoutUrl", ""),
            qr_code=data.get("qrCode", ""),
            status=data.get("status", RegistrationPayment.Status.PENDING),
            raw_response=body,
        )
        return payment

    @staticmethod
    def mark_paid(order_code, raw_payload=None):
        payment = RegistrationPayment.objects.select_related("registration").get(order_code=order_code)
        payment.status = RegistrationPayment.Status.PAID
        payment.raw_response = raw_payload or payment.raw_response
        payment.save(update_fields=["status", "raw_response", "updated_at"])

        registration = payment.registration
        registration.status = DormitoryRegistration.Status.PENDING_APPROVAL
        registration.save(update_fields=["status", "updated_at"])
        send_registration_paid_email(registration)
        return payment
