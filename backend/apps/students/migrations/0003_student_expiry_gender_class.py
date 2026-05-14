from datetime import timedelta

from django.db import migrations, models


def set_default_expiry(apps, schema_editor):
    Student = apps.get_model("students", "Student")
    for student in Student.objects.all():
        if student.expiry_date:
            continue
        if student.registered_at:
            student.expiry_date = student.registered_at + timedelta(days=365)
            student.save(update_fields=["expiry_date"])


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0002_student_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="class_name",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="student",
            name="gender",
            field=models.CharField(blank=True, choices=[("male", "Nam"), ("female", "Nữ"), ("other", "Khác")], max_length=20),
        ),
        migrations.AddField(
            model_name="student",
            name="expiry_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="student",
            name="status",
            field=models.CharField(choices=[("active", "Active"), ("pending", "Pending"), ("moved_out", "Moved out"), ("suspended", "Suspended"), ("expired", "Expired")], default="pending", max_length=20),
        ),
        migrations.RunPython(set_default_expiry, migrations.RunPython.noop),
    ]
