from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet,
    LessonViewSet,
    StudentProgressViewSet,
    UserProfileViewSet,
    AssessmentViewSet,
    QuestionViewSet,
    AssessmentAttemptViewSet,
    StudentChatbotView,
)

from .streaks import UserStreakView


# ============================================================
# API ROUTER
# ============================================================

router = DefaultRouter()

router.register(r"courses", CourseViewSet)
router.register(r"lessons", LessonViewSet)
router.register(r"progress", StudentProgressViewSet)
router.register(r"profiles", UserProfileViewSet)
router.register(r"assessments", AssessmentViewSet)
router.register(r"questions", QuestionViewSet)
router.register(r"attempts", AssessmentAttemptViewSet)


# ============================================================
# URL PATTERNS
# ============================================================

urlpatterns = [
    # Existing course, lesson, progress and assessment APIs.
    path(
        "",
        include(router.urls),
    ),

    # Existing Learn Smart chatbot.
    path(
        "chatbot/",
        StudentChatbotView.as_view(),
        name="student-chatbot",
    ),

    # New student and faculty streak API.
    path(
        "streaks/",
        UserStreakView.as_view(),
        name="user-streaks",
    ),
]
