from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts import services as accounts

from . import services
from .domain import (
    MAX_UPLOAD_BYTES,
    UNREADABLE,
    ResumeLimitReachedError,
    ResumeUpload,
    ResumeValidationError,
)

CHOOSE_A_FILE = 'Choose a PDF or DOCX file to upload.'

# The domain names fields in snake_case; the frontend's JSON uses camelCase.
JSON_FIELD = {'file': 'file', 'version_name': 'versionName'}


class ResumeVersionSerializer(serializers.Serializer):
    """Turns the multipart upload into a ResumeUpload, and a ResumeVersion into JSON."""

    file = serializers.FileField(
        error_messages={'required': CHOOSE_A_FILE, 'invalid': CHOOSE_A_FILE, 'empty': UNREADABLE}
    )
    versionName = serializers.CharField(allow_blank=True, default='')

    def to_upload(self):
        file = self.validated_data['file']
        return ResumeUpload(
            file_name=file.name,
            content_type=file.content_type or '',
            size_bytes=file.size,
            # Reading stops just past the limit, so an oversized file is never loaded whole.
            content=file.read(MAX_UPLOAD_BYTES + 1),
            version_name=self.validated_data['versionName'],
        )

    @staticmethod
    def to_json(version):
        return {
            'id': version.id,
            'versionName': version.version_name,
            'parseStatus': version.parse_status.value,
            'isPrimary': version.is_primary,
            'uploaded': timezone.localdate(version.uploaded_at).isoformat(),
            # Parsing is a later increment. Until then every version is on its first attempt,
            # has no failure and no parsed sections, in the shape the frontend expects.
            'parseAttempts': 1,
            'failureReason': '',
            'sections': {'Experience': [], 'Education': [], 'Projects': []},
        }


class ResumeVersionsView(APIView):
    def get(self, request):
        versions = services.list_resume_versions(accounts.current_student(request))
        return Response([ResumeVersionSerializer.to_json(version) for version in versions])

    def post(self, request):
        serializer = ResumeVersionSerializer(data=request.data)
        if not serializer.is_valid():
            first_messages = {field: messages[0] for field, messages in serializer.errors.items()}
            return Response(first_messages, status=status.HTTP_400_BAD_REQUEST)
        try:
            version = services.upload_resume(
                accounts.current_student(request), serializer.to_upload()
            )
        except ResumeLimitReachedError as error:
            return Response({'detail': str(error)}, status=status.HTTP_409_CONFLICT)
        except ResumeValidationError as error:
            return Response(
                {JSON_FIELD[error.field]: error.reason}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(ResumeVersionSerializer.to_json(version), status=status.HTTP_201_CREATED)
