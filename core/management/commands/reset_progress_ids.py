from django.core.management.base import BaseCommand
from django.db import connection
from core.models import StudentProgress, AssessmentAttempt


class Command(BaseCommand):
    help = "Reset demo progress and assessment attempt IDs."

    def handle(self, *args, **kwargs):

        # -----------------------------
        # RESET STUDENT PROGRESS IDS
        # -----------------------------

        progress_ids = list(
            StudentProgress.objects.order_by("id")
            .values_list("id", flat=True)
        )

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

        elif progress_ids == [1, 2, 3, 4, 5]:

            self.stdout.write(
                self.style.SUCCESS(
                    "Progress IDs are already correct (1-5)."
                )
            )

        else:

            self.stdout.write(
                self.style.WARNING(
                    f"No changes made to progress IDs. "
                    f"Current progress IDs: {progress_ids}"
                )
            )


        # -----------------------------------
        # RESET ASSESSMENT ATTEMPT ID
        # -----------------------------------

        attempt_ids = list(
            AssessmentAttempt.objects.order_by("id")
            .values_list("id", flat=True)
        )

        if attempt_ids == [2]:

            AssessmentAttempt.objects.filter(
                id=2
            ).delete()

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT setval(
                        pg_get_serial_sequence(
                            'core_assessmentattempt',
                            'id'
                        ),
                        1,
                        false
                    )
                """)

            self.stdout.write(
                self.style.SUCCESS(
                    "Assessment attempt reset. Next ID will be 1."
                )
            )

        elif attempt_ids == [1]:

            self.stdout.write(
                self.style.SUCCESS(
                    "Assessment attempt ID is already correct (1)."
                )
            )

        else:

            self.stdout.write(
                self.style.WARNING(
                    f"No changes made to attempt IDs. "
                    f"Current attempt IDs: {attempt_ids}"
                )
            )
