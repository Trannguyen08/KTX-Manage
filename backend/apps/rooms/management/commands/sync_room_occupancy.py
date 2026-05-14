from django.core.management.base import BaseCommand

from apps.rooms.models import Room
from apps.students.models import Student


class Command(BaseCommand):
    help = "Sync room occupancy and status from active students."

    def handle(self, *args, **options):
        updated = 0
        for room in Room.objects.prefetch_related("students"):
            active_count = room.students.filter(status=Student.StudentStatus.ACTIVE).count()
            status = Room.RoomStatus.FULL if active_count >= room.capacity else Room.RoomStatus.AVAILABLE
            if room.current_occupancy != active_count or room.status != status:
                room.current_occupancy = active_count
                room.status = status
                room.save(update_fields=["current_occupancy", "status", "updated_at"])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Synced {updated} rooms."))
