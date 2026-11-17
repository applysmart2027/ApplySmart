from django.conf import settings
from django.db import models


# PostgreSQL gives VARCHAR no speed advantage over TEXT, so lengths aren't capped.
class ResumeVersionModel(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    version_name = models.TextField()
    parse_status = models.TextField()
    is_primary = models.BooleanField(default=False)
    file_name = models.TextField()
    file_type = models.TextField()
    size_bytes = models.PositiveIntegerField()
    storage_key = models.TextField(unique=True)
    uploaded_at = models.DateTimeField()
