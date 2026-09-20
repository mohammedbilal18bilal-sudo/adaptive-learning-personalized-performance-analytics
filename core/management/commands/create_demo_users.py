import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile


class Command(BaseCommand):
    help = "Create demo users for Student, Faculty, and Admin roles"

    def handle(self, *args, **kwargs):

        users = [
            {
                "username": os.getenv("STUDENT_USERNAME"),
                "password": os.getenv("STUDENT_PASSWORD"),
                "role": "student",
            },
            {
                "username": os.getenv("FACULTY_USERNAME"),
                "password": os.getenv("FACULTY_PASSWORD"),
                "role": "faculty",
            },
            {
                "username": os.getenv("ADMIN_USERNAME"),
                "password": os.getenv("ADMIN_PASSWORD"),
                "role": "admin",
            },
        ]

        for data in users:
            user, created = User.objects.get_or_create(
                username=data["username"]
            )

            user.set_password(data["password"])
            user.save()

            profile, _ = UserProfile.objects.get_or_create(
                user=user
            )
            profile.role = data["role"]
            profile.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f"{data['role'].title()} user ready: {data['username']}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS("Demo users created successfully.")
        )
