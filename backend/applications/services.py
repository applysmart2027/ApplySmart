from . import repository
from .domain import ApplicationRecord, Contact


def create_application_record(student, draft):
    """Raises ApplicationValidationError, with one message per field, if a rule fails."""
    record = _build_record(student, draft)
    record.validate()
    return repository.save(record)


def list_application_records(student):
    return repository.list_for_owner(student)


def _build_record(student, draft):
    return ApplicationRecord(
        id=None,
        owner_id=student.id,
        job_title=draft.job_title,
        employer=draft.employer,
        posting_url=draft.posting_url,
        status=draft.status,
        deadline=draft.deadline,
        contact=Contact(draft.contact_name, draft.contact_email),
        resume_id=draft.resume_id,
        resume_name=draft.resume_name,
        notes=draft.notes,
    )
