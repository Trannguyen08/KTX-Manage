import os
import django
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from apps.buildings.models import Building, Floor
from apps.rooms.models import Room
from apps.students.models import Student
from apps.services.models import UtilityService
from apps.cards.models import Card, CardRequest
from apps.incidents.models import Incident
from apps.invoices.models import UtilityUsage, ServiceSubscription, Invoice, InvoiceItem
from apps.announcements.models import Announcement
from apps.violations.models import Violation
from apps.registrations.models import DormitoryRegistration, RegistrationPayment

def run():
    print("Seeding database...")
    
    # 1. Create admin user
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@example.com", "admin")
        print("Created superuser 'admin'")
    else:
        print("Superuser 'admin' already exists")

    # 2. Create Building & Floors
    b1, _ = Building.objects.get_or_create(code="A1", defaults={"name": "Tòa A1 - Nam", "manager_name": "Nguyễn Văn A"})
    b2, _ = Building.objects.get_or_create(code="B1", defaults={"name": "Tòa B1 - Nữ", "manager_name": "Trần Thị B"})

    f1_a1, _ = Floor.objects.get_or_create(building=b1, number=1, defaults={"name": "Tầng 1"})
    f2_a1, _ = Floor.objects.get_or_create(building=b1, number=2, defaults={"name": "Tầng 2"})
    f1_b1, _ = Floor.objects.get_or_create(building=b2, number=1, defaults={"name": "Tầng 1"})

    # 3. Create Rooms
    room_a1_101, _ = Room.objects.get_or_create(code="A1-101", defaults={"floor": f1_a1, "capacity": 4, "gender": Room.Gender.MALE, "monthly_price": 500000})
    room_a1_102, _ = Room.objects.get_or_create(code="A1-102", defaults={"floor": f1_a1, "capacity": 6, "gender": Room.Gender.MALE, "monthly_price": 400000})
    room_b1_101, _ = Room.objects.get_or_create(code="B1-101", defaults={"floor": f1_b1, "capacity": 4, "gender": Room.Gender.FEMALE, "monthly_price": 550000})

    print("Created/Checked Buildings, Floors, and Rooms.")

    # 4. Create Utility Services
    svc_elec, _ = UtilityService.objects.get_or_create(code="ELEC", defaults={"name": "Tiền điện", "unit": "kWh", "price": 3500, "billing_cycle": "usage", "is_required": True})
    svc_water, _ = UtilityService.objects.get_or_create(code="WATER", defaults={"name": "Tiền nước", "unit": "m3", "price": 10000, "billing_cycle": "usage", "is_required": True})
    svc_internet, _ = UtilityService.objects.get_or_create(code="INT", defaults={"name": "Internet", "unit": "Month", "price": 50000, "billing_cycle": "monthly", "is_required": False})
    
    print("Created/Checked Utility Services.")

    # 5. Create Students
    # Student 1
    user_stu1, _ = User.objects.get_or_create(username="SV001", defaults={"email": "sv001@example.com"})
    if not user_stu1.has_usable_password():
        user_stu1.set_password("student123")
        user_stu1.save()

    student1, _ = Student.objects.get_or_create(
        student_code="SV001",
        defaults={
            "user": user_stu1,
            "full_name": "Nguyễn Văn Sinh Viên",
            "email": "sv001@example.com",
            "phone": "0987654321",
            "date_of_birth": date(2002, 1, 1),
            "room": room_a1_101,
            "status": Student.StudentStatus.ACTIVE,
            "registered_at": date.today() - timedelta(days=30)
        }
    )

    # Student 2
    user_stu2, _ = User.objects.get_or_create(username="SV002", defaults={"email": "sv002@example.com"})
    if not user_stu2.has_usable_password():
        user_stu2.set_password("student123")
        user_stu2.save()

    student2, _ = Student.objects.get_or_create(
        student_code="SV002",
        defaults={
            "user": user_stu2,
            "full_name": "Trần Thị Sinh Viên",
            "email": "sv002@example.com",
            "phone": "0912345678",
            "date_of_birth": date(2003, 5, 5),
            "room": room_b1_101,
            "status": Student.StudentStatus.ACTIVE,
            "registered_at": date.today() - timedelta(days=15)
        }
    )
    print("Created/Checked Students.")

    # 6. Cards & Requests
    Card.objects.get_or_create(student=student1, card_number="CARD-001", defaults={"card_type": Card.CardType.DORM, "status": Card.CardStatus.ACTIVE})
    CardRequest.objects.get_or_create(student=student2, request_type=CardRequest.RequestType.NEW, defaults={"card_type": Card.CardType.DORM, "status": CardRequest.RequestStatus.PENDING})
    print("Created/Checked Cards.")

    # 7. Incidents
    Incident.objects.get_or_create(
        student=student1,
        title="Hỏng bóng đèn",
        defaults={
            "description": "Bóng đèn nhà tắm bị cháy",
            "category": Incident.IncidentCategory.ELECTRICITY,
            "priority": Incident.IncidentPriority.MEDIUM,
            "status": Incident.IncidentStatus.PENDING,
            "room": room_a1_101
        }
    )
    print("Created/Checked Incidents.")

    # 8. Invoices & Utility Usage
    current_month = timezone.now().month
    current_year = timezone.now().year
    
    usage, _ = UtilityUsage.objects.get_or_create(
        room=room_a1_101, month=current_month, year=current_year,
        defaults={"electricity_reading": 120, "water_reading": 15}
    )
    
    invoice, _ = Invoice.objects.get_or_create(
        room=room_a1_101, month=current_month, year=current_year,
        defaults={
            "room_cost": 500000,
            "electricity_usage": 120,
            "electricity_cost": 120 * svc_elec.price,
            "water_usage": 15,
            "water_cost": 15 * svc_water.price,
            "service_total": 0,
            "total_amount": 500000 + (120 * svc_elec.price) + (15 * svc_water.price),
            "status": Invoice.InvoiceStatus.PENDING,
            "due_date": date.today() + timedelta(days=5)
        }
    )
    InvoiceItem.objects.get_or_create(invoice=invoice, name="Tiền phòng", defaults={"amount": 500000})
    print("Created/Checked Invoices.")

    # 9. Announcements
    Announcement.objects.get_or_create(
        title="Thông báo đóng tiền phòng tháng này",
        defaults={
            "content": "Yêu cầu các sinh viên đóng tiền đúng hạn.",
            "target_audience": Announcement.TargetAudience.ALL,
            "status": Announcement.AnnouncementStatus.PUBLISHED,
            "published_at": timezone.now()
        }
    )
    print("Created/Checked Announcements.")

    # 10. Violations
    Violation.objects.get_or_create(
        student=student1,
        title="Về muộn sau 23h",
        defaults={
            "description": "Bảo vệ ghi nhận sinh viên về lúc 23h30",
            "violation_date": date.today() - timedelta(days=2),
            "level": Violation.ViolationLevel.LIGHT,
            "status": Violation.ViolationStatus.PENDING,
        }
    )
    print("Created/Checked Violations.")

    # 11. Registrations
    reg, _ = DormitoryRegistration.objects.get_or_create(
        student_code="SV003",
        defaults={
            "full_name": "Lê Văn Đăng Ký",
            "identity_number": "123456789",
            "phone": "0988888888",
            "email": "sv003@example.com",
            "gender": DormitoryRegistration.Gender.MALE,
            "selected_room": room_a1_102,
            "status": DormitoryRegistration.Status.AWAITING_PAYMENT,
        }
    )
    RegistrationPayment.objects.get_or_create(
        registration=reg,
        order_code=100001,
        defaults={
            "amount": 400000,
            "description": "Thanh toan tien phong",
            "status": RegistrationPayment.Status.PENDING
        }
    )
    print("Created/Checked Registrations.")

    print("Seeding completed!")

if __name__ == "__main__":
    run()
