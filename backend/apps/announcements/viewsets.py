from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Exists, OuterRef, Q
from django.utils import timezone

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .models import Announcement, AnnouncementRead
from .serializers import AnnouncementSerializer
from .services import AnnouncementService


class AnnouncementViewSet(ModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action == "summary":
            return [IsAdminUser()]
        if self.action in {"mark_read", "unread_count"} or self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = AnnouncementService.queryset()
        
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.annotate(
                user_read=Exists(
                    AnnouncementRead.objects.filter(announcement=OuterRef("pk"), user=user)
                )
            )

        if not user.is_staff:
            queryset = queryset.filter(status="published")
            # Filter by target audience or building if student is in a specific building
            student = getattr(user, "student_profile", None)
            if student and student.room:
                queryset = queryset.filter(
                    Q(target_audience="all") | 
                    Q(target_audience="students") | 
                    Q(target_audience="building", building=student.room.floor.building)
                )
            else:
                queryset = queryset.filter(Q(target_audience="all") | Q(target_audience="students"))
        
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        target_audience = self.request.query_params.get("target_audience")
        if target_audience:
            queryset = queryset.filter(target_audience=target_audience)
        is_urgent = self.request.query_params.get("is_urgent")
        if is_urgent in {"true", "false"}:
            queryset = queryset.filter(is_urgent=is_urgent == "true")
        is_edited = self.request.query_params.get("is_edited")
        if is_edited in {"true", "false"}:
            queryset = queryset.filter(is_edited=is_edited == "true")
        return apply_search(queryset, self.request.query_params.get("search"), ["title", "content"])

    def perform_update(self, serializer):
        serializer.save(is_edited=True)

    def destroy(self, request, *args, **kwargs):
        announcement = self.get_object()
        announcement.status = Announcement.AnnouncementStatus.ARCHIVED
        announcement.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(announcement).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(AnnouncementService.summary())

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        count = queryset.filter(user_read=False).count()
        return Response({"unread_count": count})

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        announcement = self.get_object()
        is_read = request.data.get("is_read", True)
        if is_read:
            AnnouncementRead.objects.get_or_create(
                announcement=announcement,
                user=request.user,
                defaults={"read_at": timezone.now()},
            )
        else:
            AnnouncementRead.objects.filter(announcement=announcement, user=request.user).delete()
        return Response(self.get_serializer(announcement).data)
