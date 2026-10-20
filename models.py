from django.conf import settings
from django.db import models

class Problem(models.Model):
    """Curated reasoning task. Expected answers stay on the server."""
    title = models.CharField(max_length=180)
    statement = models.TextField()
    pattern = models.CharField(max_length=80, db_index=True)
    difficulty = models.PositiveSmallIntegerField(default=1)
    goal_hint = models.TextField(blank=True)
    input_description = models.TextField(blank=True)
    output_description = models.TextField(blank=True)
    constraints = models.TextField(blank=True)
    decomposition_hint = models.TextField(blank=True)
    state_hint = models.TextField(blank=True)
    decision_hint = models.TextField(blank=True)
    verification_hint = models.TextField(blank=True)
    transfer_problem = models.TextField(blank=True)
    transfer_pattern = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ProblemAttempt(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="problem_solving_attempts")
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name="attempts")
    goal_answer = models.TextField(blank=True)
    inputs_answer = models.TextField(blank=True)
    outputs_answer = models.TextField(blank=True)
    constraints_answer = models.TextField(blank=True)
    decomposition_answer = models.TextField(blank=True)
    pattern_answer = models.CharField(max_length=100, blank=True)
    state_answer = models.TextField(blank=True)
    decision_answer = models.TextField(blank=True)
    verification_answer = models.TextField(blank=True)
    logic_steps = models.JSONField(default=list, blank=True)
    transfer_answer = models.TextField(blank=True)
    scores = models.JSONField(default=dict, blank=True)
    total_score = models.PositiveSmallIntegerField(default=0)
    feedback = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student_id}: {self.problem.title} ({self.total_score})"
