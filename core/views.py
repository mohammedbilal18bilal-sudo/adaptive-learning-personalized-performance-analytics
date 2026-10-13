import os

from google import genai
from google.genai import types

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

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
# LEARN SMART - AI CHATBOT
# ============================================================

class StudentChatbotView(APIView):

    permission_classes = [IsAuthenticated]

    # ========================================================
    # GET DATA FROM DATABASE
    # ========================================================

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
                            continue

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

    # ========================================================
    # BUILD STUDENT CONTEXT
    # ========================================================

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

    # ========================================================
    # CHATBOT POST REQUEST
    # ========================================================

    def post(self, request):

        message = request.data.get("message", "")

        if not isinstance(message, str):
            return Response(
                {"error": "Message must be text."},
                status=400,
            )

        message = message.strip()

        if not message:
            return Response(
                {"error": "Message is required."},
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
                        "Gemini API key is not configured "
                        "on the server."
                    )
                },
                status=503,
            )

        # ====================================================
        # GEMINI MODEL
        # ====================================================

        model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.8-flash",
        )

        # ====================================================
        # STUDENT INFORMATION
        # ====================================================

        try:
            student_context = self.build_student_context(
                request.user
            )
        except Exception:
            return Response(
                {
                    "error": (
                        "Unable to load student information "
                        "right now. Please try again."
                    )
                },
                status=500,
            )

        # ====================================================
        # LEARN SMART INSTRUCTIONS
        # ====================================================

        instructions = """
You are Learn Smart, an AI learning assistant inside
an adaptive learning platform.

Your job is to help students understand their courses,
lessons, progress, and assessments.

Rules:

1. Introduce yourself as Learn Smart when asked who you are.

2. Give clear, beginner-friendly explanations.

3. Help students understand concepts instead of simply
giving answers.

4. When the student asks what to study next, use the
available course, lesson, and progress information.

5. If progress information is unavailable, say so clearly
and provide a general study recommendation.

6. When explaining a topic, include a simple explanation,
an example, important points, and a practice suggestion
when appropriate.

7. Keep responses concise but useful.

8. Never invent student scores, progress, courses, lessons,
or assessment results.

9. Only use student information included in the context.

10. Never claim to have accessed information that is not
present in the context.

11. Act as a friendly personal academic tutor.

12. Encourage the student and help create a practical
learning plan.

13. If the student asks something unrelated to studying,
answer briefly and politely.

14. Use the course and lesson information supplied in the
context rather than assuming the platform has only one course.
"""

        # ====================================================
        # GEMINI REQUEST WITH TIMEOUT
        # ====================================================

        try:

            client = genai.Client(
                api_key=api_key,
                http_options=types.HttpOptions(
                    timeout=15000,
                ),
            )

            prompt = (
                instructions
                + "\n\nStudent information:\n"
                + str(student_context)
                + "\n\nStudent question:\n"
                + message
            )

            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.5,
                ),
            )

            answer = response.text

            if not answer:
                return Response(
                    {
                        "error": (
                            "Learn Smart did not receive an answer "
                            "from the AI service. Please try again."
                        )
                    },
                    status=502,
                )

            return Response(
                {
                    "message": answer,
                    "model": model,
                },
                status=200,
            )

        except Exception as error:

            # Log the technical error in Render logs.
            print(
                "Learn Smart Gemini error:",
                type(error).__name__,
                str(error)[:500],
            )

            return Response(
                {
                    "error": (
                        "Learn Smart could not connect to the AI "
                        "service. Please try again shortly."
                    ),
                    "model": model,
                },
                status=502,
            )
