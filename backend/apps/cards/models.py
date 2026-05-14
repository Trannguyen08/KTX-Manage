from django.db import models
from apps.core.models import TimestampedModel
from apps.students.models import Student


class Card(TimestampedModel):
    class CardType(models.TextChoices):
        DORM = "dorm", "Thẻ KTX"
        PARKING = "parking", "Thẻ gửi xe"

    class CardStatus(models.TextChoices):
        ACTIVE = "active", "Đang hoạt động"
        LOCKED = "locked", "Đã khóa"
        LOST = "lost", "Báo mất"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="cards")
    card_type = models.CharField(max_length=20, choices=CardType.choices)
    card_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=CardStatus.choices, default=CardStatus.ACTIVE)

    def __str__(self) -> str:
        return f"{self.card_type} - {self.card_number} ({self.student.student_code})"


class CardRequest(TimestampedModel):
    class RequestType(models.TextChoices):
        NEW = "new", "Cấp mới"
        REISSUE = "reissue", "Cấp lại (mất/hỏng)"
        EXTEND = "extend", "Gia hạn"

    class RequestStatus(models.TextChoices):
        PENDING = "pending", "Đang chờ"
        APPROVED = "approved", "Đã duyệt"
        REJECTED = "rejected", "Đã từ chối"
        COMPLETED = "completed", "Đã cấp thẻ"

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="card_requests")
    card_type = models.CharField(max_length=20, choices=Card.CardType.choices)
    request_type = models.CharField(max_length=20, choices=RequestType.choices, default=RequestType.REISSUE)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    admin_note = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"{self.request_type} {self.card_type} - {self.student.student_code}"
