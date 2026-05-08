import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("buildings", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Room",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("code", models.CharField(max_length=40, unique=True)),
                ("room_type", models.CharField(default="Standard", max_length=80)),
                ("capacity", models.PositiveIntegerField(default=4)),
                ("current_occupancy", models.PositiveIntegerField(default=0)),
                ("monthly_price", models.DecimalField(decimal_places=0, default=0, max_digits=12)),
                ("status", models.CharField(choices=[("available", "Available"), ("full", "Full"), ("maintenance", "Maintenance"), ("inactive", "Inactive")], default="available", max_length=20)),
                ("note", models.CharField(blank=True, max_length=255)),
                ("floor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="rooms", to="buildings.floor")),
            ],
            options={"ordering": ["floor__building__name", "floor__number", "code"]},
        ),
    ]
