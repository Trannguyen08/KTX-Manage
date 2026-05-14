from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("invoices", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="servicesubscription",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Chờ xác nhận"),
                    ("active", "Đang sử dụng"),
                    ("completed", "Đã sử dụng"),
                    ("cancelled", "Đã hủy"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.RunSQL(
            "UPDATE invoices_servicesubscription SET status = CASE WHEN is_active THEN 'active' ELSE 'completed' END;",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
