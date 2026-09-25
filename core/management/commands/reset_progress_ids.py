from django.core.management.base import BaseCommand
from django.db import connection
from core.models import StudentProgress


class Command(BaseCommand):
    help = "Reset the five demo progress records to IDs 1-5."

    def handle(self, *args, **kwargs):

        progress_ids = list(
            StudentProgress.objects.order_by("id")
            .values_list("id", flat=True)
        )

        # Current state: progress IDs are 2, 3, 4, 5, 6
        if progress_ids == [2, 3, 4, 5, 6]:

            StudentProgress.objects.filter(
                id__in=progress_ids
            ).delete()

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT setval(
                        pg_get_serial_sequence(
                            'core_studentprogress',
                            'id'
                        ),
                        1,
                        false
                    )
                """)

            self.stdout.write(
                self.style.SUCCESS(
                    "Progress records reset. Next ID will be 1."
                )
            )

        # Already correct — don't delete anything
        elif progress_ids == [1, 2, 3, 4, 5]:

            self.stdout.write(
                self.style.SUCCESS(
                    "Progress IDs are already correct (1-5)."
                )
            )

        else:

            self.stdout.write(
                self.style.WARNING(
                    f"No changes made. Current progress IDs: {progress_ids}"
                )
            )
