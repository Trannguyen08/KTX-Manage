from rest_framework import serializers
from django.utils.text import slugify

from .models import UtilityService


class UtilityServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityService
        fields = "__all__"
        extra_kwargs = {
            "code": {"required": False},
            "billing_cycle": {"required": False},
            "is_required": {"required": False},
        }

    def validate(self, attrs):
        price = attrs.get("price")
        if price is not None and price < 0:
            raise serializers.ValidationError({"price": "Đơn giá không được âm."})
        if not attrs.get("code") and attrs.get("name"):
            base = slugify(attrs["name"]).upper().replace("-", "_") or "SERVICE"
            code = base
            suffix = 1
            queryset = UtilityService.objects.all()
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            while queryset.filter(code=code).exists():
                suffix += 1
                code = f"{base}_{suffix}"
            attrs["code"] = code
        attrs.setdefault("billing_cycle", UtilityService.BillingCycle.MONTHLY)
        attrs.setdefault("is_required", False)
        return attrs
