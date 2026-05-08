from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.services import apply_search

from .serializers import AnnouncementSerializer
from .services import AnnouncementService


class AnnouncementViewSet(ModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        queryset = AnnouncementService.queryset()
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return apply_search(queryset, self.request.query_params.get("search"), ["title", "content"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(AnnouncementService.summary())
