# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-10-14 15:26
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('example', '0003_auto_20161014_1722'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chater',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
