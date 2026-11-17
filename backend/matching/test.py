from django.test import SimpleTestCase

from .domain import (
    ComparisonResult,
    MatchStatus,
    Qualification,
    QualificationGap,
    QualificationMatch,
    QualificationPriority,
)


def comparison(**changes):
    fields = {
        'id': 1,
        'owner_id': 10,
        'resume_id': 2,
        'job_posting_id': 3,
        'status': MatchStatus.QUEUED,
    }
    return ComparisonResult(**(fields | changes))


class MatchingDomainTests(SimpleTestCase):
    def test_match_status_values_are_correct(self):
        self.assertEqual(MatchStatus.READY.value, 'Ready')
        self.assertEqual(MatchStatus.QUEUED.value, 'Queued')
        self.assertEqual(MatchStatus.PROCESSING.value, 'Processing')
        self.assertEqual(MatchStatus.COMPLETED.value, 'Completed')
        self.assertEqual(MatchStatus.FAILED.value, 'Failed')

    def test_qualification_priority_values_are_correct(self):
        self.assertEqual(QualificationPriority.REQUIRED.value, 'Required')
        self.assertEqual(QualificationPriority.PREFERRED.value, 'Preferred')
        self.assertEqual(QualificationPriority.UNSPECIFIED.value, 'Unspecified')

    def test_new_comparison_has_empty_results(self):
        result = comparison()

        self.assertEqual(result.matched_qualifications, [])
        self.assertEqual(result.qualification_gaps, [])
        self.assertEqual(result.failure_reason, '')

    def test_comparison_is_owned_by_the_correct_student(self):
        class Student:
            def __init__(self, student_id):
                self.id = student_id

        result = comparison(owner_id=10)

        self.assertTrue(result.is_owned_by(Student(10)))
        self.assertFalse(result.is_owned_by(Student(20)))
        self.assertFalse(result.is_owned_by(None))

    def test_completed_comparison_can_hold_matches_and_gaps(self):
        matched_qualification = Qualification(
            id='qual-1',
            title='AWS experience',
            priority=QualificationPriority.REQUIRED,
            job_evidence='AWS experience is required.',
        )

        missing_qualification = Qualification(
            id='qual-2',
            title='Terraform',
            priority=QualificationPriority.PREFERRED,
            job_evidence='Terraform experience is preferred.',
        )

        result = comparison(
            status=MatchStatus.COMPLETED,
            matched_qualifications=[
                QualificationMatch(
                    qualification=matched_qualification,
                    resume_evidence='Worked with AWS EC2 and Lambda.',
                )
            ],
            qualification_gaps=[
                QualificationGap(
                    qualification=missing_qualification,
                    reason='Terraform was not found in the resume.',
                )
            ],
        )

        self.assertEqual(result.status, MatchStatus.COMPLETED)
        self.assertEqual(
            result.matched_qualifications[0].qualification.title,
            'AWS experience',
        )
        self.assertEqual(
            result.qualification_gaps[0].qualification.title,
            'Terraform',
        )