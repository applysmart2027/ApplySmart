"""Plain Python only: this layer must not import Django (ADR-0006)."""

import re
from dataclasses import dataclass
from datetime import date
from enum import Enum
from urllib.parse import urlsplit

EMAIL = re.compile(r'[^\s@]+@[^\s@]+\.[^\s@]+')


class ApplicationStatus(Enum):
    SAVED = 'Saved'
    APPLIED = 'Applied'
    INTERVIEW = 'Interview'
    OFFER = 'Offer'
    REJECTED = 'Rejected'
    WITHDRAWN = 'Withdrawn'


@dataclass(frozen=True)
class Deadline:
    date: date


@dataclass(frozen=True)
class Contact:
    name: str
    email: str


@dataclass(frozen=True)
class ApplicationDraft:
    """The form as the student sent it. A blank optional field is an empty string, not None."""

    job_title: str
    employer: str
    posting_url: str
    status: str
    deadline: date | None
    resume_id: str
    resume_name: str
    notes: str
    contact_name: str
    contact_email: str


class ApplicationValidationError(Exception):
    def __init__(self, field_errors):
        super().__init__(field_errors)
        self.field_errors = field_errors


@dataclass(frozen=True)
class ApplicationRecord:
    id: int | None
    owner_id: int
    job_title: str
    employer: str
    posting_url: str
    # One of the ApplicationStatus values; validate() rejects anything else.
    status: str
    deadline: Deadline | None
    contact: Contact | None
    # Kept as the frontend sent them: resumes/ stores no resumes yet to look them up in.
    resume_id: str
    resume_name: str
    notes: str

    # Same rules and messages as the frontend's validation.ts. Change both together.
    def validate(self):
        errors = {}
        if not self.job_title.strip():
            errors['job_title'] = 'Enter the job title.'
        if not self.employer.strip():
            errors['employer'] = 'Enter the employer.'
        if self.posting_url:
            url = urlsplit(self.posting_url)
            if url.scheme not in ('http', 'https') or not url.netloc:
                errors['posting_url'] = (
                    'Enter a full web address starting with https://, or leave this blank.'
                )
        if self.status not in ApplicationStatus:
            errors['status'] = 'Choose one of the listed statuses.'
        if self.contact and self.contact.email and not EMAIL.fullmatch(self.contact.email):
            errors['contact_email'] = (
                'Enter an email address like name@example.com, or leave this blank.'
            )
        if errors:
            raise ApplicationValidationError(errors)
