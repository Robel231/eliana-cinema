# Generated by Django 4.2.11 on 2025-06-30 14:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema', '0005_booking_payment_status_booking_transaction_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='director',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
