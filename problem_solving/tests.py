from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Problem

class ProblemSolvingAPITests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="ps-test", password="Safe-test-pass-123")
        self.problem = Problem.objects.create(title="Largest", statement="Find max", pattern="running maximum", transfer_problem="Find top score")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_problem_list_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/problem-solving/problems/")
        self.assertEqual(response.status_code, 401)

    def test_student_can_submit_attempt_and_only_sees_own_history(self):
        response = self.client.post("/api/problem-solving/attempts/", {
            "problem": self.problem.id,
            "goal_answer": "Find the largest value",
            "inputs_answer": "A nonempty list of numbers",
            "outputs_answer": "The maximum number",
            "constraints_answer": "List contains at least one number",
            "decomposition_answer": "Initialize, inspect, compare, update, output",
            "pattern_answer": "Running maximum",
            "state_answer": "Remember maximum seen so far",
            "decision_answer": "Update if current value is greater",
            "verification_answer": "Test positive and negative numbers",
            "transfer_answer": "Apply same approach to student scores",
            "logic_steps": ["Initialize", "Loop", "Compare", "Update", "Output"]
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["problem"], self.problem.id)
        self.assertEqual(self.client.get("/api/problem-solving/attempts/").data[0]["id"], response.data["id"])
