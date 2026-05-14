from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsAdminUser
from apps.core.services import apply_search

from .serializers import StudentSerializer
from .services import StudentService


class StudentViewSet(ModelViewSet):
    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = StudentService.queryset()
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        room_id = self.request.query_params.get("room")
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        school = self.request.query_params.get("school")
        if school:
            queryset = queryset.filter(school__icontains=school)
        major = self.request.query_params.get("major")
        if major:
            queryset = queryset.filter(major__icontains=major)
        class_name = self.request.query_params.get("class_name")
        if class_name:
            queryset = queryset.filter(class_name__icontains=class_name)
        gender = self.request.query_params.get("gender")
        if gender:
            queryset = queryset.filter(gender=gender)
        return apply_search(queryset, self.request.query_params.get("search"), ["student_code", "full_name", "email", "phone", "school", "major", "class_name"])

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        try:
            student = request.user.student_profile
        except AttributeError:
            return Response({"error": "Người dùng không phải là sinh viên"}, status=400)
            
        if request.method == "PATCH":
            serializer = self.get_serializer(student, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        return Response(self.get_serializer(student).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response(StudentService.summary())
