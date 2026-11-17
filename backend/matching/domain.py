"""Plain Python only: this layer must not import Django (ADR-0006)."""

from dataclasses import dataclass, field
from enum import Enum


# The possible states of a resume comparison
class MatchStatus(Enum):
    READY = 'Ready'
    QUEUED = 'Queued'
    PROCESSING = 'Processing'
    COMPLETED = 'Completed'
    FAILED = 'Failed'


# Shows how important a qualification is in the job posting
class QualificationPriority(Enum):
    REQUIRED = 'Required'
    PREFERRED = 'Preferred'
    UNSPECIFIED = 'Unspecified'


# A qualification taken from the job posting
@dataclass(frozen=True)
class Qualification:
    id: str
    title: str
    priority: QualificationPriority
    job_evidence: str


# A qualification found in both the resume and job posting
@dataclass(frozen=True)
class QualificationMatch:
    qualification: Qualification
    resume_evidence: str


# A qualification required by the job but missing from the resume
@dataclass(frozen=True)
class QualificationGap:
    qualification: Qualification
    reason: str


# The stored result of comparing one resume with one job posting
@dataclass(frozen=True)
class ComparisonResult:
    id: int | None
    owner_id: int
    resume_id: int
    job_posting_id: int
    status: MatchStatus
    matched_qualifications: list[QualificationMatch] = field(default_factory=list)
    qualification_gaps: list[QualificationGap] = field(default_factory=list)
    failure_reason: str = ''

    # A student can only access their own comparison
    def is_owned_by(self, student):
        return student is not None and self.owner_id == student.id