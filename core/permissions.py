from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import UserProfile


# ============================================================
# GET AUTHENTICATED USER ROLE
# ============================================================

def get_user_role(user):
    """
    Retrieve the user's application role from UserProfile.

    Superusers are treated as administrators.
    Users without a profile default to student.
    """

    if not user or not user.is_authenticated:
        return ""

    if user.is_superuser:
        return "admin"

    role = UserProfile.objects.filter(
        user=user
    ).values_list(
        "role",
        flat=True,
    ).first()

    if role:
        return str(role).strip().lower()

    return "student"


# ============================================================
# STUDENT PERMISSION
# ============================================================

class IsStudent(BasePermission):
    """
    Allow access only to authenticated students.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and get_user_role(request.user) == "student"
        )


# ============================================================
# FACULTY PERMISSION
# ============================================================

class IsFaculty(BasePermission):
    """
    Allow access only to authenticated faculty members.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and get_user_role(request.user) == "faculty"
        )


# ============================================================
# ADMIN PERMISSION
# ============================================================

class IsAdmin(BasePermission):
    """
    Allow access to application administrators
    and Django superusers.
    """

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and get_user_role(request.user) == "admin"
        )


# ============================================================
# FACULTY OR ADMIN WRITE PERMISSION
# ============================================================

class IsFacultyOrReadOnly(BasePermission):
    """
    All authenticated users may read.

    Only faculty and administrators may create,
    update, or delete courses, lessons, and assessments.
    """

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return get_user_role(request.user) in (
            "faculty",
            "admin",
        )


# ============================================================
# ADMIN WRITE PERMISSION
# ============================================================

class IsAdminOrReadOnly(BasePermission):
    """
    Authenticated users may read.

    Only administrators may create, update,
    or delete user profiles and role assignments.
    """

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return get_user_role(request.user) == "admin"
