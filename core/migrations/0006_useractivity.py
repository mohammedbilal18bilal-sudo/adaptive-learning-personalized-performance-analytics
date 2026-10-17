from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0005_assessmentattempt"),
        migrations.swappable_dependency(
            settings.AUTH_USER_MODEL
        ),
    ]

    operations = [
        migrations.CreateModel(
            name="UserActivity",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "activity_date",
                    models.DateField(
                        default=django.utils.timezone.localdate
                    ),
                ),
                (
                    "activity_type",
                    models.CharField(
                        choices=[
                            (
                                "lesson_progress",
                                "Lesson Progress",
                            ),
                            (
                                "assessment_attempt",
                                "Assessment Attempt",
                            ),
                            (
                                "chatbot_interaction",
                                "Chatbot Interaction",
                            ),
                            (
                                "course_management",
                                "Course Management",
                            ),
                            (
                                "lesson_management",
                                "Lesson Management",
                            ),
                            (
                                "assessment_management",
                                "Assessment Management",
                            ),
                        ],
                        max_length=40,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="activities",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": [
                    "-activity_date",
                    "-created_at",
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="useractivity",
            constraint=models.UniqueConstraint(
                fields=(
                    "user",
                    "activity_date",
                    "activity_type",
                ),
                name="unique_user_activity_type_per_day",
            ),
        ),
    ]
