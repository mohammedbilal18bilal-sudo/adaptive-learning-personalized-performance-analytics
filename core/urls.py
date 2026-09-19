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
)


router = DefaultRouter()

router.register(r'courses', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'progress', StudentProgressViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'assessments', AssessmentViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'attempts', AssessmentAttemptViewSet)


urlpatterns = [
    path('', include(router.urls)),
]