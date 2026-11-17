from django.conf import settings
from django.db import models


# Stores one resume-to-job comparison for a student
class ComparisonModel(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    resume_id = models.TextField()
    job_posting_id = models.TextField()

    status = models.TextField()

    # Stores the completed matches and gaps as JSON
    result_data = models.JSONField(default=dict)

    # Empty unless the comparison fails
    failure_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)