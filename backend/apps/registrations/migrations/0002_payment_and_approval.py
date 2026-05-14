import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
        ("registrations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="dormitoryregistration",
            name="approved_user",
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="dormitory_registration", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="dormitoryregistration",
            name="portrait_url",
            field=models.URLField(blank=True),
        ),
        migrations.AlterField(
            model_name="dormitoryregistration",
            name="status",
            field=models.CharField(choices=[("draft", "Draft"), ("awaiting_payment", "Awaiting payment"), ("payment_paid", "Payment paid"), ("pending_approval", "Pending approval"), ("approved", "Approved"), ("rejected", "Rejected")], default="awaiting_payment", max_length=20),
        ),
        migrations.CreateModel(
            name="RegistrationPayment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("order_code", models.PositiveBigIntegerField(unique=True)),
                ("amount", models.PositiveIntegerField()),
                ("description", models.CharField(max_length=80)),
                ("payment_link_id", models.CharField(blank=True, max_length=120)),
                ("checkout_url", models.URLField(blank=True)),
                ("qr_code", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("PAID", "Paid"), ("CANCELLED", "Cancelled"), ("FAILED", "Failed")], default="PENDING", max_length=20)),
                ("raw_response", models.JSONField(blank=True, default=dict)),
                ("registration", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payments", to="registrations.dormitoryregistration")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
