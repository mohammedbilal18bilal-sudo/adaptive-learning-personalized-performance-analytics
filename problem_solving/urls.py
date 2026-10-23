from django.urls import path
from .views import ProblemListView, AttemptListCreateView, ReasoningProfileView

app_name = "problem_solving"
urlpatterns = [
    path("problems/", ProblemListView.as_view(), name="problem-list"),
    path("attempts/", AttemptListCreateView.as_view(), name="attempt-list-create"),
    path("profile/", ReasoningProfileView.as_view(), name="reasoning-profile"),
]
