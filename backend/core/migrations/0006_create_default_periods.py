
from django.db import migrations, models

def create_periods(apps, schema_editor):
    Period = apps.get_model('core', 'Period')
    periods = [
        (1, '09:30', '10:30'),
        (2, '10:30', '11:30'),
        (3, '11:45', '12:45'),
        (4, '13:30', '14:30'),
        (5, '14:30', '15:30'),
    ]
    for number, start, end in periods:
        Period.objects.create(
            number=number,
            start_time=start,
            end_time=end
        )

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_period_attendance_teacher_and_more'),
    ]

    operations = [
        migrations.RunPython(create_periods),
    ]
