"""Plain Python only: this layer must not import Django (ADR-0006)."""

from dataclasses import dataclass, field

class PreferenceValidaionError(Exception):
    """Raised when a preference is invalid."""
    pass

# Store student recommendation preferences
@dataclass
class RecommendationPreferences:
    id: int | None
    student_id: int
    job_types: list[str] = field(default_factory=list)
    locations: list[str] = field(default_factory=list)
    industries: list[str] = field(default_factory=list)
    experience_levels: list[str] = field(default_factory=list)

    # Validate preferences
    def validate(self):
        return True  # TODO: Implement validation logic

# Job posting from job api
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