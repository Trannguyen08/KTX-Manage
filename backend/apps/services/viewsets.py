from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.services import apply_search

from .serializers import UtilityServiceSerializer
from .services import UtilityServiceManager


class UtilityServiceViewSet(ModelViewSet):
    serializer_class = UtilityServiceSerializer

    def get_queryset(self):
        queryset = UtilityServiceManager.queryset()
        return apply_search(queryset, self.request.query_params.get("search"), ["name", "code", "description"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(UtilityServiceManager.summary())
