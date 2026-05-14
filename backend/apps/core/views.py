from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.response import Response

from apps.core.permissions import IsAdminUser
from apps.announcements.models import Announcement
from apps.incidents.models import Incident
from apps.invoices.models import Invoice
from apps.registrations.models import DormitoryRegistration
from apps.rooms.models import Room
from apps.services.models import UtilityService
from apps.students.models import Student
from apps.violations.models import Violation


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response(
        {
            "status": "ok",
            "service": "KTX Manage API",
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminUser])
def dashboard_summary(request):
    rooms = Room.objects.all()
    total_rooms = rooms.count()
    occupied_rooms = rooms.filter(current_occupancy__gt=0).count()
    capacity = sum(room.capacity for room in rooms)
    occupied = sum(room.current_occupancy for room in rooms)
    published_announcements = Announcement.objects.filter(
        status=Announcement.AnnouncementStatus.PUBLISHED
    )

    recent_activities = []
    for registration in DormitoryRegistration.objects.order_by("-created_at")[:3]:
        recent_activities.append(
            {
                "type": "registration",
                "created_at": registration.created_at,
                "text": f"{registration.full_name} ({registration.student_code}) gui don dang ky phong.",
            }
        )
    for incident in Incident.objects.select_related("student", "room").order_by("-created_at")[:3]:
        room_code = incident.room.code if incident.room else "chua co phong"
        recent_activities.append(
            {
                "type": "incident",
                "created_at": incident.created_at,
                "text": f"{incident.student.full_name} bao su co {incident.title} tai phong {room_code}.",
            }
        )
    for violation in Violation.objects.select_related("student").order_by("-created_at")[:3]:
        recent_activities.append(
            {
                "type": "violation",
                "created_at": violation.created_at,
                "text": f"Ghi nhan vi pham {violation.title} cua {violation.student.full_name}.",
            }
        )

    recent_activities = sorted(
        recent_activities,
        key=lambda item: item["created_at"],
        reverse=True,
    )[:6]

    return Response(
        {
            "students": {
                "total": Student.objects.count(),
                "active": Student.objects.filter(status=Student.StudentStatus.ACTIVE).count(),
                "pending": Student.objects.filter(status=Student.StudentStatus.PENDING).count(),
            },
            "rooms": {
                "total": total_rooms,
                "occupied_rooms": occupied_rooms,
                "capacity": capacity,
                "occupied": occupied,
                "occupancy_rate": round((occupied / capacity) * 100, 1) if capacity else 0,
            },
            "announcements": {
                "total": Announcement.objects.count(),
                "published": published_announcements.count(),
                "urgent": published_announcements.filter(is_urgent=True).count(),
            },
            "services": {
                "total": UtilityService.objects.count(),
                "active": UtilityService.objects.filter(is_active=True).count(),
            },
            "registrations": {
                "pending": DormitoryRegistration.objects.filter(
                    status=DormitoryRegistration.Status.PENDING_APPROVAL
                ).count(),
            },
            "incidents": {
                "pending": Incident.objects.filter(status=Incident.IncidentStatus.PENDING).count(),
                "in_progress": Incident.objects.filter(status=Incident.IncidentStatus.IN_PROGRESS).count(),
            },
            "violations": {
                "pending": Violation.objects.filter(status=Violation.ViolationStatus.PENDING).count(),
            },
            "invoices": {
                "pending": Invoice.objects.filter(status=Invoice.InvoiceStatus.PENDING).count(),
            },
            "recent_activities": recent_activities,
        }
    )
