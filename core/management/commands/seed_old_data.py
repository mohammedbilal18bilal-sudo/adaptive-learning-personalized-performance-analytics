from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import (
    Course,
    Lesson,
    StudentProgress,
    UserProfile,
    Assessment,
    Question,
)


class Command(BaseCommand):
    help = "Create the original demo data"

    def handle(self, *args, **kwargs):

        # Get student user
        student = User.objects.filter(username="student1").first()

        if not student:
            self.stdout.write(
                self.style.ERROR("student1 user not found. Run create_demo_users first.")
            )
            return

        # Create the 3 original courses
        if Course.objects.count() == 0:
            course1 = Course.objects.create(
                title="Python Basics",
                description="Learn the fundamentals of Python programming"
            )

            Course.objects.create(
                title="Python Basics",
                description="Learn the fundamentals of Python programming"
            )

            Course.objects.create(
                title="Python Basics",
                description="Learn the fundamentals of Python programming"
            )
        else:
            course1 = Course.objects.first()

        # Create original lesson
        lesson, _ = Lesson.objects.get_or_create(
            title="Introduction to Python",
            course=course1,
            defaults={
                "content": (
                    "Python is a beginner-friendly programming language used "
                    "for web development, data analysis, automation, and more."
                ),
                "difficulty": 1,
                "order": 1,
            },
        )

        # Create student profile
        UserProfile.objects.get_or_create(
            user=student,
            defaults={"role": "student"},
        )

        # Create original assessment
        assessment, _ = Assessment.objects.get_or_create(
            title="Python Basic Quiz",
            course=course1,
            defaults={
                "description": "Basic assessments for Python Fundamentals",
                "total_marks": 100,
                "duration_minutes": 30,
            },
        )

        # Create original question
        Question.objects.get_or_create(
            assessment=assessment,
            question_text="What is the correct way to create a variable in Python?",
            defaults={
                "option_a": "int x = 10",
                "option_b": "x = 10",
                "option_c": "var x = 10",
                "option_d": "let x = 10",
                "correct_option": "b",
                "marks": 1,
                "difficulty": 1,
            },
        )

        # Create original student progress
        StudentProgress.objects.get_or_create(
            student=student,
            lesson=lesson,
            defaults={
                "completed": True,
                "score": 85,
                "attempts": 1,
            },
        )

        self.stdout.write(
            self.style.SUCCESS("Original demo data created successfully!")
        )
