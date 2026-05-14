from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.core.permissions import IsAdminUser
from .models import Card, CardRequest
from .serializers import CardSerializer, CardRequestSerializer


class CardViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Card.objects.select_related("student").all()
        return Card.objects.select_related("student").filter(student__user=user)


class CardRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CardRequestSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve", "create"} or self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CardRequest.objects.select_related("student").all()
        return CardRequest.objects.select_related("student").filter(student__user=user)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            serializer.save(student=self.request.user.student_profile)
        else:
            serializer.save()

    @action(detail=True, methods=["post"], url_path="issue")
    def issue(self, request, pk=None):
        card_request = self.get_object()
        if not request.user.is_staff:
            return Response({"error": "Bạn không có quyền cấp thẻ"}, status=status.HTTP_403_FORBIDDEN)
        if card_request.status == CardRequest.RequestStatus.REJECTED:
            return Response({"error": "Không thể cấp thẻ cho yêu cầu đã từ chối"}, status=status.HTTP_400_BAD_REQUEST)

        if card_request.status == CardRequest.RequestStatus.COMPLETED:
            return Response({"error": "Yeu cau nay da duoc cap the"}, status=status.HTTP_400_BAD_REQUEST)

        card_number = request.data.get("card_number") or self._generate_card_number(card_request)
        expiry_date = card_request.student.expiry_date
        if not expiry_date:
            return Response({"error": "Sinh vien chua co ngay het han KTX"}, status=status.HTTP_400_BAD_REQUEST)

        if Card.objects.filter(card_number=card_number).exists():
            return Response({"error": "Mã thẻ đã tồn tại"}, status=status.HTTP_400_BAD_REQUEST)

        if card_request.request_type == CardRequest.RequestType.REISSUE:
            Card.objects.filter(
                student=card_request.student,
                card_type=card_request.card_type,
                status=Card.CardStatus.ACTIVE,
            ).update(status=Card.CardStatus.LOCKED)

        card = Card.objects.create(
            student=card_request.student,
            card_type=card_request.card_type,
            card_number=card_number,
            expiry_date=expiry_date,
            status=Card.CardStatus.ACTIVE,
        )
        card_request.status = CardRequest.RequestStatus.COMPLETED
        card_request.admin_note = request.data.get("admin_note", card_request.admin_note)
        card_request.save()

        return Response(
            {
                "request": self.get_serializer(card_request).data,
                "card": CardSerializer(card).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def _generate_card_number(self, card_request):
        prefix = "KTX" if card_request.card_type == Card.CardType.DORM else "GX"
        base = f"{prefix}-{card_request.student.student_code}"
        candidate = base
        index = 1
        while Card.objects.filter(card_number=candidate).exists():
            index += 1
            candidate = f"{base}-{index}"
        return candidate
