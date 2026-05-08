from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="UtilityService",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120, unique=True)),
                ("code", models.CharField(max_length=30, unique=True)),
                ("unit", models.CharField(default="Month", max_length=40)),
                ("price", models.DecimalField(decimal_places=0, default=0, max_digits=12)),
                ("billing_cycle", models.CharField(choices=[("monthly", "Monthly"), ("usage", "Usage"), ("one_time", "One time")], default="monthly", max_length=20)),
                ("description", models.CharField(blank=True, max_length=255)),
                ("is_required", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
    ]
