from rest_framework import serializers

from .models import (
    Course,
    Lesson,
    StudentProgress,
    UserProfile,
    Assessment,
    Question,
    AssessmentAttempt,
)


# ============================================================
# COURSE SERIALIZER
# ============================================================

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


# ============================================================
# LESSON SERIALIZER
# ============================================================

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"


# ============================================================
# STUDENT PROGRESS SERIALIZER
# ============================================================

class StudentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProgress
        fields = "__all__"


# ============================================================
# USER PROFILE SERIALIZER
# ============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"


# ============================================================
# ASSESSMENT SERIALIZER
# ============================================================

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = "__all__"


# ============================================================
# QUESTION SERIALIZER
# ============================================================

class QuestionSerializer(serializers.ModelSerializer):
    """
    Return quiz questions and answer options without exposing
    the correct answer to students through the API.
    """

    class Meta:
        model = Question

        fields = (
            "id",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "marks",
            "difficulty",
            "assessment",
        )

        read_only_fields = fields


# ============================================================
# ASSESSMENT ATTEMPT SERIALIZER
# ============================================================

class AssessmentAttemptSerializer(serializers.ModelSerializer):
    """
    Serialize assessment attempts.

    The view calculates score and percentage on the server.
    The client cannot directly change these values.
    """

    answers = serializers.DictField(
        write_only=True,
        required=False,
    )

    class Meta:
        model = AssessmentAttempt

        fields = (
            "id",
            "student",
            "assessment",
            "score",
            "percentage",
            "submitted_at",
            "answers",
        )

        read_only_fields = (
            "id",
            "student",
            "score",
            "percentage",
            "submitted_at",
        )
