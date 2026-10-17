from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# ============================================================
# COURSE MODEL
# ============================================================

class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ============================================================
# LESSON MODEL
# ============================================================

class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons"
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    difficulty = models.IntegerField(default=1)
    order = models.IntegerField(default=1)

    def __str__(self):
        return self.title


# ============================================================
# STUDENT PROGRESS MODEL
# ============================================================

class StudentProgress(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="progress"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="student_progress"
    )
    completed = models.BooleanField(default=False)
    score = models.FloatField(default=0)
    attempts = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title}"


# ============================================================
# USER PROFILE MODEL
# ============================================================

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("faculty", "Faculty"),
        ("admin", "Admin"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ============================================================
# ASSESSMENT MODEL
# ============================================================

class Assessment(models.Model):
    title = models.CharField(max_length=200)

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="assessments"
    )

    description = models.TextField(blank=True)
    total_marks = models.IntegerField(default=100)
    duration_minutes = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ============================================================
# QUESTION MODEL
# ============================================================

class Question(models.Model):
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_text = models.TextField()

    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)

    correct_option = models.CharField(max_length=1)

    marks = models.IntegerField(default=1)
    difficulty = models.IntegerField(default=1)

    def __str__(self):
        return self.question_text


# ============================================================
# ASSESSMENT ATTEMPT MODEL
# ============================================================

class AssessmentAttempt(models.Model):
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assessment_attempts"
    )

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="attempts"
    )

    score = models.FloatField(default=0)
    percentage = models.FloatField(default=0)

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.assessment.title}"
        )


# ============================================================
# USER ACTIVITY MODEL — STREAK TRACKING
# ============================================================

class UserActivity(models.Model):

    ACTIVITY_TYPE_CHOICES = (
        ("lesson_progress", "Lesson Progress"),
        ("assessment_attempt", "Assessment Attempt"),
        ("chatbot_interaction", "Chatbot Interaction"),
        ("course_management", "Course Management"),
        ("lesson_management", "Lesson Management"),
        ("assessment_management", "Assessment Management"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    activity_date = models.DateField(
        default=timezone.localdate
    )

    activity_type = models.CharField(
        max_length=40,
        choices=ACTIVITY_TYPE_CHOICES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = [
            "-activity_date",
            "-created_at"
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "activity_date",
                    "activity_type"
                ],
                name="unique_user_activity_type_per_day"
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.activity_type} - "
            f"{self.activity_date}"
        )
