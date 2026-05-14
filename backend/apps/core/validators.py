import re
from datetime import date

from rest_framework import serializers


VN_PHONE_PATTERN = re.compile(r"^(0|\+84)(3|5|7|8|9)\d{8}$")
VN_IDENTITY_PATTERN = re.compile(r"^(\d{9}|\d{12})$")
STUDENT_CODE_PATTERN = re.compile(r"^[A-Za-z0-9._-]{4,30}$")


def validate_vn_phone(value, field_name="Số điện thoại"):
    if not value:
        return value
    normalized = str(value).strip().replace(" ", "")
    if not VN_PHONE_PATTERN.fullmatch(normalized):
        raise serializers.ValidationError(f"{field_name} không đúng định dạng Việt Nam.")
    return normalized


def validate_vn_identity_number(value):
    if not value:
        return value
    normalized = str(value).strip().replace(" ", "")
    if not VN_IDENTITY_PATTERN.fullmatch(normalized):
        raise serializers.ValidationError("CMND/CCCD phải gồm 9 hoặc 12 chữ số.")
    return normalized


def validate_adult_birthdate(value, min_age=18):
    if not value:
        return value
    today = date.today()
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    if age < min_age:
        raise serializers.ValidationError(f"Ngày sinh phải đủ từ {min_age} tuổi trở lên.")
    if value > today:
        raise serializers.ValidationError("Ngày sinh không được lớn hơn ngày hiện tại.")
    return value


def validate_student_code(value):
    if not value:
        return value
    normalized = str(value).strip()
    if not STUDENT_CODE_PATTERN.fullmatch(normalized):
        raise serializers.ValidationError("MSSV chỉ được chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang, dài 4-30 ký tự.")
    return normalized
