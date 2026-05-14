from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("invoices", "0002_servicesubscription_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="invoice",
            name="electricity_reading",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="invoice",
            name="water_reading",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AlterField(
            model_name="invoice",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Bản nháp"),
                    ("pending", "Chờ thanh toán"),
                    ("paid", "Đã thanh toán"),
                    ("cancelled", "Đã hủy"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
