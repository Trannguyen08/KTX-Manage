from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsAdminUser
from .models import DormitoryRegistration
from .serializers import ConfirmPaymentSerializer, CreatePaymentSerializer, DormitoryRegistrationSerializer, RegistrationBuildingOptionSerializer, RegistrationPaymentSerializer
from .services import PayOSService, RegistrationRoomService
from .utils import generate_password, send_registration_approved_email, send_registration_rejected_email, upload_to_cloudinary
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.rooms.models import Room
from apps.students.models import Student
from apps.students.services import StudentService
from apps.cards.models import Card


class DormitoryRegistrationViewSet(ModelViewSet):
    serializer_class = DormitoryRegistrationSerializer
    queryset = DormitoryRegistration.objects.select_related("selected_room", "selected_room__floor", "selected_room__floor__building")

    PUBLIC_ACTIONS = {"room_options", "create_payment", "upload_portrait", "confirm_payment", "payos_webhook"}

    def get_permissions(self):
        if self.action in self.PUBLIC_ACTIONS:
            return [AllowAny()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        registration = serializer.save(status=DormitoryRegistration.Status.AWAITING_PAYMENT)
        portrait = self.request.FILES.get("portrait")
        if portrait:
            try:
                registration.portrait_url = upload_to_cloudinary(portrait)
                registration.save(update_fields=["portrait_url", "updated_at"])
            except Exception:
                pass

    @action(detail=False, methods=["get"], url_path="room-options")
    def room_options(self, request):
        buildings, rooms_by_building = RegistrationRoomService.building_options(
            building_id=request.query_params.get("building"),
            floor_id=request.query_params.get("floor"),
            search=request.query_params.get("search"),
        )
        serializer = RegistrationBuildingOptionSerializer(buildings, many=True, context={"rooms_by_building": rooms_by_building})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="create-payment")
    def create_payment(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration = DormitoryRegistration.objects.create(
            **serializer.validated_data["registration"],
            status=DormitoryRegistration.Status.AWAITING_PAYMENT,
        )
        payment = PayOSService.create_payment_link(registration, serializer.validated_data["amount"])
        return Response(
            {
                "registration": DormitoryRegistrationSerializer(registration).data,
                "payment": RegistrationPaymentSerializer(payment).data,
                "checkout_url": payment.checkout_url,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="upload-portrait")
    def upload_portrait(self, request):
        portrait = request.FILES.get("portrait")
        if not portrait:
            return Response({"detail": "Vui long chon anh."}, status=status.HTTP_400_BAD_REQUEST)
        url = upload_to_cloudinary(portrait)
        return Response({"portrait_url": url})

    @action(detail=False, methods=["post", "get"], url_path="confirm-payment")
    def confirm_payment(self, request):
        data = request.data if request.method == "POST" else request.query_params
        serializer = ConfirmPaymentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        payment = PayOSService.mark_paid(serializer.validated_data["orderCode"], dict(data))
        return Response(
            {
                "registration": DormitoryRegistrationSerializer(payment.registration).data,
                "payment": RegistrationPaymentSerializer(payment).data,
            }
        )

    @action(detail=False, methods=["post"], url_path="payos-webhook")
    def payos_webhook(self, request):
        payload = request.data
        data = payload.get("data", payload)
        if data.get("status") == "PAID" and data.get("orderCode"):
            PayOSService.mark_paid(data["orderCode"], payload)
        return Response({"success": True})

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        registration = self.get_object()
        if registration.status != DormitoryRegistration.Status.PENDING_APPROVAL:
            return Response({"detail": "Ho so chua san sang de duyet."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            password = generate_password()
            username = registration.email or registration.student_code
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": registration.email,
                    "first_name": registration.full_name,
                },
            )
            user.email = registration.email
            user.first_name = registration.full_name
            user.set_password(password)
            user.save()

            student, _ = Student.objects.update_or_create(
                student_code=registration.student_code,
                defaults={
                    "user": user,
                    "full_name": registration.full_name,
                    "email": registration.email,
                    "phone": registration.phone,
                    "date_of_birth": registration.date_of_birth,
                    "school": registration.faculty,
                    "major": registration.department,
                    "class_name": registration.class_name,
                    "gender": registration.gender,
                    "room": registration.selected_room,
                    "registered_at": timezone.localdate(),
                    "expiry_date": StudentService.default_expiry_date(timezone.localdate()),
                    "status": Student.StudentStatus.ACTIVE,
                },
            )

            if registration.selected_room:
                active_count = registration.selected_room.students.filter(status=Student.StudentStatus.ACTIVE).count()
                registration.selected_room.current_occupancy = active_count
                registration.selected_room.status = (
                    Room.RoomStatus.FULL
                    if active_count >= registration.selected_room.capacity
                    else Room.RoomStatus.AVAILABLE
                )
                registration.selected_room.save(update_fields=["current_occupancy", "status", "updated_at"])

            card_number = self._generate_dorm_card_number(student)
            Card.objects.get_or_create(
                student=student,
                card_type=Card.CardType.DORM,
                status=Card.CardStatus.ACTIVE,
                defaults={
                    "card_number": card_number,
                    "expiry_date": student.expiry_date,
                },
            )

            registration.approved_user = user
            registration.status = DormitoryRegistration.Status.APPROVED
            registration.save(update_fields=["approved_user", "status", "updated_at"])

        send_registration_approved_email(registration, password)
        return Response(DormitoryRegistrationSerializer(registration).data)

    def _generate_dorm_card_number(self, student):
        base = f"KTX-{student.student_code}"
        candidate = base
        index = 1
        while Card.objects.filter(card_number=candidate).exists():
            index += 1
            candidate = f"{base}-{index}"
        return candidate

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        registration = self.get_object()
        if registration.status not in (
            DormitoryRegistration.Status.PENDING_APPROVAL,
            DormitoryRegistration.Status.AWAITING_PAYMENT,
        ):
            return Response({"detail": "Ho so khong o trang thai co the tu choi."}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get("reason", "")
        registration.status = DormitoryRegistration.Status.REJECTED
        registration.note = reason
        registration.save(update_fields=["status", "note", "updated_at"])
        send_registration_rejected_email(registration, reason)
        return Response(DormitoryRegistrationSerializer(registration).data)
