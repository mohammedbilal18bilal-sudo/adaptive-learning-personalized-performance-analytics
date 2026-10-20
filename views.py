from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .evaluator import evaluate
from .models import Problem, ProblemAttempt
from .serializers import ProblemSerializer, ProblemAttemptSerializer

class ProblemListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs = Problem.objects.filter(is_active=True).order_by("difficulty", "id")
        return Response(ProblemSerializer(qs, many=True).data)

class AttemptListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        qs = ProblemAttempt.objects.filter(student=request.user).select_related("problem")[:100]
        return Response(ProblemAttemptSerializer(qs, many=True).data)
    def post(self, request):
        data = request.data
        try:
            problem = Problem.objects.get(pk=data.get("problem"), is_active=True)
        except (Problem.DoesNotExist, TypeError, ValueError):
            return Response({"detail": "A valid active problem ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        scores, total, feedback = evaluate(data, problem)
        allowed = {field for field, _ in __import__('problem_solving.evaluator', fromlist=['FIELDS']).FIELDS.values()}
        payload = {key: data.get(key, "") for key in allowed}
        payload["logic_steps"] = data.get("logic_steps", []) if isinstance(data.get("logic_steps", []), list) else []
        attempt = ProblemAttempt.objects.create(student=request.user, problem=problem, scores=scores, total_score=total, feedback=feedback, **payload)
        return Response(ProblemAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)

class ReasoningProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        attempts = ProblemAttempt.objects.filter(student=request.user)
        skills = ["goal", "inputs", "outputs", "constraints", "decomposition", "pattern", "state", "decision", "verification", "transfer", "logical_sequencing"]
        profile = {}
        for skill in skills:
            values = [a.scores.get(skill, 0) for a in attempts if skill in a.scores]
            profile[skill] = round(sum(values) / len(values)) if values else None
        weakest = sorted(((k, v) for k, v in profile.items() if v is not None), key=lambda x: x[1])[:3]
        return Response({"attempt_count": attempts.count(), "skills": profile, "focus_areas": [k for k, _ in weakest]})
