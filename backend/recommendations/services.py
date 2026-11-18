from .domain import RecommendationPreferences
from . import repository

# Get saved recommendation preferences for a student
def get_preferences(student_id):
    return repository.find_by_student_id(student_id)

# Save recommendation preferences for a student
def save_preferences(
        student_id,
        job_types=None,
        locations=None,
        industries=None,
        experience_levels=None,
):
    preferences = RecommendationPreferences(
        id=None,
        student_id=student_id,
        job_types=job_types or [],
        locations=locations or [],
        industries=industries or [],
        experience_levels=experience_levels or [],
    )
    preferences.validate()
    return repository.save(preferences)