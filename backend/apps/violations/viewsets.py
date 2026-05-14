from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .models import Violation
from .serializers import ViolationSerializer
from .services import ViolationService


class ViolationViewSet(viewsets.ModelViewSet):
    serializer_class = ViolationSerializer

    def get_permissions(self):
        if self.action == "summary":
            return [IsAdminUser()]
        if self.action in {"list", "retrieve", "create"} or self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = ViolationService.queryset()
        
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(student__user=user)
            
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student_id=student_id)
            
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
            
        level = self.request.query_params.get("level")
        if level:
            queryset = queryset.filter(level=level)
            
        search = self.request.query_params.get("search")
        return apply_search(queryset, search, ["title", "description", "student__full_name", "student__student_code"])

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            serializer.save(student=self.request.user.student_profile)
        else:
            serializer.save()

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(ViolationService.summary())

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        violation = self.get_object()
        violation.status = Violation.ViolationStatus.RESOLVED
        violation.penalty = request.data.get("penalty", violation.penalty)
        violation.notes = request.data.get("notes", violation.notes)
        violation.save()
        return Response(self.get_serializer(violation).data)
