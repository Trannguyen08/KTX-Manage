import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("announcements", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="AnnouncementRead",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("read_at", models.DateTimeField(auto_now_add=True)),
                ("announcement", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reads", to="announcements.announcement")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="announcement_reads", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-read_at"],
                "unique_together": {("announcement", "user")},
            },
        ),
    ]
