import calendar
from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import Prefetch
from apps.rooms.models import Room
from .models import UtilityUsage, ServiceSubscription, Invoice, InvoiceItem


class InvoiceService:
    @staticmethod
    def get_room_billing_data(room_id=None, month=None, year=None):
        """
        Returns data for rooms to prepare for invoice creation.
        Includes last committed utility readings and completed subscriptions
        in the selected billing period.
        """
        month = int(month) if month else None
        year = int(year) if year else None
        rooms = Room.objects.select_related("floor", "floor__building").prefetch_related(
            "students",
            Prefetch("utility_usages", queryset=UtilityUsage.objects.order_by("-year", "-month"), to_attr="last_usage")
        )
        
        if room_id:
            rooms = rooms.filter(id=room_id)

        data = []
        for room in rooms:
            last_usage = room.last_usage[0] if room.last_usage else None
            
            students = room.students.all()
            student_ids = [s.id for s in students]
            subscriptions = InvoiceService._completed_subscriptions_for_period(student_ids, month, year)
            
            services_data = []
            for sub in subscriptions:
                services_data.append({
                    "service_id": sub.service.id,
                    "service_name": sub.service.name,
                    "student_code": sub.student.student_code,
                    "student_name": sub.student.full_name,
                    "price": sub.service.price
                })

            data.append({
                "room_id": room.id,
                "room_code": room.code,
                "building": room.floor.building.name,
                "monthly_price": room.monthly_price,
                "last_electricity": last_usage.electricity_reading if last_usage else 0,
                "last_water": last_usage.water_reading if last_usage else 0,
                "last_month": last_usage.month if last_usage else None,
                "last_year": last_usage.year if last_usage else None,
                "students": [
                    {
                        "id": student.id,
                        "student_code": student.student_code,
                        "student_name": student.full_name,
                    }
                    for student in students
                ],
                "active_services": services_data
            })
            
        return data

    @staticmethod
    @transaction.atomic
    def create_invoice(room_id, month, year, electricity_reading, water_reading, due_date):
        room = Room.objects.get(id=room_id)
        month = int(month)
        year = int(year)
        electricity_reading = Decimal(str(electricity_reading))
        water_reading = Decimal(str(water_reading))
        
        # Get previous reading
        prev_usage = UtilityUsage.objects.filter(room=room).exclude(month=month, year=year).order_by("-year", "-month").first()
        prev_elec = prev_usage.electricity_reading if prev_usage else 0
        prev_water = prev_usage.water_reading if prev_usage else 0

        if electricity_reading < prev_elec:
            raise ValueError("Chỉ số điện mới không được nhỏ hơn chỉ số cũ")
        if water_reading < prev_water:
            raise ValueError("Chỉ số nước mới không được nhỏ hơn chỉ số cũ")
        
        elec_usage = electricity_reading - prev_elec
        water_usage = water_reading - prev_water
        
        # Prices (Hardcoded for now or fetched from a config)
        ELEC_PRICE = Decimal("3500") # per kWh
        WATER_PRICE = Decimal("15000") # per m3
        
        elec_cost = elec_usage * ELEC_PRICE
        water_cost = water_usage * WATER_PRICE
        
        # Room cost
        room_cost = room.monthly_price
        
        students = room.students.all()
        student_ids = list(students.values_list("id", flat=True))
        subscriptions = InvoiceService._completed_subscriptions_for_period(student_ids, month, year)
        
        service_total = sum(sub.service.price for sub in subscriptions)
        
        total_amount = room_cost + elec_cost + water_cost + service_total
        
        invoice = Invoice.objects.filter(room=room, month=month, year=year).first()
        if invoice and invoice.status not in [Invoice.InvoiceStatus.DRAFT, Invoice.InvoiceStatus.CANCELLED]:
            raise ValueError("Hóa đơn kỳ này đã được gửi, không thể tạo lại bản nháp.")

        if invoice:
            invoice.room_cost = room_cost
            invoice.electricity_reading = electricity_reading
            invoice.electricity_usage = elec_usage
            invoice.electricity_cost = elec_cost
            invoice.water_reading = water_reading
            invoice.water_usage = water_usage
            invoice.water_cost = water_cost
            invoice.service_total = service_total
            invoice.total_amount = total_amount
            invoice.due_date = due_date
            invoice.status = Invoice.InvoiceStatus.DRAFT
            invoice.save()
        else:
            invoice = Invoice.objects.create(
                room=room,
                month=month,
                year=year,
                room_cost=room_cost,
                electricity_reading=electricity_reading,
                electricity_usage=elec_usage,
                electricity_cost=elec_cost,
                water_reading=water_reading,
                water_usage=water_usage,
                water_cost=water_cost,
                service_total=service_total,
                total_amount=total_amount,
                due_date=due_date,
                status=Invoice.InvoiceStatus.DRAFT,
            )
        invoice.items.all().delete()
        
        # Create Invoice Items
        InvoiceItem.objects.create(invoice=invoice, name="Tiền phòng", amount=room_cost)
        InvoiceItem.objects.create(invoice=invoice, name=f"Điện ({elec_usage} kWh)", amount=elec_cost)
        InvoiceItem.objects.create(invoice=invoice, name=f"Nước ({water_usage} m3)", amount=water_cost)
        
        for sub in subscriptions:
            InvoiceItem.objects.create(
                invoice=invoice, 
                name=f"Dịch vụ: {sub.service.name}", 
                amount=sub.service.price,
                description=f"Sinh viên: {sub.student.student_code}"
            )
            
        return invoice

    @staticmethod
    @transaction.atomic
    def send_invoice(invoice):
        if invoice.status != Invoice.InvoiceStatus.DRAFT:
            raise ValueError("Chỉ hóa đơn nháp mới có thể gửi.")

        UtilityUsage.objects.update_or_create(
            room=invoice.room,
            month=invoice.month,
            year=invoice.year,
            defaults={
                "electricity_reading": invoice.electricity_reading,
                "water_reading": invoice.water_reading,
            },
        )
        invoice.status = Invoice.InvoiceStatus.PENDING
        invoice.save(update_fields=["status", "updated_at"])
        return invoice

    @staticmethod
    def _completed_subscriptions_for_period(student_ids, month, year):
        queryset = ServiceSubscription.objects.filter(
            student_id__in=student_ids,
            status=ServiceSubscription.SubscriptionStatus.COMPLETED,
        ).select_related("service", "student")
        if month and year:
            last_day = calendar.monthrange(year, month)[1]
            start = date(year, month, 1)
            end = date(year, month, last_day)
            queryset = queryset.filter(end_date__gte=start, end_date__lte=end)
        return queryset
