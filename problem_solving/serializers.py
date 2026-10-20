from rest_framework import serializers
from .models import Problem, ProblemAttempt

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ["id", "title", "statement", "pattern", "difficulty", "goal_hint", "input_description", "output_description", "constraints", "decomposition_hint", "state_hint", "decision_hint", "verification_hint", "transfer_problem", "transfer_pattern"]

class ProblemAttemptSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source="problem.title", read_only=True)
    class Meta:
        model = ProblemAttempt
        fields = ["id", "problem", "problem_title", "goal_answer", "inputs_answer", "outputs_answer", "constraints_answer", "decomposition_answer", "pattern_answer", "state_answer", "decision_answer", "verification_answer", "logic_steps", "transfer_answer", "scores", "total_score", "feedback", "created_at"]
        read_only_fields = ["id", "problem_title", "scores", "total_score", "feedback", "created_at"]
