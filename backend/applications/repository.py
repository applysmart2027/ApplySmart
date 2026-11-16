from dataclasses import replace

from .domain import ApplicationRecord, Contact
from .models import ApplicationRecordModel


def save(record):
    row = _to_model(record)
    row.save()
    return replace(record, id=row.pk)


def list_for_owner(owner):
    rows = ApplicationRecordModel.objects.filter(owner_id=owner.id).order_by('id')
    return [_to_domain(row) for row in rows]


def _to_domain(row):
    return ApplicationRecord(
        id=row.pk,
        owner_id=row.owner_id,
        job_title=row.job_title,
        employer=row.employer,
        posting_url=row.posting_url,
        status=row.status,
        deadline=row.deadline,
        contact=Contact(row.contact_name, row.contact_email),
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
        deadline=record.deadline,
        contact_name=record.contact.name,
        contact_email=record.contact.email,
        notes=record.notes,
        resume_id=record.resume_id,
        resume_name=record.resume_name,
    )
