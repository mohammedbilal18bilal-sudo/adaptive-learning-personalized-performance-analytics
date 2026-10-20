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
        qs = Problem.objects.filter(
            is_active=True
        ).order_by("difficulty", "id")

        serializer = ProblemSerializer(qs, many=True)

        return Response(serializer.data)


class AttemptListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = ProblemAttempt.objects.filter(
            student=request.user
        ).select_related("problem")[:100]

        serializer = ProblemAttemptSerializer(qs, many=True)

        return Response(serializer.data)

    def post(self, request):
        data = request.data

        try:
            problem = Problem.objects.get(
                pk=data.get("problem"),
                is_active=True
            )
        except (Problem.DoesNotExist, TypeError, ValueError):
            return Response(
                {
                    "detail": "A valid active problem ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Evaluate the submitted answers.
        scores, total, feedback = evaluate(data, problem)

        # Collect the permitted answer fields.
        from .evaluator import FIELDS

        allowed = {
            field
            for field, _ in FIELDS.values()
        }

        # Prepare the answer data.
        payload = {
            key: data.get(key, "")
            for key in allowed
        }

        # Ensure logic_steps is a list.
        logic_steps = data.get("logic_steps", [])

        payload["logic_steps"] = (
            logic_steps
            if isinstance(logic_steps, list)
            else []
        )

        # Save the student's attempt.
        attempt = ProblemAttempt.objects.create(
            student=request.user,
            problem=problem,
            scores=scores,
            total_score=total,
            feedback=feedback,
            **payload
        )

        serializer = ProblemAttemptSerializer(attempt)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class ReasoningProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = ProblemAttempt.objects.filter(
            student=request.user
        )

        skills = [
            "goal",
            "inputs",
            "outputs",
            "constraints",
            "decomposition",
            "pattern",
            "state",
            "decision",
            "verification",
            "transfer",
            "logical_sequencing"
        ]

        # Calculate the average score for each skill.
        profile = {}

        for skill in skills:
            values = [
                attempt.scores.get(skill, 0)
                for attempt in attempts
                if skill in attempt.scores
            ]

            profile[skill] = (
                round(sum(values) / len(values))
                if values
                else None
            )

        # Identify skills that need improvement.
        available_scores = [
            (skill, score)
            for skill, score in profile.items()
            if score is not None
        ]

        if available_scores:
            lowest_score = min(
                score for _, score in available_scores
            )

            # Select up to three skills with the lowest scores.
            weakest = [
                skill
                for skill, score in available_scores
                if score == lowest_score
            ][:3]

            # A perfect score means there are no weak areas.
            if lowest_score == 10:
                weakest = []
        else:
            weakest = []

        return Response({
            "attempt_count": attempts.count(),
            "skills": profile,
            "focus_areas": weakest
        })
