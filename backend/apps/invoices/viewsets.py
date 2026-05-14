from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from apps.core.permissions import IsAdminUser
from .models import Invoice, ServiceSubscription
from .serializers import GenerateInvoiceSerializer, InvoiceSerializer, ServiceSubscriptionSerializer
from .services import InvoiceService


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer

    def get_permissions(self):
        if self.action in {"billing_preparation", "generate_invoice", "send"}:
            return [IsAdminUser()]
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Invoice.objects.all().select_related("room", "room__floor", "room__floor__building").prefetch_related("items")
        
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(room__students__user=user).exclude(status=Invoice.InvoiceStatus.DRAFT)
        
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        status = self.request.query_params.get("status")
        room_code = self.request.query_params.get("room_code")

        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if status:
            queryset = queryset.filter(status=status)
        if room_code:
            queryset = queryset.filter(room__code__icontains=room_code)
            
        return queryset

    def perform_update(self, serializer):
        invoice = serializer.save()
        if serializer.validated_data.get("status") == Invoice.InvoiceStatus.PAID:
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=["paid_at", "updated_at"])
        elif serializer.validated_data.get("status") in [Invoice.InvoiceStatus.PENDING, Invoice.InvoiceStatus.CANCELLED]:
            invoice.paid_at = None
            invoice.save(update_fields=["paid_at", "updated_at"])

    @action(detail=False, methods=["get"], url_path="billing-preparation")
    def billing_preparation(self, request):
        data = InvoiceService.get_room_billing_data(
            month=request.query_params.get("month"),
            year=request.query_params.get("year"),
        )
        return Response(data)

    @action(detail=False, methods=["post"], url_path="generate")
    def generate_invoice(self, request):
        serializer = GenerateInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            invoice = InvoiceService.create_invoice(
                data["room_id"],
                data["month"],
                data["year"],
                data["electricity_reading"],
                data["water_reading"],
                data["due_date"],
            )
            return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        invoice = self.get_object()
        try:
            invoice = InvoiceService.send_invoice(invoice)
            return Response(InvoiceSerializer(invoice).data)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class ServiceSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSubscriptionSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve", "create", "cancel"}:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = ServiceSubscription.objects.select_related("student", "service").order_by("-created_at")
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(student__user=user)

        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff:
            serializer.save()
            return

        student = user.student_profile
        service = serializer.validated_data["service"]
        is_per_use_service = (
            service.billing_cycle in ["one_time", "usage"]
            or "lan" in service.unit.lower()
            or "lần" in service.unit.lower()
        )
        existing = None if is_per_use_service else ServiceSubscription.objects.filter(
            student=student,
            service=service,
            status__in=[
                ServiceSubscription.SubscriptionStatus.PENDING,
                ServiceSubscription.SubscriptionStatus.ACTIVE,
            ],
        ).first()
        if existing:
            raise ValueError("Bạn đã đăng ký dịch vụ này và đang chờ xác nhận hoặc đang sử dụng.")

        serializer.save(
            student=student,
            start_date=timezone.localdate(),
            status=ServiceSubscription.SubscriptionStatus.PENDING,
            is_active=False,
        )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        subscription = self.get_object()
        subscription.status = ServiceSubscription.SubscriptionStatus.ACTIVE
        subscription.is_active = True
        subscription.end_date = None
        subscription.start_date = subscription.start_date or timezone.localdate()
        subscription.save(update_fields=["status", "is_active", "end_date", "start_date", "updated_at"])
        return Response(self.get_serializer(subscription).data)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        subscription = self.get_object()
        subscription.status = ServiceSubscription.SubscriptionStatus.COMPLETED
        subscription.is_active = False
        subscription.end_date = timezone.localdate()
        subscription.save(update_fields=["status", "is_active", "end_date", "updated_at"])
        return Response(self.get_serializer(subscription).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        if subscription.status == ServiceSubscription.SubscriptionStatus.COMPLETED:
            return Response({"detail": "Dịch vụ đã sử dụng không thể hủy."}, status=status.HTTP_400_BAD_REQUEST)
        if subscription.status not in [
            ServiceSubscription.SubscriptionStatus.PENDING,
            ServiceSubscription.SubscriptionStatus.ACTIVE,
        ]:
            return Response({"detail": "Dịch vụ không ở trạng thái có thể hủy."}, status=status.HTTP_400_BAD_REQUEST)

        subscription.status = ServiceSubscription.SubscriptionStatus.CANCELLED
        subscription.is_active = False
        subscription.end_date = timezone.localdate()
        subscription.save(update_fields=["status", "is_active", "end_date", "updated_at"])
        return Response(self.get_serializer(subscription).data)
