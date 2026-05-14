import hashlib
import hmac
import random
import string
import time

import requests
from django.conf import settings
from django.core.mail import send_mail


def generate_password(length=8):
    alphabet = string.ascii_letters + string.digits
    return "".join(random.SystemRandom().choice(alphabet) for _ in range(length))


def generate_order_code():
    return int(f"{int(time.time())}{random.randint(100, 999)}")


def sign_payos_payload(payload):
    raw = (
        f"amount={payload['amount']}"
        f"&cancelUrl={payload['cancelUrl']}"
        f"&description={payload['description']}"
        f"&orderCode={payload['orderCode']}"
        f"&returnUrl={payload['returnUrl']}"
    )
    return hmac.new(settings.PAYOS["checksum_key"].encode(), raw.encode(), hashlib.sha256).hexdigest()


def send_registration_paid_email(registration):
    send_mail(
        "KTX Manage - Da ghi nhan thanh toan",
        (
            f"Chao {registration.full_name},\n\n"
            "He thong da ghi nhan thanh toan dang ky ky tuc xa cua ban. "
            "Ho so dang o trang thai cho admin duyet.\n\n"
            "KTX Manage"
        ),
        settings.DEFAULT_FROM_EMAIL,
        [registration.email],
        fail_silently=True,
    )


def send_registration_approved_email(registration, password):
    send_mail(
        "KTX Manage - Ho so noi tru da duoc duyet",
        (
            f"Chao {registration.full_name},\n\n"
            "Ho so dang ky ky tuc xa cua ban da duoc duyet.\n"
            f"Tai khoan dang nhap: {registration.email}\n"
            f"Mat khau tam thoi: {password}\n\n"
            "Vui long dang nhap va doi mat khau sau khi vao he thong.\n\n"
            "KTX Manage"
        ),
        settings.DEFAULT_FROM_EMAIL,
        [registration.email],
        fail_silently=True,
    )


def send_registration_rejected_email(registration, reason):
    send_mail(
        "KTX Manage - Ho so noi tru bi tu choi",
        (
            f"Chao {registration.full_name},\n\n"
            "Rat tiec, ho so dang ky ky tuc xa cua ban da bi tu choi.\n"
            f"Ly do: {reason}\n\n"
            "Neu can them thong tin, vui long lien he phong quan ly ky tuc xa.\n\n"
            "KTX Manage"
        ),
        settings.DEFAULT_FROM_EMAIL,
        [registration.email],
        fail_silently=True,
    )


def upload_to_cloudinary(file_obj, folder=None):
    timestamp = int(time.time())
    upload_folder = folder or settings.CLOUDINARY["upload_folder"]
    params_to_sign = f"folder={upload_folder}&timestamp={timestamp}{settings.CLOUDINARY['api_secret']}"
    signature = hashlib.sha1(params_to_sign.encode()).hexdigest()
    response = requests.post(
        f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY['cloud_name']}/auto/upload",
        data={
            "api_key": settings.CLOUDINARY["api_key"],
            "timestamp": timestamp,
            "folder": upload_folder,
            "signature": signature,
        },
        files={"file": file_obj},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["secure_url"]
