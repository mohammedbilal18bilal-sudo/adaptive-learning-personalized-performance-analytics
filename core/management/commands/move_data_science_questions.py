from django.core.management.base import BaseCommand
from core.models import (
    Course,
    Lesson,
    StudentProgress,
    Assessment,
    Question,
    AssessmentAttempt,
)


class Command(BaseCommand):
    help = "Clean old demo data and configure the Data Science assessment"

    def handle(self, *args, **kwargs):

        # Remove old Python student progress
        StudentProgress.objects.filter(lesson_id=1).delete()

        # Remove old Python assessment attempt
        AssessmentAttempt.objects.filter(assessment_id=1).delete()

        # Data Science questions Q1-Q10
        questions = [
            {
                "id": 1,
                "question_text": "Which is numerical data?",
                "option_a": "Student name",
                "option_b": "Gender",
                "option_c": "Score",
                "option_d": "Department",
                "correct_option": "C",
            },
            {
                "id": 2,
                "question_text": "What should usually happen before analysis?",
                "option_a": "Data understanding and cleaning",
                "option_b": "Deleting the dataset",
                "option_c": "Changing all values to text",
                "option_d": "Removing all columns",
                "correct_option": "A",
            },
            {
                "id": 3,
                "question_text": "Which is a data-quality problem?",
                "option_a": "Missing values",
                "option_b": "Clean data",
                "option_c": "Correct values",
                "option_d": "Organized data",
                "correct_option": "A",
            },
            {
                "id": 4,
                "question_text": "Why standardize category labels?",
                "option_a": "To increase the number of rows",
                "option_b": "To treat equivalent labels consistently",
                "option_c": "To remove all categories",
                "option_d": "To convert categories into dates",
                "correct_option": "B",
            },
            {
                "id": 5,
                "question_text": "Which chart shows a trend over time?",
                "option_a": "Line chart",
                "option_b": "Histogram",
                "option_c": "Scatter plot",
                "option_d": "Box plot",
                "correct_option": "A",
            },
            {
                "id": 6,
                "question_text": "Which statistic represents the arithmetic average?",
                "option_a": "Mean",
                "option_b": "Median",
                "option_c": "Mode",
                "option_d": "Range",
                "correct_option": "A",
            },
            {
                "id": 7,
                "question_text": "What does correlation measure?",
                "option_a": "Data size",
                "option_b": "Association",
                "option_c": "Data cleaning",
                "option_d": "Data storage",
                "correct_option": "B",
            },
            {
                "id": 8,
                "question_text": "What is feature selection?",
                "option_a": "Choosing relevant input variables",
                "option_b": "Deleting all input variables",
                "option_c": "Changing numerical values to text",
                "option_d": "Sorting the dataset",
                "correct_option": "A",
            },
            {
                "id": 9,
                "question_text": "Which library is common for tabular Python analysis?",
                "option_a": "pandas",
                "option_b": "Django",
                "option_c": "Flask",
                "option_d": "TensorFlow",
                "correct_option": "A",
            },
            {
                "id": 10,
                "question_text": "Which is a dashboard metric?",
                "option_a": "Completion rate",
                "option_b": "Python version",
                "option_c": "File name",
                "option_d": "Column name",
                "correct_option": "A",
            },
        ]

        # Make Assessment 1 the Data Science assessment
        Assessment.objects.filter(id=1).update(
            title="Data Science Fundamentals Assessment",
            description="Assessment covering all five lessons of Data Science Fundamentals.",
            total_marks=10,
            duration_minutes=30,
            course_id=4,
        )

        # Create/update Questions 1-10
        for data in questions:
            question_id = data.pop("id")

            Question.objects.update_or_create(
                id=question_id,
                defaults={
                    **data,
                    "marks": 1,
                    "difficulty": 1,
                    "assessment_id": 1,
                },
            )

        # Remove Question 11
        Question.objects.filter(id=11).delete()

        # Remove duplicate Data Science Assessment 2
        Assessment.objects.filter(id=2).delete()

        # Remove old Python lesson
        Lesson.objects.filter(id=1).delete()

        # Remove old Python courses
        Course.objects.filter(id__in=[1, 2, 3]).delete()

        self.stdout.write(
            self.style.SUCCESS(
                "Cleanup complete. Assessment 1 now contains exactly "
                "10 Data Science questions (Q1-Q10)."
            )
        )
