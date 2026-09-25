from django.core.management.base import BaseCommand
from django.db import connection, transaction
from core.models import Course, Lesson, Assessment


class Command(BaseCommand):
    help = "Normalize Data Science Fundamentals to Course 1 and Lessons 1-5"

    @transaction.atomic
    def handle(self, *args, **kwargs):

        # If already fixed, do nothing
        if Course.objects.filter(
            id=1,
            title="Data Science Fundamentals"
        ).exists():
            self.stdout.write(
                self.style.SUCCESS(
                    "Already normalized. Nothing to change."
                )
            )
            return

        old_course = Course.objects.get(id=4)

        # Create Course 1 explicitly
        Course.objects.create(
            id=1,
            title=old_course.title,
            description=old_course.description,
        )

        # Move lessons to Course 1
        lessons = list(
            Lesson.objects.filter(course_id=4).order_by("order")
        )

        # Temporarily move IDs to 101-105
        for temp_id, lesson in enumerate(lessons, start=101):
            Lesson.objects.filter(pk=lesson.pk).update(id=temp_id)

        # Refresh lessons after changing their IDs
        lessons = list(
            Lesson.objects.filter(course_id=4).order_by("order")
        )

        # Move lessons to Course 1 and IDs 1-5
        for new_id, lesson in enumerate(lessons, start=1):
            Lesson.objects.filter(pk=lesson.pk).update(
                id=new_id,
                course_id=1
            )

        # Move assessment to Course 1
        Assessment.objects.filter(
            course_id=4
        ).update(course_id=1)

        # Delete old Course 4
        old_course.delete()

        # Reset PostgreSQL sequences
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT setval(
                    pg_get_serial_sequence('core_course', 'id'),
                    COALESCE(MAX(id), 1),
                    true
                )
                FROM core_course
            """)

            cursor.execute("""
                SELECT setval(
                    pg_get_serial_sequence('core_lesson', 'id'),
                    COALESCE(MAX(id), 1),
                    true
                )
                FROM core_lesson
            """)

        self.stdout.write(
            self.style.SUCCESS(
                "SUCCESS: Course 1 and Lessons 1-5 are now normalized."
            )
        )
