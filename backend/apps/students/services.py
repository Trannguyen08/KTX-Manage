from .models import Student


class StudentService:
    @staticmethod
    def queryset():
        return Student.objects.select_related("room", "room__floor", "room__floor__building")

    @staticmethod
    def summary():
        return {
            "total_students": Student.objects.count(),
            "active_students": Student.objects.filter(status=Student.StudentStatus.ACTIVE).count(),
            "pending_students": Student.objects.filter(status=Student.StudentStatus.PENDING).count(),
            "moved_out_students": Student.objects.filter(status=Student.StudentStatus.MOVED_OUT).count(),
        }
