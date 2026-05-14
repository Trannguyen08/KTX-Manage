from django.db.models import Count, Q

from .models import Violation


class ViolationService:
    @staticmethod
    def queryset():
        return Violation.objects.select_related("student", "student__room")

    @staticmethod
    def summary():
        return {
            "total": Violation.objects.count(),
            "pending": Violation.objects.filter(status=Violation.ViolationStatus.PENDING).count(),
            "resolved": Violation.objects.filter(status=Violation.ViolationStatus.RESOLVED).count(),
            "by_level": dict(
                Violation.objects.values_list("level").annotate(count=Count("id"))
            ),
        }
