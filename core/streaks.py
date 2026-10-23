```python
from datetime import timedelta

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserActivity
from .permissions import get_user_role


def record_user_activity(user, activity_type):
    if not user or not user.is_authenticated:
        return

    UserActivity.objects.get_or_create(
        user=user,
        activity_date=timezone.localdate(),
        activity_type=activity_type,
    )


def record_student_activity(user, activity_type):
    if get_user_role(user) != "student":
        return

    record_user_activity(user, activity_type)


def record_faculty_activity(user, activity_type):
    if get_user_role(user) not in ("faculty", "admin"):
        return

    record_user_activity(user, activity_type)


def calculate_user_streak(user):
    today = timezone.localdate()

    activity_dates = list(
        UserActivity.objects.filter(user=user)
        .values_list("activity_date", flat=True)
        .distinct()
        .order_by("activity_date")
    )

    date_set = set(activity_dates)

    active_today = today in date_set
    last_activity_date = activity_dates[-1] if activity_dates else None

    # Calculate the longest streak.
    longest_streak = 0
    running_streak = 0
    previous_date = None

    for activity_date in activity_dates:
        if (
            previous_date is not None
            and activity_date == previous_date + timedelta(days=1)
        ):
            running_streak += 1
        else:
            running_streak = 1

        longest_streak = max(longest_streak, running_streak)
        previous_date = activity_date

    # Calculate the current streak.
    current_streak = 0

    if (
        last_activity_date is not None
        and last_activity_date >= today - timedelta(days=1)
    ):
        current_date = last_activity_date

        while current_date in date_set:
            current_streak += 1
            current_date -= timedelta(days=1)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "active_today": active_today,
        "last_activity_date": (
            last_activity_date.isoformat()
            if last_activity_date
            else None
        ),
    }


class UserStreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)
        streak_data = calculate_user_streak(request.user)

        return Response(
            {
                "username": request.user.username,
                "role": role,
                **streak_data,
            }
        )
```
