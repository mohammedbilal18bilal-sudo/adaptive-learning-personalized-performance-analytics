from django.contrib import admin
from .models import Problem, ProblemAttempt

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ("title", "pattern", "difficulty", "is_active")
    list_filter = ("pattern", "difficulty", "is_active")
    search_fields = ("title", "statement")

@admin.register(ProblemAttempt)
class ProblemAttemptAdmin(admin.ModelAdmin):
    list_display = ("student", "problem", "total_score", "created_at")
    list_filter = ("problem", "created_at")
    readonly_fields = ("scores", "feedback", "total_score")
