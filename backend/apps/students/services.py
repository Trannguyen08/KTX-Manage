from datetime import timedelta

from django.utils import timezone

from .models import Student


class StudentService:
    @staticmethod
    def queryset():
        StudentService.sync_expired_students()
        return Student.objects.select_related("room", "room__floor", "room__floor__building")

    @staticmethod
    def summary():
        return {
            "total_students": Student.objects.count(),
            "active_students": Student.objects.filter(status=Student.StudentStatus.ACTIVE).count(),
            "pending_students": Student.objects.filter(status=Student.StudentStatus.PENDING).count(),
            "moved_out_students": Student.objects.filter(status=Student.StudentStatus.MOVED_OUT).count(),
            "expired_students": Student.objects.filter(status=Student.StudentStatus.EXPIRED).count(),
        }

    @staticmethod
    def sync_expired_students():
        today = timezone.localdate()
        Student.objects.filter(
            expiry_date__lt=today,
            status=Student.StudentStatus.ACTIVE,
        ).update(status=Student.StudentStatus.EXPIRED)

    @staticmethod
    def default_expiry_date(registered_at):
        if not registered_at:
            return None
        return registered_at + timedelta(days=365)
