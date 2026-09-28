import os
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from openai import OpenAI

from .models import (
    Course,
    Lesson,
    StudentProgress,
    UserProfile,
    Assessment,
    Question,
    AssessmentAttempt,
)


class StudentChatbotView(APIView):
    """
    AI chatbot for students using OpenAI.

    The chatbot can use the student's available course,
    lesson, progress and assessment information as context.
    """

    permission_classes = [IsAuthenticated]

    def get_model_data(self, model_class, user=None, limit=50):
        """
        Safely collect database information without assuming
        exact field names in the models.
        """

        try:
            queryset = model_class.objects.all()

            # If the model has a user/student relationship,
            # try to filter it automatically.
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
                        value = getattr(obj, field.name)

                        # Don't expose passwords/secrets
                        if field.name.lower() in [
                            "password",
                            "secret",
                            "secret_key",
                            "api_key",
                        ]:
                            continue

                        # Convert related objects to strings
                        if hasattr(value, "pk"):
                            value = str(value)

                        data[field.name] = str(value)

                    except Exception:
                        continue

                results.append(data)

            return results

        except Exception:
            return []

    def build_student_context(self, user):
        """
        Build useful learning context for the AI.
        """

        context = {
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

        return context

    def post(self, request):
        """
        POST /api/chatbot/

        Body:

        {
            "message": "What should I study next?"
        }
        """

        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {
                    "error": "Message is required."
                },
                status=400,
            )

        # --------------------------------------------------
        # OPENAI API KEY
        # --------------------------------------------------

        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            return Response(
                {
                    "error": "OPENAI_API_KEY is not configured on the server."
                },
                status=500,
            )

        # --------------------------------------------------
        # OPENAI MODEL
        # --------------------------------------------------

        model = os.getenv(
            "OPENAI_MODEL",
            "gpt-5.5"
        )

        # --------------------------------------------------
        # BUILD STUDENT CONTEXT
        # --------------------------------------------------

        student_context = self.build_student_context(
            request.user
        )

        # --------------------------------------------------
        # SYSTEM INSTRUCTIONS
        # --------------------------------------------------

        instructions = """
You are LearnSmart, an AI learning assistant inside an
adaptive learning platform.

Your job is to help students understand their courses,
lessons, progress and assessments.

Important rules:

1. Give clear and beginner-friendly explanations.
2. Help the student understand concepts rather than
   simply giving answers.
3. When the student asks what they should study next,
   use their available learning progress and course
   information when possible.
4. If progress information is unavailable, say so and
   give a general study recommendation.
5. If the student asks about a topic, explain it with:
   - Simple explanation
   - Example
   - Important points
   - Practice suggestion
6. Keep responses concise but useful.
7. Do not invent student scores, progress or course data.
8. Do not claim that you accessed information that is
   not present in the provided student context.
9. Be encouraging and act like a personal academic tutor.
"""

        # --------------------------------------------------
        # CREATE OPENAI CLIENT
        # --------------------------------------------------

        try:
            client = OpenAI(
                api_key=api_key
            )

            # --------------------------------------------------
            # CREATE AI RESPONSE
            # --------------------------------------------------

            response = client.responses.create(
                model=model,
                instructions=instructions,
                input=[
                    {
                        "role": "user",
                        "content": (
                            "Student information:\n\n"
                            + str(student_context)
                            + "\n\n"
                            "Student question:\n\n"
                            + message
                        ),
                    }
                ],
            )

            answer = response.output_text

            return Response(
                {
                    "message": answer,
                    "model": model,
                },
                status=200,
            )

        except Exception as e:

            return Response(
                {
                    "error": "AI service returned an error.",
                    "details": str(e),
                    "model": model,
                },
                status=502,
            )
