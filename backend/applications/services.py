from . import repository
from .domain import ApplicationRecord, Contact, Deadline


def create_application_record(student, draft):
    """Raises ApplicationValidationError, with one message per field, if a rule fails."""
    record = _build_record(student, draft)
    record.validate()
    return repository.save(record)


def list_application_records(student):
    return repository.list_for_owner(student)


def _build_record(student, draft):
    has_contact = draft.contact_name or draft.contact_email
    return ApplicationRecord(
        id=None,
        owner_id=student.id,
        job_title=draft.job_title,
        employer=draft.employer,
        posting_url=draft.posting_url,
        status=draft.status,
        deadline=Deadline(draft.deadline) if draft.deadline else None,
        contact=Contact(draft.contact_name, draft.contact_email) if has_contact else None,
        resume_id=draft.resume_id,
        resume_name=draft.resume_name,
        notes=draft.notes,
    )
