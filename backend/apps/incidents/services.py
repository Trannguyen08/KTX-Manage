from django.db.models import Count

from .models import Incident


class IncidentService:
    @staticmethod
    def queryset():
        return Incident.objects.select_related("student", "room", "room__floor", "room__floor__building")

    @staticmethod
    def summary():
        return {
            "total": Incident.objects.count(),
            "pending": Incident.objects.filter(status=Incident.IncidentStatus.PENDING).count(),
            "in_progress": Incident.objects.filter(status=Incident.IncidentStatus.IN_PROGRESS).count(),
            "resolved": Incident.objects.filter(status=Incident.IncidentStatus.RESOLVED).count(),
            "by_category": dict(
                Incident.objects.values_list("category").annotate(count=Count("id"))
            ),
            "by_priority": dict(
                Incident.objects.values_list("priority").annotate(count=Count("id"))
            ),
        }
