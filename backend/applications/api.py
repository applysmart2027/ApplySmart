from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts import services as accounts

from . import services
from .domain import ApplicationDraft, ApplicationValidationError


def optional_text(source=None):
    return serializers.CharField(source=source, allow_blank=True, default='')


class OptionalDateField(serializers.DateField):
    # The form sends '' for no deadline, which DRF's DateField rejects as a bad format.
    def to_internal_value(self, value):
        return None if value == '' else super().to_internal_value(value)


class ApplicationRecordSerializer(serializers.Serializer):
    """Maps between the frontend's camelCase JSON and the domain objects."""

    jobTitle = optional_text(source='job_title')
    employer = optional_text()
    postingUrl = optional_text(source='posting_url')
    status = optional_text()
    deadline = OptionalDateField(default=None)
    resumeId = optional_text(source='resume_id')
    resumeName = optional_text(source='resume_name')
    notes = optional_text()
    contactName = optional_text(source='contact_name')
    contactEmail = optional_text(source='contact_email')

    def to_draft(self):
        return ApplicationDraft(**self.validated_data)

    def json_errors(self, field_errors):
        """Keys the domain's errors by JSON name so the form shows each beside its field."""
        json_name = {field.source: name for name, field in self.fields.items()}
        return {json_name[field]: message for field, message in field_errors.items()}

    @staticmethod
    def to_json(record):
        return {
            'id': record.id,
            'jobTitle': record.job_title,
            'employer': record.employer,
            'postingUrl': record.posting_url,
            'status': record.status,
            'deadline': record.deadline.isoformat() if record.deadline else '',
            'resumeId': record.resume_id,
            'resumeName': record.resume_name,
            'notes': record.notes,
            'contactName': record.contact.name,
            'contactEmail': record.contact.email,
        }


class ApplicationRecordsView(APIView):
    def get(self, request):
        records = services.list_application_records(accounts.current_student(request))
        return Response([ApplicationRecordSerializer.to_json(record) for record in records])

    def post(self, request):
        serializer = ApplicationRecordSerializer(data=request.data)
        if not serializer.is_valid():
            first_messages = {field: messages[0] for field, messages in serializer.errors.items()}
            return Response(first_messages, status=status.HTTP_400_BAD_REQUEST)
        try:
            record = services.create_application_record(
                accounts.current_student(request), serializer.to_draft()
            )
        except ApplicationValidationError as error:
            return Response(
                serializer.json_errors(error.field_errors), status=status.HTTP_400_BAD_REQUEST
            )
        return Response(ApplicationRecordSerializer.to_json(record), status=status.HTTP_201_CREATED)
