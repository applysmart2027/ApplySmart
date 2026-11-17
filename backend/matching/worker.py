from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace

from django.db import close_old_connections

from . import repository
from .domain import (
    MatchStatus,
    Qualification,
    QualificationGap,
    QualificationMatch,
    QualificationPriority,
)


# One local worker processes comparison jobs in order.
# Amazon SQS is outside this release.
_executor = ThreadPoolExecutor(
    max_workers=1,
    thread_name_prefix='matching-worker',
)


# Adds a comparison to the local background queue
def enqueue_comparison(comparison_id, simulate_failure=False):
    _executor.submit(
        _run_in_background,
        comparison_id,
        simulate_failure,
    )


# Gives the worker thread its own clean database connection
def _run_in_background(comparison_id, simulate_failure):
    close_old_connections()

    try:
        process_comparison(
            comparison_id,
            simulate_failure,
        )
    finally:
        close_old_connections()


# Processes one queued comparison
def process_comparison(comparison_id, simulate_failure=False):
    result = repository.find_by_id_for_processing(comparison_id)

    if result is None:
        return

    processing = repository.save_processing(result)

    try:
        if simulate_failure:
            raise RuntimeError('Simulated comparison failure.')

        completed = _build_first_result(processing)
        repository.save_completed_result(completed)

    except Exception:
        failed = replace(
            processing,
            status=MatchStatus.FAILED,
            failure_reason='Comparison could not be completed.',
        )

        repository.save_failed_result(failed)


# Creates the first release's deterministic comparison result.
# NLP and similarity scoring are outside SCRUM-325.
def _build_first_result(result):
    aws = Qualification(
        id='qual-1',
        title='AWS experience',
        priority=QualificationPriority.REQUIRED,
        job_evidence='Experience with AWS cloud services is required.',
    )

    python = Qualification(
        id='qual-2',
        title='Python',
        priority=QualificationPriority.REQUIRED,
        job_evidence='Experience programming with Python.',
    )

    git = Qualification(
        id='qual-3',
        title='Git and GitHub',
        priority=QualificationPriority.PREFERRED,
        job_evidence='Experience using Git-based version control is preferred.',
    )

    kubernetes = Qualification(
        id='qual-4',
        title='Kubernetes',
        priority=QualificationPriority.REQUIRED,
        job_evidence='Experience deploying containerized applications with Kubernetes.',
    )

    terraform = Qualification(
        id='qual-5',
        title='Terraform',
        priority=QualificationPriority.PREFERRED,
        job_evidence='Infrastructure as code experience using Terraform is preferred.',
    )

    return replace(
        result,
        status=MatchStatus.COMPLETED,
        matched_qualifications=[
            QualificationMatch(
                qualification=aws,
                resume_evidence='Built cloud projects using AWS services including Lambda and EC2.',
            ),
            QualificationMatch(
                qualification=python,
                resume_evidence='Used Python for automation and cloud development projects.',
            ),
            QualificationMatch(
                qualification=git,
                resume_evidence='Used Git and GitHub for coursework and team development projects.',
            ),
        ],
        qualification_gaps=[
            QualificationGap(
                qualification=kubernetes,
                reason='No Kubernetes experience was identified in the selected resume.',
            ),
            QualificationGap(
                qualification=terraform,
                reason='No Terraform experience was identified in the selected resume.',
            ),
        ],
        failure_reason='',
    )