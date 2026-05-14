import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("rooms", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DormitoryRegistration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("full_name", models.CharField(max_length=150)),
                ("identity_number", models.CharField(max_length=30)),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("portrait", models.FileField(blank=True, null=True, upload_to="registration-portraits/")),
                ("gender", models.CharField(blank=True, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")], max_length=20)),
                ("phone", models.CharField(max_length=20)),
                ("student_code", models.CharField(max_length=30)),
                ("faculty", models.CharField(blank=True, max_length=160)),
                ("class_name", models.CharField(blank=True, max_length=80)),
                ("education_type", models.CharField(blank=True, choices=[("university", "University"), ("college", "College"), ("vocational", "Vocational")], max_length=20)),
                ("permanent_province", models.CharField(blank=True, max_length=120)),
                ("permanent_district", models.CharField(blank=True, max_length=120)),
                ("permanent_ward", models.CharField(blank=True, max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("guardian_name", models.CharField(blank=True, max_length=150)),
                ("guardian_relationship", models.CharField(blank=True, max_length=80)),
                ("guardian_phone", models.CharField(blank=True, max_length=20)),
                ("guardian_address", models.CharField(blank=True, max_length=255)),
                ("selected_bed", models.CharField(blank=True, max_length=30)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("submitted", "Submitted"), ("approved", "Approved"), ("rejected", "Rejected")], default="submitted", max_length=20)),
                ("note", models.TextField(blank=True)),
                ("selected_room", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="registrations", to="rooms.room")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
