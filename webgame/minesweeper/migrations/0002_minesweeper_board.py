# Generated by Django 4.1 on 2022-08-11 01:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("minesweeper", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="minesweeper",
            name="board",
            field=models.JSONField(default=""),
            preserve_default=False,
        ),
    ]
