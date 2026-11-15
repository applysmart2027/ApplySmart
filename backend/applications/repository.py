from dataclasses import replace

from .domain import ApplicationRecord, Contact, Deadline
from .models import ApplicationRecordModel


def save(record):
    row = _to_model(record)
    row.save()
    return replace(record, id=row.pk)


def list_for_owner(owner):
    rows = ApplicationRecordModel.objects.filter(owner_id=owner.id).order_by('id')
    return [_to_domain(row) for row in rows]


def _to_domain(row):
    has_contact = row.contact_name or row.contact_email
    return ApplicationRecord(
        id=row.pk,
        owner_id=row.owner_id,
        job_title=row.job_title,
        employer=row.employer,
        posting_url=row.posting_url,
        status=row.status,
        deadline=Deadline(row.deadline) if row.deadline else None,
        contact=Contact(row.contact_name, row.contact_email) if has_contact else None,
        resume_id=row.resume_id,
        resume_name=row.resume_name,
        notes=row.notes,
    )


def _to_model(record):
    return ApplicationRecordModel(
        id=record.id,
        owner_id=record.owner_id,
        job_title=record.job_title,
        employer=record.employer,
        posting_url=record.posting_url,
        status=record.status,
        deadline=record.deadline.date if record.deadline else None,
        contact_name=record.contact.name if record.contact else '',
        contact_email=record.contact.email if record.contact else '',
        notes=record.notes,
        resume_id=record.resume_id,
        resume_name=record.resume_name,
    )
