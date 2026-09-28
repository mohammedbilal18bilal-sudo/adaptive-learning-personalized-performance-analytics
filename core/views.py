import os
import time

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from google import genai

from .models import (
    Course,
    Lesson,
    StudentProgress,
    UserProfile,
    Assessment,
    Question,
    AssessmentAttempt,
)

from .serializers import (
    CourseSerializer,
    LessonSerializer,
    StudentProgressSerializer,
    UserProfileSerializer,
    AssessmentSerializer,
    QuestionSerializer,
    AssessmentAttemptSerializer,
)


# ============================================================
# COURSE
# ============================================================

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# LESSON
# ============================================================

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# STUDENT PROGRESS
# ============================================================

class StudentProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# USER PROFILE
# ============================================================

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# ASSESSMENT
# ============================================================

class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# QUESTION
# ============================================================

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# ASSESSMENT ATTEMPT
# ============================================================

class AssessmentAttemptViewSet(viewsets.ModelViewSet):
    queryset = AssessmentAttempt.objects.all()
    serializer_class = AssessmentAttemptSerializer
    permission_classes = [IsAuthenticated]


# ============================================================
# AI CHATBOT - GEMINI
# ============================================================

class StudentChatbotView(APIView):

    permission_classes = [IsAuthenticated]

    def get_model_data(self, model_class, user=None, limit=50):

        try:
            queryset = model_class.objects.all()

            if user is not None:

                field_names = [
                    field.name
                    for field in model_class._meta.get_fields()
                ]

                possible_user_fields = [
                    "user",
                    "student",
                    "student_user",
                    "created_by",
                    "owner",
                ]

                for field_name in possible_user_fields:

                    if field_name in field_names:

                        try:
                            queryset = queryset.filter(
                                **{field_name: user}
                            )
                            break

                        except Exception:
                            pass

            queryset = queryset[:limit]

            results = []

            for obj in queryset:

                data = {}

                for field in obj._meta.fields:

                    try:

                        field_name = field.name

                        if field_name.lower() in [
                            "password",
                            "secret",
                            "secret_key",
                            "api_key",
                        ]:
                            continue

                        value = getattr(obj, field_name)

                        if hasattr(value, "pk"):
                            value = str(value)

                        data[field_name] = str(value)

                    except Exception:
                        continue

                results.append(data)

            return results

        except Exception:
            return []

    def build_student_context(self, user):

        return {
            "student": {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },

            "courses": self.get_model_data(
                Course,
                user=user,
                limit=20,
            ),

            "lessons": self.get_model_data(
                Lesson,
                user=user,
                limit=50,
            ),

            "progress": self.get_model_data(
                StudentProgress,
                user=user,
                limit=50,
            ),

            "assessments": self.get_model_data(
                Assessment,
                user=user,
                limit=30,
            ),

            "assessment_attempts": self.get_model_data(
                AssessmentAttempt,
                user=user,
                limit=30,
            ),
        }

    def post(self, request):

        message = request.data.get(
            "message",
            ""
        ).strip()

        if not message:

            return Response(
                {
                    "error": "Message is required."
                },
                status=400,
            )

        # ====================================================
        # GEMINI API KEY
        # ====================================================

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:

            return Response(
                {
                    "error": (
                        "GEMINI_API_KEY is not configured "
                        "on the server."
                    )
                },
                status=500,
            )

        # ====================================================
        # GEMINI MODEL
        # ====================================================

        model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash"
        )

        # ====================================================
        # STUDENT CONTEXT
        # ====================================================

        student_context = self.build_student_context(
            request.user
        )

        # ====================================================
        # AI INSTRUCTIONS
        # ====================================================

        instructions = """
You are LearnSmart, an AI learning assistant inside
an adaptive learning platform.

Your job is to help students understand their courses,
lessons, progress and assessments.

Rules:

1. Give clear and beginner-friendly explanations.

2. Help students understand concepts instead of simply
giving answers.

3. When the student asks what they should study next,
use the available course, lesson and progress data.

4. If progress information is unavailable, clearly say
that the information is unavailable and provide a
general study recommendation.

5. When explaining a topic, provide:
- Simple explanation
- Example
- Important points
- Practice suggestion

6. Keep responses concise but useful.

7. Never invent student scores, progress, courses,
lessons or assessment results.

8. Only use student information included in the
provided context.

9. Never claim to have accessed information that is
not present in the context.

10. Act as a friendly personal academic tutor.

11. Encourage the student and help create a practical
learning plan.

12. If the student asks something unrelated to studying,
answer briefly and politely.
"""

        # ====================================================
        # GEMINI REQUEST WITH AUTOMATIC RETRY
        # ====================================================

        try:

            client = genai.Client(
                api_key=api_key
            )

            answer = None
            max_retries = 3

            for attempt in range(max_retries):

                try:

                    response = client.models.generate_content(
                        model=model,
                        contents=(
                            instructions
                            + "\n\nStudent information:\n\n"
                            + str(student_context)
                            + "\n\nStudent question:\n\n"
                            + message
                        ),
                    )

                    answer = response.text
                    break

                except Exception as gemini_error:

                    error_text = str(gemini_error)

                    if (
                        "503" in error_text
                        or "UNAVAILABLE" in error_text
                    ):

                        if attempt < max_retries - 1:

                            wait_time = 5 * (2 ** attempt)

                            time.sleep(wait_time)

                            continue

                    raise gemini_error

            # =================================================
            # NO ANSWER
            # =================================================

            if answer is None:

                return Response(
                    {
                        "error": (
                            "Gemini service is temporarily "
                            "unavailable. Please try again later."
                        ),
                        "model": model,
                    },
                    status=503,
                )

            # =================================================
            # SUCCESS
            # =================================================

            return Response(
                {
                    "message": answer,
                    "model": model,
                },
                status=200,
            )

        # ====================================================
        # GEMINI ERROR
        # ====================================================

        except Exception as e:

            return Response(
                {
                    "error": "Gemini AI service returned an error.",
                    "details": str(e),
                    "model": model,
                },
                status=502,
            )
