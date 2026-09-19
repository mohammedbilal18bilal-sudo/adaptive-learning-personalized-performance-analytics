from django.contrib import admin

from .models import (
    Course,
    Lesson,
    StudentProgress,
    UserProfile,
    Assessment,
    Question,
)


admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(StudentProgress)
admin.site.register(UserProfile)
admin.site.register(Assessment)
admin.site.register(Question)