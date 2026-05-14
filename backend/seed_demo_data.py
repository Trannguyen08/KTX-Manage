import argparse
import os
from datetime import date, timedelta
from decimal import Decimal

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.announcements.models import Announcement, AnnouncementRead
from apps.buildings.models import Building, Floor
from apps.cards.models import Card, CardRequest
from apps.incidents.models import Incident
from apps.invoices.models import Invoice, InvoiceItem, ServiceSubscription, UtilityUsage
from apps.registrations.models import DormitoryRegistration, RegistrationPayment
from apps.rooms.models import Room
from apps.services.models import UtilityService
from apps.students.models import Student
from apps.violations.models import Violation


DEMO_PREFIX = "DEMO"
DEFAULT_PASSWORD = "123456"
ROOMS_PER_FLOOR = 12
FLOORS_PER_BUILDING = 5
BUILDING_COUNT = 6
STUDENT_COUNT = 360


FIRST_NAMES = [
    "Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Dang", "Bui", "Do",
    "Ho", "Ngo", "Duong", "Ly", "Truong", "Dinh", "Mai", "Cao", "Ta", "Ha",
]
MIDDLE_NAMES = ["Van", "Thi", "Minh", "Quoc", "Anh", "Bao", "Gia", "Ngoc", "Thanh", "Duc"]
LAST_NAMES = [
    "An", "Binh", "Chau", "Dung", "Giang", "Han", "Hieu", "Khanh", "Linh", "Long",
    "Nam", "Nhi", "Phong", "Phuc", "Quan", "Son", "Thao", "Trang", "Tuan", "Vy",
]
SCHOOLS = ["Cong nghe thong tin", "Dien - Dien tu", "Co khi", "Kinh te", "Xay dung", "Ngoai ngu"]
MAJORS = ["Ky thuat phan mem", "He thong thong tin", "Tu dong hoa", "Quan tri kinh doanh", "Xay dung dan dung", "Ngon ngu Anh"]


def demo_code(kind, index):
    return f"{DEMO_PREFIX}-{kind}-{index:04d}"


def full_name(index):
    return f"{FIRST_NAMES[index % len(FIRST_NAMES)]} {MIDDLE_NAMES[index % len(MIDDLE_NAMES)]} {LAST_NAMES[index % len(LAST_NAMES)]}"


def phone(index):
    prefixes = ["090", "091", "093", "096", "097", "098", "032", "035", "037", "038"]
    return f"{prefixes[index % len(prefixes)]}{index:07d}"[-10:]


def identity_number(index):
    return f"079{index:09d}"[:12]


def month_year_offset(months_ago):
    today = timezone.localdate()
    month = today.month - months_ago
    year = today.year
    while month <= 0:
        month += 12
        year -= 1
    return month, year


def reset_demo_data():
    demo_students = Student.objects.filter(student_code__startswith=f"{DEMO_PREFIX}SV")
    demo_users = User.objects.filter(username__startswith=f"{DEMO_PREFIX}SV")
    demo_admins = User.objects.filter(username=f"{DEMO_PREFIX.lower()}_admin")
    demo_registrations = DormitoryRegistration.objects.filter(student_code__startswith=f"{DEMO_PREFIX}RG")
    demo_buildings = Building.objects.filter(code__startswith=f"{DEMO_PREFIX}-B")
    demo_services = UtilityService.objects.filter(code__startswith=f"{DEMO_PREFIX}_")
    demo_announcements = Announcement.objects.filter(title__startswith="[DEMO]")

    RegistrationPayment.objects.filter(registration__in=demo_registrations).delete()
    demo_registrations.delete()
    demo_students.delete()
    demo_users.delete()
    demo_admins.delete()
    demo_announcements.delete()
    demo_services.delete()
    demo_buildings.delete()


def create_admin():
    admin, created = User.objects.get_or_create(
        username=f"{DEMO_PREFIX.lower()}_admin",
        defaults={
            "email": "demo.admin@ktx.local",
            "first_name": "Demo",
            "last_name": "Admin",
            "is_staff": True,
            "is_superuser": True,
        },
    )
    admin.is_staff = True
    admin.is_superuser = True
    admin.email = "demo.admin@ktx.local"
    admin.set_password(DEFAULT_PASSWORD)
    admin.save()
    return admin, created


def create_buildings_floors_rooms():
    buildings = []
    rooms = []
    for building_index in range(1, BUILDING_COUNT + 1):
        gender = Room.Gender.MALE if building_index % 2 else Room.Gender.FEMALE
        building, _ = Building.objects.update_or_create(
            code=f"{DEMO_PREFIX}-B{building_index}",
            defaults={
                "name": f"Demo Tower {building_index}",
                "address": f"Khu ky tuc xa demo, day {building_index}",
                "manager_name": f"Quan ly {building_index}",
                "description": "Du lieu demo duoc tao tu seed_demo_data.py",
                "is_active": True,
            },
        )
        buildings.append(building)

        for floor_number in range(1, FLOORS_PER_BUILDING + 1):
            floor, _ = Floor.objects.update_or_create(
                building=building,
                number=floor_number,
                defaults={"name": f"Tang {floor_number}", "note": "Tang demo"},
            )
            for room_number in range(1, ROOMS_PER_FLOOR + 1):
                capacity = 4 if room_number % 3 else 6
                room_type = "Standard" if capacity == 4 else "Large"
                monthly_price = Decimal("650000") if capacity == 4 else Decimal("550000")
                code = f"{building.code}-{floor_number}{room_number:02d}"
                room, _ = Room.objects.update_or_create(
                    code=code,
                    defaults={
                        "floor": floor,
                        "room_type": room_type,
                        "capacity": capacity,
                        "current_occupancy": 0,
                        "monthly_price": monthly_price,
                        "gender": gender,
                        "status": Room.RoomStatus.AVAILABLE,
                        "note": "Phong demo",
                    },
                )
                rooms.append(room)
    return buildings, rooms


def create_services():
    service_specs = [
        ("INTERNET", "Internet toc do cao", "thang", 70000, UtilityService.BillingCycle.MONTHLY, False),
        ("LAUNDRY", "Giat say", "lan", 25000, UtilityService.BillingCycle.ONE_TIME, False),
        ("PARKING", "Gui xe may", "thang", 80000, UtilityService.BillingCycle.MONTHLY, False),
        ("CLEANING", "Ve sinh phong", "lan", 50000, UtilityService.BillingCycle.ONE_TIME, False),
        ("GYM", "Phong tap the thao", "thang", 120000, UtilityService.BillingCycle.MONTHLY, False),
        ("ELECTRIC", "Dien sinh hoat", "kWh", 3500, UtilityService.BillingCycle.USAGE, True),
        ("WATER", "Nuoc sinh hoat", "m3", 15000, UtilityService.BillingCycle.USAGE, True),
    ]
    services = []
    for code, name, unit, price, cycle, required in service_specs:
        service, _ = UtilityService.objects.update_or_create(
            code=f"{DEMO_PREFIX}_{code}",
            defaults={
                "name": f"[DEMO] {name}",
                "unit": unit,
                "price": Decimal(price),
                "billing_cycle": cycle,
                "description": "Dich vu demo",
                "is_required": required,
                "is_active": True,
            },
        )
        services.append(service)
    return services


def create_students(rooms):
    students = []
    room_slots = {room.id: 0 for room in rooms}
    room_cycle = iter(rooms * ((STUDENT_COUNT // len(rooms)) + 2))

    for index in range(1, STUDENT_COUNT + 1):
        room = next_room_with_capacity(room_cycle, room_slots)
        gender = Student.Gender.MALE if room.gender == Room.Gender.MALE else Student.Gender.FEMALE
        code = f"{DEMO_PREFIX}SV{index:04d}"
        user, _ = User.objects.get_or_create(
            username=code,
            defaults={
                "email": f"{code.lower()}@demo.ktx.local",
                "first_name": full_name(index),
            },
        )
        user.email = f"{code.lower()}@demo.ktx.local"
        user.first_name = full_name(index)
        user.set_password(DEFAULT_PASSWORD)
        user.save()

        registered_at = timezone.localdate() - timedelta(days=20 + (index % 540))
        student, _ = Student.objects.update_or_create(
            student_code=code,
            defaults={
                "user": user,
                "full_name": full_name(index),
                "email": user.email,
                "phone": phone(index),
                "date_of_birth": date(2000 + (index % 6), (index % 12) + 1, (index % 27) + 1),
                "school": SCHOOLS[index % len(SCHOOLS)],
                "major": MAJORS[index % len(MAJORS)],
                "class_name": f"{DEMO_PREFIX}-C{(index % 24) + 1:02d}",
                "gender": gender,
                "room": room,
                "registered_at": registered_at,
                "expiry_date": registered_at + timedelta(days=365),
                "status": Student.StudentStatus.ACTIVE if index % 20 else Student.StudentStatus.SUSPENDED,
            },
        )
        students.append(student)
        room_slots[room.id] += 1

    update_room_occupancy(rooms)
    return students


def next_room_with_capacity(room_cycle, room_slots):
    while True:
        room = next(room_cycle)
        if room_slots[room.id] < room.capacity:
            return room


def update_room_occupancy(rooms):
    for room in rooms:
        active_count = room.students.filter(status=Student.StudentStatus.ACTIVE).count()
        room.current_occupancy = active_count
        room.status = Room.RoomStatus.FULL if active_count >= room.capacity else Room.RoomStatus.AVAILABLE
        room.save(update_fields=["current_occupancy", "status", "updated_at"])


def create_registrations(rooms, admin):
    statuses = [
        DormitoryRegistration.Status.AWAITING_PAYMENT,
        DormitoryRegistration.Status.PAYMENT_PAID,
        DormitoryRegistration.Status.PENDING_APPROVAL,
        DormitoryRegistration.Status.APPROVED,
        DormitoryRegistration.Status.REJECTED,
    ]
    registrations = []
    for index in range(1, 81):
        room = rooms[index % len(rooms)]
        status = statuses[index % len(statuses)]
        reg_code = f"{DEMO_PREFIX}RG{index:04d}"
        registration, _ = DormitoryRegistration.objects.update_or_create(
            student_code=reg_code,
            defaults={
                "full_name": full_name(index + 500),
                "identity_number": identity_number(index + 500),
                "date_of_birth": date(2002, (index % 12) + 1, (index % 27) + 1),
                "portrait_url": "",
                "gender": DormitoryRegistration.Gender.MALE if room.gender == Room.Gender.MALE else DormitoryRegistration.Gender.FEMALE,
                "phone": phone(index + 500),
                "faculty": SCHOOLS[index % len(SCHOOLS)],
                "department": MAJORS[index % len(MAJORS)],
                "class_name": f"{DEMO_PREFIX}-NEW{(index % 10) + 1:02d}",
                "education_type": DormitoryRegistration.EducationType.UNIVERSITY,
                "permanent_address": f"Dia chi demo {index}",
                "email": f"{reg_code.lower()}@demo.ktx.local",
                "guardian_name": full_name(index + 700),
                "guardian_relationship": "Phu huynh",
                "guardian_phone": phone(index + 700),
                "guardian_address": f"Dia chi nguoi than demo {index}",
                "selected_room": room,
                "selected_bed": f"G{(index % room.capacity) + 1}",
                "status": status,
                "note": "Ly do demo" if status == DormitoryRegistration.Status.REJECTED else "",
                "approved_user": admin if status == DormitoryRegistration.Status.APPROVED else None,
            },
        )
        payment_status = RegistrationPayment.Status.PAID if status in [
            DormitoryRegistration.Status.PAYMENT_PAID,
            DormitoryRegistration.Status.PENDING_APPROVAL,
            DormitoryRegistration.Status.APPROVED,
        ] else RegistrationPayment.Status.PENDING
        RegistrationPayment.objects.update_or_create(
            order_code=9000000000 + index,
            defaults={
                "registration": registration,
                "amount": 3000,
                "description": f"Demo phi dang ky {index}",
                "payment_link_id": f"demo-payment-{index}",
                "checkout_url": f"https://pay.demo.local/{index}",
                "qr_code": "DEMO_QR",
                "status": payment_status,
                "raw_response": {"demo": True, "index": index},
            },
        )
        registrations.append(registration)
    return registrations


def create_cards(students):
    for index, student in enumerate(students, start=1):
        Card.objects.update_or_create(
            card_number=f"KTX-{student.student_code}",
            defaults={
                "student": student,
                "card_type": Card.CardType.DORM,
                "expiry_date": student.expiry_date,
                "status": Card.CardStatus.ACTIVE if index % 30 else Card.CardStatus.LOCKED,
            },
        )
        if index % 3 == 0:
            Card.objects.update_or_create(
                card_number=f"GX-{student.student_code}",
                defaults={
                    "student": student,
                    "card_type": Card.CardType.PARKING,
                    "expiry_date": student.expiry_date,
                    "status": Card.CardStatus.ACTIVE,
                },
            )
        if index % 5 == 0:
            CardRequest.objects.update_or_create(
                student=student,
                card_type=Card.CardType.DORM if index % 2 else Card.CardType.PARKING,
                request_type=CardRequest.RequestType.REISSUE if index % 10 else CardRequest.RequestType.EXTEND,
                defaults={
                    "reason": f"Yeu cau demo so {index}",
                    "status": [
                        CardRequest.RequestStatus.PENDING,
                        CardRequest.RequestStatus.COMPLETED,
                        CardRequest.RequestStatus.REJECTED,
                    ][index % 3],
                    "admin_note": "Ghi chu admin demo" if index % 3 else "",
                },
            )


def create_announcements(buildings, students):
    announcements = []
    for index in range(1, 31):
        target = [
            Announcement.TargetAudience.ALL,
            Announcement.TargetAudience.STUDENTS,
            Announcement.TargetAudience.BUILDING,
        ][index % 3]
        building = buildings[index % len(buildings)] if target == Announcement.TargetAudience.BUILDING else None
        status = Announcement.AnnouncementStatus.PUBLISHED if index % 6 else Announcement.AnnouncementStatus.DRAFT
        announcement, _ = Announcement.objects.update_or_create(
            title=f"[DEMO] Thong bao ky tuc xa {index:02d}",
            defaults={
                "content": f"Noi dung thong bao demo so {index}. Sinh vien vui long theo doi va thuc hien.",
                "target_audience": target,
                "building": building,
                "status": status,
                "is_urgent": index % 7 == 0,
                "is_edited": index % 5 == 0,
                "published_at": timezone.now() - timedelta(days=index) if status == Announcement.AnnouncementStatus.PUBLISHED else None,
            },
        )
        announcements.append(announcement)

    for index, announcement in enumerate(announcements, start=1):
        if announcement.status != Announcement.AnnouncementStatus.PUBLISHED:
            continue
        for student in students[index % 9::37]:
            AnnouncementRead.objects.get_or_create(announcement=announcement, user=student.user)


def create_incidents_and_violations(students):
    incident_titles = ["Hong den phong", "Ro ri nuoc", "Mat ket noi internet", "Hu khoa cua", "Quat tran keu lon"]
    for index, student in enumerate(students, start=1):
        if index % 4 == 0:
            status = [
                Incident.IncidentStatus.PENDING,
                Incident.IncidentStatus.IN_PROGRESS,
                Incident.IncidentStatus.RESOLVED,
                Incident.IncidentStatus.CLOSED,
            ][index % 4]
            Incident.objects.update_or_create(
                student=student,
                title=f"[DEMO] {incident_titles[index % len(incident_titles)]} {student.student_code}",
                defaults={
                    "description": f"Khu vuc co su co: {student.room.code if student.room else 'Chua co phong'}\nMo ta su co demo cua {student.student_code}",
                    "category": [
                        Incident.IncidentCategory.ELECTRICITY,
                        Incident.IncidentCategory.WATER,
                        Incident.IncidentCategory.INTERNET,
                        Incident.IncidentCategory.FURNITURE,
                        Incident.IncidentCategory.OTHER,
                    ][index % 5],
                    "priority": [
                        Incident.IncidentPriority.LOW,
                        Incident.IncidentPriority.MEDIUM,
                        Incident.IncidentPriority.HIGH,
                        Incident.IncidentPriority.URGENT,
                    ][index % 4],
                    "status": status,
                    "room": student.room,
                    "resolved_at": timezone.now() - timedelta(days=index % 20) if status == Incident.IncidentStatus.RESOLVED else None,
                    "image": "",
                    "admin_note": "Da xu ly demo" if status == Incident.IncidentStatus.RESOLVED else "",
                },
            )
        if index % 6 == 0:
            Violation.objects.update_or_create(
                student=student,
                title=f"[DEMO] Vi pham noi quy {index}",
                defaults={
                    "description": "Du lieu demo ve vi pham noi quy ky tuc xa.",
                    "violation_date": timezone.localdate() - timedelta(days=index % 90),
                    "level": [
                        Violation.ViolationLevel.LIGHT,
                        Violation.ViolationLevel.MEDIUM,
                        Violation.ViolationLevel.SEVERE,
                        Violation.ViolationLevel.CRITICAL,
                    ][index % 4],
                    "status": [
                        Violation.ViolationStatus.PENDING,
                        Violation.ViolationStatus.RESOLVED,
                        Violation.ViolationStatus.CANCELLED,
                    ][index % 3],
                    "penalty": "Nhac nho" if index % 3 else "Canh cao",
                    "notes": f"Doi tuong lien quan: {student.full_name}",
                },
            )


def create_subscriptions(services, students):
    optional_services = [service for service in services if not service.is_required]
    for index, student in enumerate(students, start=1):
        for service in optional_services:
            if (index + service.id) % 4 != 0:
                continue
            start = timezone.localdate() - timedelta(days=(index % 120) + 5)
            status = [
                ServiceSubscription.SubscriptionStatus.PENDING,
                ServiceSubscription.SubscriptionStatus.ACTIVE,
                ServiceSubscription.SubscriptionStatus.COMPLETED,
                ServiceSubscription.SubscriptionStatus.CANCELLED,
            ][(index + service.id) % 4]
            end = None
            is_active = False
            if status == ServiceSubscription.SubscriptionStatus.ACTIVE:
                is_active = True
            elif status in [ServiceSubscription.SubscriptionStatus.COMPLETED, ServiceSubscription.SubscriptionStatus.CANCELLED]:
                end = start + timedelta(days=(index % 25) + 1)
            ServiceSubscription.objects.update_or_create(
                student=student,
                service=service,
                start_date=start,
                defaults={
                    "end_date": end,
                    "is_active": is_active,
                    "status": status,
                },
            )


def create_usage_and_invoices(rooms, students):
    room_students = {}
    for student in students:
        if student.room_id:
            room_students.setdefault(student.room_id, []).append(student)

    for room_index, room in enumerate(rooms, start=1):
        previous_electricity = Decimal(80 + room_index)
        previous_water = Decimal(12 + (room_index % 8))
        for months_ago in range(5, -1, -1):
            month, year = month_year_offset(months_ago)
            electricity = previous_electricity + Decimal(20 + (room_index % 12) + (5 - months_ago) * 3)
            water = previous_water + Decimal(4 + (room_index % 5) + (5 - months_ago))
            UtilityUsage.objects.update_or_create(
                room=room,
                month=month,
                year=year,
                defaults={"electricity_reading": electricity, "water_reading": water},
            )

            if months_ago <= 3 and room.id in room_students:
                prev_elec = previous_electricity
                prev_water_reading = previous_water
                electricity_usage = electricity - prev_elec
                water_usage = water - prev_water_reading
                electricity_cost = electricity_usage * Decimal("3500")
                water_cost = water_usage * Decimal("15000")
                completed_services = ServiceSubscription.objects.filter(
                    student__in=room_students[room.id],
                    status=ServiceSubscription.SubscriptionStatus.COMPLETED,
                    end_date__year=year,
                    end_date__month=month,
                ).select_related("service", "student")
                service_total = sum((sub.service.price for sub in completed_services), Decimal("0"))
                status = [
                    Invoice.InvoiceStatus.PAID,
                    Invoice.InvoiceStatus.PENDING,
                    Invoice.InvoiceStatus.CANCELLED,
                    Invoice.InvoiceStatus.DRAFT,
                ][(room_index + months_ago) % 4]
                paid_at = timezone.now() - timedelta(days=months_ago * 8) if status == Invoice.InvoiceStatus.PAID else None
                invoice, _ = Invoice.objects.update_or_create(
                    room=room,
                    month=month,
                    year=year,
                    defaults={
                        "room_cost": room.monthly_price,
                        "electricity_reading": electricity,
                        "electricity_usage": electricity_usage,
                        "electricity_cost": electricity_cost,
                        "water_reading": water,
                        "water_usage": water_usage,
                        "water_cost": water_cost,
                        "service_total": service_total,
                        "total_amount": room.monthly_price + electricity_cost + water_cost + service_total,
                        "status": status,
                        "due_date": timezone.localdate() + timedelta(days=10 - months_ago),
                        "paid_at": paid_at,
                    },
                )
                invoice.items.all().delete()
                InvoiceItem.objects.create(invoice=invoice, name="Tien phong", amount=room.monthly_price)
                InvoiceItem.objects.create(invoice=invoice, name=f"Dien ({electricity_usage} kWh)", amount=electricity_cost)
                InvoiceItem.objects.create(invoice=invoice, name=f"Nuoc ({water_usage} m3)", amount=water_cost)
                for sub in completed_services:
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        name=f"Dich vu: {sub.service.name}",
                        amount=sub.service.price,
                        description=f"Sinh vien: {sub.student.student_code}",
                    )

            previous_electricity = electricity
            previous_water = water


@transaction.atomic
def run(reset=False):
    if reset:
        print("Resetting demo data...")
        reset_demo_data()

    print("Creating linked demo data...")
    admin, _ = create_admin()
    buildings, rooms = create_buildings_floors_rooms()
    services = create_services()
    students = create_students(rooms)
    create_registrations(rooms, admin)
    create_cards(students)
    create_announcements(buildings, students)
    create_incidents_and_violations(students)
    create_subscriptions(services, students)
    create_usage_and_invoices(rooms, students)

    print("Done.")
    print(f"Admin: {DEMO_PREFIX.lower()}_admin / {DEFAULT_PASSWORD}")
    print(f"Students: {DEMO_PREFIX}SV0001..{DEMO_PREFIX}SV{STUDENT_COUNT:04d} / {DEFAULT_PASSWORD}")
    print(f"Buildings: {len(buildings)}, Rooms: {len(rooms)}, Students: {len(students)}")


def main():
    parser = argparse.ArgumentParser(description="Seed large linked demo data for KTX-Manage.")
    parser.add_argument("--reset-demo", action="store_true", help="Delete existing DEMO data before seeding.")
    args = parser.parse_args()
    run(reset=args.reset_demo)


if __name__ == "__main__":
    main()
