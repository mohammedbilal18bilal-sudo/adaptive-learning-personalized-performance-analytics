from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Course, Lesson, Assessment


class Command(BaseCommand):
    help = "Change Data Science Fundamentals from Course 4 to Course 1"

    @transaction.atomic
    def handle(self, *args, **kwargs):

        old_course = Course.objects.get(id=4)

        # Create Course 1 using the same information
        new_course = Course.objects.create(
            title=old_course.title,
            description=old_course.description,
        )

        # Move all lessons from Course 4 to Course 1
        lessons_updated = Lesson.objects.filter(
            course_id=4
        ).update(
            course_id=new_course.id
        )

        # Move the Data Science assessment to Course 1
        assessments_updated = Assessment.objects.filter(
            course_id=4
        ).update(
            course_id=new_course.id
        )

        # Delete the old Course 4
        old_course.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Data Science Fundamentals is now Course {new_course.id}. "
                f"{lessons_updated} lessons and "
                f"{assessments_updated} assessment(s) moved successfully."
            )
        )
