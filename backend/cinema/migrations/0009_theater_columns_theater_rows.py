# Generated by Django 4.2.11 on 2025-07-01 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cinema', '0008_remove_booking_payment_proof_payment'),
    ]

    operations = [
        migrations.AddField(
            model_name='theater',
            name='columns',
            field=models.IntegerField(default=15),
        ),
        migrations.AddField(
            model_name='theater',
            name='rows',
            field=models.IntegerField(default=10),
        ),
    ]
