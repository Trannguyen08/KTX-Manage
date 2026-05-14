from django.db.models import Count, Q
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .models import Floor
from .serializers import BuildingSerializer, FloorSerializer
from .services import BuildingService


class BuildingViewSet(ModelViewSet):
    serializer_class = BuildingSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = BuildingService.queryset()
        return apply_search(queryset, self.request.query_params.get("search"), ["name", "code", "manager_name"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(BuildingService.summary())


class FloorViewSet(ModelViewSet):
    serializer_class = FloorSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = Floor.objects.select_related("building").annotate(
            room_count=Count("rooms", distinct=True),
            student_count=Count("rooms__students", distinct=True),
            male_room_count=Count("rooms", filter=Q(rooms__gender="M"), distinct=True),
            female_room_count=Count("rooms", filter=Q(rooms__gender="F"), distinct=True)
        )
        building_id = self.request.query_params.get("building")
        if building_id:
            queryset = queryset.filter(building_id=building_id)
        return queryset
