from django.contrib import admin
from .models import UtilityUsage, ServiceSubscription, Invoice, InvoiceItem


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "room", "month", "year", "total_amount", "status", "created_at")
    list_filter = ("status", "month", "year")
    search_fields = ("room__code",)
    inlines = [InvoiceItemInline]


@admin.register(UtilityUsage)
class UtilityUsageAdmin(admin.ModelAdmin):
    list_display = ("room", "month", "year", "electricity_reading", "water_reading")
    list_filter = ("month", "year")


@admin.register(ServiceSubscription)
class ServiceSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("student", "service", "start_date", "is_active")
    list_filter = ("is_active", "service")
    search_fields = ("student__student_code", "student__full_name")
