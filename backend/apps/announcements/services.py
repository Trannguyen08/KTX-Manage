from .models import Announcement


class AnnouncementService:
    @staticmethod
    def queryset():
        return Announcement.objects.select_related("building")

    @staticmethod
    def summary():
        return {
            "total_announcements": Announcement.objects.count(),
            "published": Announcement.objects.filter(status=Announcement.AnnouncementStatus.PUBLISHED).count(),
            "urgent": Announcement.objects.filter(is_urgent=True).count(),
            "drafts": Announcement.objects.filter(status=Announcement.AnnouncementStatus.DRAFT).count(),
        }
