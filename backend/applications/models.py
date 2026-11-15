from django.conf import settings
from django.db import models


# PostgreSQL gives VARCHAR no speed advantage over TEXT, so lengths aren't capped.
class ApplicationRecordModel(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    job_title = models.TextField()
    employer = models.TextField()
    posting_url = models.TextField(blank=True)
    status = models.TextField()
    deadline = models.DateField(null=True, blank=True)
    contact_name = models.TextField(blank=True)
    contact_email = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    resume_id = models.TextField(blank=True)
    resume_name = models.TextField(blank=True)
