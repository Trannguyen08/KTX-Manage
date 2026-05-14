from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .serializers import UtilityServiceSerializer
from .services import UtilityServiceManager


class UtilityServiceViewSet(ModelViewSet):
    serializer_class = UtilityServiceSerializer

    def get_permissions(self):
        if self.action == "summary":
            return [IsAdminUser()]
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = UtilityServiceManager.queryset()
        return apply_search(queryset, self.request.query_params.get("search"), ["name", "code", "description"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(UtilityServiceManager.summary())

    def destroy(self, request, *args, **kwargs):
        service = self.get_object()
        service.is_active = False
        service.save(update_fields=["is_active", "updated_at"])
        return Response(self.get_serializer(service).data)
