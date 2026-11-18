from django.conf import settings
from django.db import models


# Store student recommendation preferences
class RecommendationPreferencesModel(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
    related_name = "recommendation_preferences",)

    job_types = models.JSONField(default=list, blank=True)
    locations = models.JSONField(default=list, blank=True)
    industries = models.JSONField(default=list, blank=True)
    experience_levels = models.JSONField(default=list, blank=True)

    updated_at = models.DateTimeField(auto_now=True)