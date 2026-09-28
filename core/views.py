import os
import requests

from django.conf import settings
from rest_framework import viewsets, status
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

from .permissions import IsStudent, IsFaculty, IsAdmin


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]


class StudentProgressViewSet(viewsets.ModelViewSet):
    queryset = StudentProgress.objects.all()
    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]


class AssessmentAttemptViewSet(viewsets.ModelViewSet):
    queryset = AssessmentAttempt.objects.all()
    serializer_class = AssessmentAttemptSerializer
    permission_classes = [IsAuthenticated]


class StudentChatbotView(APIView):
    """
    Student-specific AI chatbot.

    The chatbot receives:
    - authenticated student
    - courses
    - lessons
    - student progress
    - scores
    - attempts

    It uses this information to provide personalized
    learning assistance.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # -------------------------------------------------
        # 1. CHECK STUDENT MESSAGE
        # -------------------------------------------------

        message = request.data.get("message", "").strip()

        if not message:
            return Response(
                {
                    "error": "Message is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # 2. CHECK USER ROLE
        # -------------------------------------------------

        user = request.user

        try:
            profile = UserProfile.objects.get(user=user)
            role = profile.role
        except UserProfile.DoesNotExist:
            role = "student"

        if role != "student":
            return Response(
                {
                    "error": "The chatbot is currently available only for students."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # 3. GET STUDENT PROGRESS
        # -------------------------------------------------

        progress_records = (
            StudentProgress.objects
            .filter(student=user)
            .select_related("lesson", "lesson__course")
            .order_by("lesson__course_id", "lesson__order")
        )

        progress_context = []

        for progress in progress_records:

            progress_context.append(
                {
                    "course": progress.lesson.course.title,
                    "lesson": progress.lesson.title,
                    "difficulty": progress.lesson.difficulty,
                    "completed": progress.completed,
                    "score": progress.score,
                    "attempts": progress.attempts,
                }
            )

        # -------------------------------------------------
        # 4. GET AVAILABLE LESSONS
        # -------------------------------------------------

        lessons = (
            Lesson.objects
            .select_related("course")
            .order_by("course_id", "order")
        )

        lesson_context = []

        for lesson in lessons[:30]:

            lesson_context.append(
                {
                    "course": lesson.course.title,
                    "lesson": lesson.title,
                    "difficulty": lesson.difficulty,
                    "content": lesson.content[:1500],
                }
            )

        # -------------------------------------------------
        # 5. CALCULATE BASIC PERFORMANCE
        # -------------------------------------------------

        completed_count = sum(
            1 for item in progress_context
            if item["completed"]
        )

        total_progress = len(progress_context)

        scores = [
            item["score"]
            for item in progress_context
            if item["completed"]
        ]

        average_score = (
            round(sum(scores) / len(scores), 2)
            if scores
            else 0
        )

        weak_topics = [
            item
            for item in progress_context
            if item["completed"] and item["score"] < 60
        ]

        incomplete_lessons = [
            item
            for item in progress_context
            if not item["completed"]
        ]

        # -------------------------------------------------
        # 6. BUILD PERSONALIZED STUDENT CONTEXT
        # -------------------------------------------------

        student_context = {
            "username": user.username,
            "completed_lessons": completed_count,
            "tracked_lessons": total_progress,
            "average_score": average_score,
            "weak_topics": weak_topics,
            "incomplete_lessons": incomplete_lessons,
            "progress": progress_context,
        }

        # -------------------------------------------------
        # 7. GEMINI API KEY
        # -------------------------------------------------

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            return Response(
                {
                    "error": (
                        "Gemini API key is not configured on the server."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # -------------------------------------------------
        # 8. GEMINI MODEL
        # -------------------------------------------------

        model = os.getenv(
            "GEMINI_MODEL",
            "gemini-3.6-flash"
        )

        # -------------------------------------------------
        # 9. SYSTEM INSTRUCTION
        # -------------------------------------------------

        system_instruction = """
You are LearnSmart's Student Learning Assistant.

You are NOT a generic chatbot.

Your main purpose is to help the authenticated student
learn using the student's actual learning-platform data.

You have access to:
- the student's courses
- lessons
- lesson difficulty
- lesson completion
- assessment scores
- attempts
- average performance
- weak topics
- incomplete lessons

Rules:

1. Give educational and study-related assistance.
2. Personalize recommendations using the student's actual progress.
3. If the student has weak topics, prioritize those topics.
4. If the student asks what to study next, recommend incomplete
   or weak lessons before unrelated topics.
5. Explain concepts clearly and at the student's level.
6. Do not invent course progress or scores.
7. If the requested information is not available in the platform
   data, clearly say that it is not available.
8. Do not expose passwords, authentication tokens, API keys,
   or private system information.
9. If asked about performance, explain the data rather than
   making unsupported judgments.
10. When useful, provide a short actionable study plan.
11. Encourage active learning rather than simply giving answers.
12. If the student asks for a quiz, create questions based on
   their available lessons and weak topics.
"""

        # -------------------------------------------------
        # 10. CREATE PROMPT
        # -------------------------------------------------

        prompt = f"""
SYSTEM ROLE:

{system_instruction}

STUDENT INFORMATION:

{student_context}

AVAILABLE LESSONS:

{lesson_context}

STUDENT MESSAGE:

{message}

Respond directly to the student.

If the student asks for personalized advice, use their
progress information.

Keep the answer clear and useful.
"""

        # -------------------------------------------------
        # 11. GEMINI API REQUEST
        # -------------------------------------------------

        url = (
            f"https://generativelanguage.googleapis.com/"
            f"v1beta/models/{model}:generateContent"
        )

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        }

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1200,
            },
        }

        try:

            gemini_response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=45,
            )

        except requests.RequestException as error:

            return Response(
                {
                    "error": "Unable to connect to the AI service.",
                    "details": str(error),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # -------------------------------------------------
        # 12. HANDLE GEMINI ERROR
        # -------------------------------------------------

        if not gemini_response.ok:

            try:
                error_data = gemini_response.json()
            except ValueError:
                error_data = {
                    "message": gemini_response.text
                }

            return Response(
                {
                    "error": "AI service returned an error.",
                    "details": error_data,
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        # -------------------------------------------------
        # 13. EXTRACT AI RESPONSE
        # -------------------------------------------------

        try:

            response_data = gemini_response.json()

            candidates = response_data.get(
                "candidates",
                []
            )

            if not candidates:
                return Response(
                    {
                        "error": "The AI service did not return a response."
                    },
                    status=status.HTTP_502_BAD_GATEWAY
                )

            parts = (
                candidates[0]
                .get("content", {})
                .get("parts", [])
            )

            answer = ""

            for part in parts:

                if "text" in part:
                    answer += part["text"]

            answer = answer.strip()

            if not answer:
                return Response(
                    {
                        "error": "The AI returned an empty response."
                    },
                    status=status.HTTP_502_BAD_GATEWAY
                )

        except (ValueError, KeyError, TypeError):

            return Response(
                {
                    "error": "Invalid response received from AI service."
                },
                status=status.HTTP_502_BAD_GATEWAY
            )

        # -------------------------------------------------
        # 14. RETURN PERSONALIZED RESPONSE
        # -------------------------------------------------

        return Response(
            {
                "answer": answer,
                "student": user.username,
                "performance": {
                    "average_score": average_score,
                    "completed_lessons": completed_count,
                    "tracked_lessons": total_progress,
                    "weak_topics_count": len(weak_topics),
                    "incomplete_lessons_count": len(
                        incomplete_lessons
                    ),
                },
            },
            status=status.HTTP_200_OK
        )
