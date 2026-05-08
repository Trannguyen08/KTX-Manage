from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.services import apply_search

from .serializers import StudentSerializer
from .services import StudentService


class StudentViewSet(ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        queryset = StudentService.queryset()
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return apply_search(queryset, self.request.query_params.get("search"), ["student_code", "full_name", "email", "phone"])

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(StudentService.summary())
