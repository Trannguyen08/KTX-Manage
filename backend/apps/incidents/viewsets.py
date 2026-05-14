from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .models import Incident
from .serializers import IncidentSerializer
from .services import IncidentService


class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer

    def get_permissions(self):
        if self.action == "summary":
            return [IsAdminUser()]
        if self.action in {"list", "retrieve", "create"} or self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = IncidentService.queryset()
        
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(student__user=user)
            
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
            
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
            
        priority = self.request.query_params.get("priority")
        if priority:
            queryset = queryset.filter(priority=priority)
            
        search = self.request.query_params.get("search")
        return apply_search(queryset, search, ["title", "description", "student__full_name", "room__code"])

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            student = self.request.user.student_profile
            serializer.save(student=student, room=student.room)
        else:
            serializer.save()

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(IncidentService.summary())

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = Incident.IncidentStatus.RESOLVED
        from django.utils import timezone
        incident.resolved_at = timezone.now()
        incident.admin_note = request.data.get("admin_note", incident.admin_note)
        incident.save()
        return Response(self.get_serializer(incident).data)
