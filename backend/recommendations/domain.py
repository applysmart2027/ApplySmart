"""Plain Python only: this layer must not import Django (ADR-0006)."""

from dataclass import dataclass, field

class PreferenceValidaionError(Exception):
    """Raised when a preference is invalid."""
    pass

@dataclass
class RecommendationPreferences:
    id: int | None
    student_id: int
    job_types: list[str] = field(default_factory=list)
    locations: list[str] = field(default_factory=list)
    industries: list[str] = field(default_factory=list)
    experience_levels: list[str] = field(default_factory=list)

    def validate(self):
        errors = {}
        if not any([self.job_types, self.locations, self.industries, self.experience_levels]):
            errors['preferences'] = 'At least one preference must be selected.'
        if errors:
            raise PreferenceValidationError(errors)

@dataclass
class JobPosting:
    id: int
    title: str
    company: str
    location: str
    job_type: str
    industry: str
    experience_level: str
    description: str
    url: str