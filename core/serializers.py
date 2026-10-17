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

from .permissions import get_user_role


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
    """
    Students can manage their own progress records.

    They cannot assign a progress record to another student.
    Faculty and administrators can manage progress records
    for teaching and administrative purposes.
    """

    class Meta:
        model = StudentProgress
        fields = "__all__"

    def get_fields(self):

        fields = super().get_fields()
        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and get_user_role(request.user) == "student"
        ):
            fields["student"].read_only = True

        return fields


# ============================================================
# USER PROFILE SERIALIZER
# ============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Only administrators can change profile ownership or roles.
    """

    class Meta:
        model = UserProfile
        fields = "__all__"

    def get_fields(self):

        fields = super().get_fields()
        request = self.context.get("request")

        is_admin = (
            request is not None
            and request.user.is_authenticated
            and get_user_role(request.user) == "admin"
        )

        if not is_admin:

            if "user" in fields:
                fields["user"].read_only = True

            if "role" in fields:
                fields["role"].read_only = True

        return fields


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
    Never expose correct_option through the questions API.
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
    The backend calculates scores and percentages.

    Clients cannot directly submit or modify scores.
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
