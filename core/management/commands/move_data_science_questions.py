from django.core.management.base import BaseCommand
from core.models import Question


class Command(BaseCommand):
    help = "Move Data Science questions from the old Python assessment to the Data Science assessment"

    def handle(self, *args, **kwargs):

        updated = Question.objects.filter(
            id__gte=2,
            id__lte=11
        ).update(
            assessment_id=2
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{updated} Data Science questions moved to Assessment 2 successfully."
            )
        )
