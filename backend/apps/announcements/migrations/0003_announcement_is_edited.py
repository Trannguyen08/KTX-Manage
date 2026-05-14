from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("announcements", "0002_announcementread"),
    ]

    operations = [
        migrations.AddField(
            model_name="announcement",
            name="is_edited",
            field=models.BooleanField(default=False),
        ),
    ]
