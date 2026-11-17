from datetime import UTC, datetime

from . import repository
from .domain import (
    NAME_REQUIRED,
    RESUME_VERSION_LIMIT,
    ParseStatus,
    ResumeFile,
    ResumeLimitReachedError,
    ResumeValidationError,
    ResumeVersion,
    name_taken_message,
)
from .storage import default_storage


def upload_resume(student, upload, storage=None):
    """Stores the file and a new version marked Processing.

    Raises ResumeLimitReachedError (extension 1.a) or ResumeValidationError (extension 2.a, or a
    missing or repeated version name). Either way nothing is stored. Parsing is a later increment.
    """
    storage = storage or default_storage()
    if repository.count_for_owner(student) >= RESUME_VERSION_LIMIT:
        raise ResumeLimitReachedError()
    version_name = upload.version_name.strip()
    if not version_name:
        raise ResumeValidationError('version_name', NAME_REQUIRED)
    if repository.name_taken(student, version_name):
        raise ResumeValidationError('version_name', name_taken_message(version_name))

    file = ResumeFile.for_upload(upload)
    file.validate(upload.content)
    storage.save(file.storage_key, upload.content)
    version = ResumeVersion(
        id=None,
        owner_id=student.id,
        version_name=version_name,
        parse_status=ParseStatus.PROCESSING,
        is_primary=False,
        uploaded_at=datetime.now(UTC),
        file=file,
    )
    try:
        return repository.save(version)
    except Exception:
        # Without its version record nobody could ever reach the file, so don't keep it.
        storage.delete(file.storage_key)
        raise


def list_resume_versions(student):
    return repository.list_for_owner(student)
