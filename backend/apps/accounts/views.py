from django.contrib.auth import authenticate, login
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response({"detail": "Thong tin dang nhap khong hop le."}, status=status.HTTP_400_BAD_REQUEST)

        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.get_full_name(),
                "role": "admin" if user.is_staff or user.is_superuser else "student",
            }
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return Response({"detail": "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới."}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.check_password(current_password):
            return Response({"detail": "Mật khẩu hiện tại không đúng."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, request.user)
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])
        return Response({"detail": "Đổi mật khẩu thành công."})
