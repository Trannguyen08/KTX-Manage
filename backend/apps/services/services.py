from django.db.models import Sum

from .models import UtilityService


class UtilityServiceManager:
    @staticmethod
    def queryset():
        return UtilityService.objects.all()

    @staticmethod
    def summary():
        services = UtilityService.objects.all()
        return {
            "total_services": services.count(),
            "active_services": services.filter(is_active=True).count(),
            "required_services": services.filter(is_required=True).count(),
            "monthly_revenue_estimate": services.filter(is_active=True).aggregate(total=Sum("price"))["total"] or 0,
        }
