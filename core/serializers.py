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


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"


class StudentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProgress
        fields = "__all__"


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"


class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    """Return questions and options without exposing correct answers."""

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


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    """Serialize attempts without allowing clients to set their scores."""

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
