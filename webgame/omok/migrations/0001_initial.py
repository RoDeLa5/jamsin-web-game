# Generated by Django 4.1 on 2022-08-10 07:08

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Omok',
            fields=[
                ('moves', models.TextField(null=True)),
                ('chat', models.TextField(null=True)),
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(default=datetime.datetime.now)),
                ('completed', models.DateTimeField(null=True)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='omok_creator', to=settings.AUTH_USER_MODEL)),
                ('opponent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='omok_opponent', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
