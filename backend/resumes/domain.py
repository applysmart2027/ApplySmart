"""Plain Python only: this layer must not import Django (ADR-0006)."""

import io
import zipfile
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import uuid4

RESUME_VERSION_LIMIT = 10
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_FILE_TYPES = ('pdf', 'docx')

# Same wording as the frontend's uploadValidation.ts. Change both together.
NOT_PDF_OR_DOCX = 'This file is not a PDF or DOCX. Choose a different file.'
TOO_LARGE = 'This file is larger than 5 MB. Choose a smaller file.'
UNREADABLE = 'This file could not be read. Check that it opens, then choose it again.'
NAME_REQUIRED = 'Enter a version name.'
LIMIT_REACHED = (
    f'You already have {RESUME_VERSION_LIMIT} resume versions. '
    'Delete a version in My Resumes to upload another.'
)


def name_taken_message(name):
    return f'You already have a version named “{name}”.'


class ParseStatus(Enum):
    PROCESSING = 'Processing'
    NEEDS_REVIEW = 'Needs review'
    CONFIRMED = 'Confirmed'
    FAILED = 'Failed'


class ResumeValidationError(Exception):
    """The upload breaks a rule. field is 'file' or 'version_name'; nothing has been stored."""

    def __init__(self, field, reason):
        super().__init__(reason)
        self.field = field
        self.reason = reason


class ResumeLimitReachedError(Exception):
    def __init__(self, limit=RESUME_VERSION_LIMIT):
        super().__init__(LIMIT_REACHED)
        self.limit = limit


@dataclass(frozen=True)
class ResumeUpload:
    """The upload as the request carried it. content stops just past MAX_UPLOAD_BYTES."""

    file_name: str
    content_type: str
    size_bytes: int
    content: bytes
    version_name: str


@dataclass(frozen=True)
class ResumeFile:
    file_name: str  # as the student named it; shown to them, never used as a path
    file_type: str  # the lower-case extension, without the dot
    size_bytes: int
    storage_key: str  # where FileStorage keeps the bytes

    @classmethod
    def for_upload(cls, upload):
        extension = upload.file_name.rpartition('.')[2].lower() if '.' in upload.file_name else ''
        # A random key: the student's file name never reaches the file system.
        return cls(upload.file_name, extension, upload.size_bytes, f'{uuid4().hex}.{extension}')

    def validate(self, content):
        """Raises ResumeValidationError for use case extension 2.a."""
        if self.file_type not in ALLOWED_FILE_TYPES:
            raise ResumeValidationError('file', NOT_PDF_OR_DOCX)
        if self.size_bytes > MAX_UPLOAD_BYTES:
            raise ResumeValidationError('file', TOO_LARGE)
        # The extension is only the student's claim; the content must match it.
        readable = _is_pdf(content) if self.file_type == 'pdf' else _is_docx(content)
        if not readable:
            raise ResumeValidationError('file', UNREADABLE)


@dataclass(frozen=True)
class ResumeVersion:
    id: int | None
    owner_id: int
    version_name: str
    parse_status: ParseStatus
    is_primary: bool
    uploaded_at: datetime
    file: ResumeFile

    def is_owned_by(self, student):
        return student is not None and self.owner_id == student.id


def _is_pdf(content):
    return content.startswith(b'%PDF-')


def _is_docx(content):
    # A DOCX file is a zip package whose main part is word/document.xml.
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as package:
            return 'word/document.xml' in package.namelist()
    except zipfile.BadZipFile:
        return False
