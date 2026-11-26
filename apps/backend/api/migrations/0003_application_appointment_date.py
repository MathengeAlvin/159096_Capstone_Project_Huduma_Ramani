from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_application"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="appointment_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
