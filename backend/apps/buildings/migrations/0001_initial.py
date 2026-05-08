import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Building",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120, unique=True)),
                ("code", models.CharField(max_length=20, unique=True)),
                ("address", models.CharField(blank=True, max_length=255)),
                ("manager_name", models.CharField(blank=True, max_length=120)),
                ("description", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Floor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=80)),
                ("number", models.PositiveIntegerField()),
                ("note", models.CharField(blank=True, max_length=255)),
                ("building", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="floors", to="buildings.building")),
            ],
            options={"ordering": ["building__name", "number"]},
        ),
        migrations.AddConstraint(
            model_name="floor",
            constraint=models.UniqueConstraint(fields=("building", "number"), name="unique_floor_number_per_building"),
        ),
    ]
