from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import ChangePasswordView, LoginView
from apps.announcements.viewsets import AnnouncementViewSet
from apps.buildings.viewsets import BuildingViewSet, FloorViewSet
from apps.registrations.viewsets import DormitoryRegistrationViewSet
from apps.rooms.viewsets import RoomViewSet
from apps.services.viewsets import UtilityServiceViewSet
from apps.students.viewsets import StudentViewSet
from apps.violations.viewsets import ViolationViewSet
from apps.incidents.viewsets import IncidentViewSet
from apps.invoices.viewsets import InvoiceViewSet, ServiceSubscriptionViewSet
from apps.cards.viewsets import CardViewSet, CardRequestViewSet

from .views import dashboard_summary, health_check

router = DefaultRouter()
router.register("buildings", BuildingViewSet, basename="building")
router.register("floors", FloorViewSet, basename="floor")
router.register("rooms", RoomViewSet, basename="room")
router.register("students", StudentViewSet, basename="student")
router.register("announcements", AnnouncementViewSet, basename="announcement")
router.register("services", UtilityServiceViewSet, basename="service")
router.register("registrations", DormitoryRegistrationViewSet, basename="registration")
router.register("violations", ViolationViewSet, basename="violation")
router.register("incidents", IncidentViewSet, basename="incident")
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("subscriptions", ServiceSubscriptionViewSet, basename="subscription")
router.register("cards", CardViewSet, basename="card")
router.register("card-requests", CardRequestViewSet, basename="card-request")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("health/", health_check, name="health-check"),
    path("dashboard/summary/", dashboard_summary, name="dashboard-summary"),
    path("", include(router.urls)),
]
