from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import LoginView
from apps.announcements.viewsets import AnnouncementViewSet
from apps.buildings.viewsets import BuildingViewSet, FloorViewSet
from apps.rooms.viewsets import RoomViewSet
from apps.services.viewsets import UtilityServiceViewSet
from apps.students.viewsets import StudentViewSet

from .views import health_check

router = DefaultRouter()
router.register("buildings", BuildingViewSet, basename="building")
router.register("floors", FloorViewSet, basename="floor")
router.register("rooms", RoomViewSet, basename="room")
router.register("students", StudentViewSet, basename="student")
router.register("announcements", AnnouncementViewSet, basename="announcement")
router.register("services", UtilityServiceViewSet, basename="service")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("health/", health_check, name="health-check"),
    path("", include(router.urls)),
]
