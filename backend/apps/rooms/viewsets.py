from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.services import apply_search

from .serializers import RoomSerializer
from .services import RoomService


class RoomViewSet(ModelViewSet):
    serializer_class = RoomSerializer

    def get_queryset(self):
        queryset = RoomService.queryset()
        return apply_search(queryset, self.request.query_params.get("search"), ["code", "room_type", "floor__building__name"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(RoomService.summary())
