from dataclasses import replace

from .domain import (
    ComparisonResult,
    MatchStatus,
    Qualification,
    QualificationGap,
    QualificationMatch,
    QualificationPriority,
)
from .models import ComparisonModel


# Saves a new comparison waiting to be processed
def save_queued_comparison(result):
    row = ComparisonModel.objects.create(
        owner_id=result.owner_id,
        resume_id=result.resume_id,
        job_posting_id=result.job_posting_id,
        status=MatchStatus.QUEUED.value,
        result_data={},
        failure_reason='',
    )

    return replace(
        result,
        id=row.pk,
        status=MatchStatus.QUEUED,
    )


# Finds a comparison belonging to the signed-in student
def find_by_id(student, comparison_id):
    try:
        row = ComparisonModel.objects.get(
            pk=comparison_id,
            owner_id=student.id,
        )
    except ComparisonModel.DoesNotExist:
        return None

    return _to_domain(row)


# Finds a comparison for background processing
def find_by_id_for_processing(comparison_id):
    try:
        row = ComparisonModel.objects.get(pk=comparison_id)
    except ComparisonModel.DoesNotExist:
        return None

    return _to_domain(row)


# Marks a comparison as being processed
def save_processing(result):
    row = ComparisonModel.objects.get(pk=result.id)

    row.status = MatchStatus.PROCESSING.value
    row.save(update_fields=['status', 'updated_at'])

    return replace(
        result,
        status=MatchStatus.PROCESSING,
    )


# Saves completed matches and gaps
def save_completed_result(result):
    row = ComparisonModel.objects.get(pk=result.id)

    row.status = MatchStatus.COMPLETED.value
    row.result_data = _result_to_json(result)
    row.failure_reason = ''

    row.save(
        update_fields=[
            'status',
            'result_data',
            'failure_reason',
            'updated_at',
        ]
    )

    return replace(
        result,
        status=MatchStatus.COMPLETED,
    )


# Saves a failed comparison
def save_failed_result(result):
    row = ComparisonModel.objects.get(pk=result.id)

    row.status = MatchStatus.FAILED.value
    row.failure_reason = result.failure_reason

    row.save(
        update_fields=[
            'status',
            'failure_reason',
            'updated_at',
        ]
    )

    return replace(
        result,
        status=MatchStatus.FAILED,
    )


# Converts a database row into a domain object
def _to_domain(row):
    matches = [
        _match_from_json(item)
        for item in row.result_data.get('matchedQualifications', [])
    ]

    gaps = [
        _gap_from_json(item)
        for item in row.result_data.get('qualificationGaps', [])
    ]

    return ComparisonResult(
        id=row.pk,
        owner_id=row.owner_id,
        resume_id=row.resume_id,
        job_posting_id=row.job_posting_id,
        status=MatchStatus(row.status),
        matched_qualifications=matches,
        qualification_gaps=gaps,
        failure_reason=row.failure_reason,
    )


# Converts completed results into JSON for PostgreSQL
def _result_to_json(result):
    return {
        'matchedQualifications': [
            _match_to_json(match)
            for match in result.matched_qualifications
        ],
        'qualificationGaps': [
            _gap_to_json(gap)
            for gap in result.qualification_gaps
        ],
    }


def _qualification_to_json(qualification):
    return {
        'id': qualification.id,
        'title': qualification.title,
        'priority': qualification.priority.value,
        'jobEvidence': qualification.job_evidence,
    }


def _qualification_from_json(data):
    return Qualification(
        id=data['id'],
        title=data['title'],
        priority=QualificationPriority(data['priority']),
        job_evidence=data['jobEvidence'],
    )


def _match_to_json(match):
    return {
        'qualification': _qualification_to_json(match.qualification),
        'resumeEvidence': match.resume_evidence,
    }


def _match_from_json(data):
    return QualificationMatch(
        qualification=_qualification_from_json(data['qualification']),
        resume_evidence=data['resumeEvidence'],
    )


def _gap_to_json(gap):
    return {
        'qualification': _qualification_to_json(gap.qualification),
        'reason': gap.reason,
    }


def _gap_from_json(data):
    return QualificationGap(
        qualification=_qualification_from_json(data['qualification']),
        reason=data['reason'],
    )