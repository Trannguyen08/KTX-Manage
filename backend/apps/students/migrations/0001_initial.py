import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("rooms", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Student",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student_code", models.CharField(max_length=30, unique=True)),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("date_of_birth", models.DateField(blank=True, null=True)),
                ("school", models.CharField(blank=True, max_length=160)),
                ("major", models.CharField(blank=True, max_length=160)),
                ("registered_at", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("active", "Active"), ("pending", "Pending"), ("moved_out", "Moved out"), ("suspended", "Suspended")], default="pending", max_length=20)),
                ("room", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="students", to="rooms.room")),
            ],
            options={"ordering": ["student_code"]},
        ),
    ]
