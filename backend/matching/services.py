from resumes import services as resume_services

from . import repository
from .domain import ComparisonResult, MatchStatus


class ComparisonValidationError(Exception):
    def __init__(self, field_errors):
        super().__init__(field_errors)
        self.field_errors = field_errors


class ComparisonNotFoundError(Exception):
    pass


# Checks whether the selected resume belongs to the student
def student_has_resume(student, resume_id):
    resumes = resume_services.list_resume_versions(student)

    return any(
        str(resume.id) == str(resume_id)
        for resume in resumes
    )


# Creates a queued comparison and sends it to the local worker
def create_comparison(
    student,
    resume_id,
    job_posting_id,
    simulate_failure=False,
    enqueue=None,
):
    errors = {}

    if not resume_id.strip():
        errors['resumeId'] = 'Choose a resume to compare.'

    if not job_posting_id.strip():
        errors['jobPostingId'] = 'Choose a job posting to compare.'

    if (
        resume_id.strip()
        and not student_has_resume(student, resume_id)
    ):
        errors['resumeId'] = 'Choose one of your resumes to compare.'

    if errors:
        raise ComparisonValidationError(errors)

    result = ComparisonResult(
        id=None,
        owner_id=student.id,
        resume_id=resume_id,
        job_posting_id=job_posting_id,
        status=MatchStatus.READY,
    )

    saved = repository.save_queued_comparison(result)

    # Tests can provide a fake queue.
    # Normal requests use the real local worker.
    if enqueue is None:
        from .worker import enqueue_comparison

        enqueue = enqueue_comparison

    enqueue(saved.id, simulate_failure)

    return saved


# Gets one comparison only when it belongs to the student
def get_comparison_result(student, comparison_id):
    result = repository.find_by_id(
        student,
        comparison_id,
    )

    if result is None:
        raise ComparisonNotFoundError()

    return result


# Retries a failed comparison using the same selections
def retry_comparison(
    student,
    comparison_id,
    enqueue=None,
):
    previous = get_comparison_result(
        student,
        comparison_id,
    )

    if previous.status != MatchStatus.FAILED:
        return previous

    return create_comparison(
        student=student,
        resume_id=previous.resume_id,
        job_posting_id=previous.job_posting_id,
        simulate_failure=False,
        enqueue=enqueue,
    )