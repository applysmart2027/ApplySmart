from django.contrib.auth.models import User
from django.test import SimpleTestCase, TestCase

from . import repository, services, worker
from .domain import (
    ComparisonResult,
    MatchStatus,
    Qualification,
    QualificationGap,
    QualificationMatch,
    QualificationPriority,
)
from .models import ComparisonModel


def comparison(**changes):
    fields = {
        'id': 1,
        'owner_id': 10,
        'resume_id': '2',
        'job_posting_id': '3',
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


class ComparisonModelTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            'maya.okafor',
            password='demo-pass',
        )

    def test_comparison_can_be_saved_and_loaded(self):
        saved = ComparisonModel.objects.create(
            owner=self.student,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.QUEUED.value,
            result_data={},
            failure_reason='',
        )

        loaded = ComparisonModel.objects.get(pk=saved.pk)

        self.assertEqual(loaded.owner, self.student)
        self.assertEqual(loaded.resume_id, '2')
        self.assertEqual(loaded.job_posting_id, 'job-1')
        self.assertEqual(loaded.status, 'Queued')
        self.assertEqual(loaded.result_data, {})
        self.assertEqual(loaded.failure_reason, '')
        self.assertIsNotNone(loaded.created_at)
        self.assertIsNotNone(loaded.updated_at)


class ComparisonRepositoryTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            'maya.okafor',
            password='demo-pass',
        )

    def test_queued_comparison_can_be_saved_and_found(self):
        result = ComparisonResult(
            id=None,
            owner_id=self.student.id,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.READY,
        )

        saved = repository.save_queued_comparison(result)
        found = repository.find_by_id(self.student, saved.id)

        self.assertIsNotNone(saved.id)
        self.assertEqual(saved.status, MatchStatus.QUEUED)
        self.assertEqual(found.id, saved.id)
        self.assertEqual(found.resume_id, '2')
        self.assertEqual(found.job_posting_id, 'job-1')

    def test_student_cannot_find_another_students_comparison(self):
        other_student = User.objects.create_user(
            'daniel.reyes',
            password='demo-pass',
        )

        result = ComparisonResult(
            id=None,
            owner_id=self.student.id,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.READY,
        )

        saved = repository.save_queued_comparison(result)

        self.assertIsNone(
            repository.find_by_id(other_student, saved.id)
        )

    def test_comparison_can_move_to_processing(self):
        result = repository.save_queued_comparison(
            ComparisonResult(
                id=None,
                owner_id=self.student.id,
                resume_id='2',
                job_posting_id='job-1',
                status=MatchStatus.READY,
            )
        )

        updated = repository.save_processing(result)

        self.assertEqual(updated.status, MatchStatus.PROCESSING)
        self.assertEqual(
            ComparisonModel.objects.get(pk=result.id).status,
            'Processing',
        )

    def test_completed_result_round_trips_through_database(self):
        result = repository.save_queued_comparison(
            ComparisonResult(
                id=None,
                owner_id=self.student.id,
                resume_id='2',
                job_posting_id='job-1',
                status=MatchStatus.READY,
            )
        )

        qualification = Qualification(
            id='qual-1',
            title='AWS experience',
            priority=QualificationPriority.REQUIRED,
            job_evidence='AWS experience is required.',
        )

        completed = ComparisonResult(
            id=result.id,
            owner_id=self.student.id,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.COMPLETED,
            matched_qualifications=[
                QualificationMatch(
                    qualification=qualification,
                    resume_evidence='Used AWS EC2 and Lambda.',
                )
            ],
        )

        repository.save_completed_result(completed)
        loaded = repository.find_by_id(self.student, result.id)

        self.assertEqual(loaded.status, MatchStatus.COMPLETED)
        self.assertEqual(
            loaded.matched_qualifications[0].qualification.title,
            'AWS experience',
        )
        self.assertEqual(
            loaded.matched_qualifications[0].resume_evidence,
            'Used AWS EC2 and Lambda.',
        )

    def test_failed_result_stores_failure_reason(self):
        result = repository.save_queued_comparison(
            ComparisonResult(
                id=None,
                owner_id=self.student.id,
                resume_id='2',
                job_posting_id='job-1',
                status=MatchStatus.READY,
            )
        )

        failed = ComparisonResult(
            id=result.id,
            owner_id=self.student.id,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.FAILED,
            failure_reason='Comparison could not be completed.',
        )

        repository.save_failed_result(failed)
        loaded = repository.find_by_id(self.student, result.id)

        self.assertEqual(loaded.status, MatchStatus.FAILED)
        self.assertEqual(
            loaded.failure_reason,
            'Comparison could not be completed.',
        )
class ComparisonServiceTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            'maya.okafor',
            password='demo-pass',
        )

    def test_create_comparison_saves_and_queues_request(self):
        queued = []

        result = services.create_comparison(
            student=self.student,
            resume_id='2',
            job_posting_id='job-1',
            enqueue=lambda comparison_id, simulate_failure: queued.append(
                (comparison_id, simulate_failure)
            ),
        )

        self.assertEqual(result.status, MatchStatus.QUEUED)
        self.assertIsNotNone(result.id)
        self.assertEqual(queued, [(result.id, False)])

    def test_missing_selections_are_rejected(self):
        with self.assertRaises(services.ComparisonValidationError) as caught:
            services.create_comparison(
                student=self.student,
                resume_id='',
                job_posting_id='',
                enqueue=lambda *_: None,
            )

        self.assertEqual(
            caught.exception.field_errors,
            {
                'resumeId': 'Choose a resume to compare.',
                'jobPostingId': 'Choose a job posting to compare.',
            },
        )

    def test_student_cannot_get_another_students_comparison(self):
        other_student = User.objects.create_user(
            'daniel.reyes',
            password='demo-pass',
        )

        result = services.create_comparison(
            student=self.student,
            resume_id='2',
            job_posting_id='job-1',
            enqueue=lambda *_: None,
        )

        with self.assertRaises(services.ComparisonNotFoundError):
            services.get_comparison_result(
                other_student,
                result.id,
            )

    def test_student_can_get_their_own_comparison(self):
        result = services.create_comparison(
            student=self.student,
            resume_id='2',
            job_posting_id='job-1',
            enqueue=lambda *_: None,
        )

        found = services.get_comparison_result(
            self.student,
            result.id,
        )

        self.assertEqual(found.id, result.id)
        self.assertEqual(found.status, MatchStatus.QUEUED)

    def test_failed_comparison_can_be_retried(self):
        original = services.create_comparison(
            student=self.student,
            resume_id='2',
            job_posting_id='job-1',
            enqueue=lambda *_: None,
        )

        failed = ComparisonResult(
            id=original.id,
            owner_id=self.student.id,
            resume_id='2',
            job_posting_id='job-1',
            status=MatchStatus.FAILED,
            failure_reason='Comparison could not be completed.',
        )

        repository.save_failed_result(failed)

        queued = []

        retried = services.retry_comparison(
            student=self.student,
            comparison_id=original.id,
            enqueue=lambda comparison_id, simulate_failure: queued.append(
                (comparison_id, simulate_failure)
            ),
        )

        self.assertNotEqual(retried.id, original.id)
        self.assertEqual(retried.status, MatchStatus.QUEUED)
        self.assertEqual(queued, [(retried.id, False)])

class ComparisonWorkerTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            'maya.okafor',
            password='demo-pass',
        )

    def queued_comparison(self):
        return repository.save_queued_comparison(
            ComparisonResult(
                id=None,
                owner_id=self.student.id,
                resume_id='2',
                job_posting_id='job-1',
                status=MatchStatus.READY,
            )
        )

    def test_worker_completes_comparison_and_stores_result(self):
        result = self.queued_comparison()

        worker.process_comparison(result.id)

        loaded = repository.find_by_id(
            self.student,
            result.id,
        )

        self.assertEqual(
            loaded.status,
            MatchStatus.COMPLETED,
        )

        self.assertEqual(
            len(loaded.matched_qualifications),
            3,
        )

        self.assertEqual(
            len(loaded.qualification_gaps),
            2,
        )

        self.assertEqual(
            loaded.matched_qualifications[0].qualification.title,
            'AWS experience',
        )

        self.assertEqual(
            loaded.qualification_gaps[0].qualification.title,
            'Kubernetes',
        )

    def test_worker_stores_failed_comparison(self):
        result = self.queued_comparison()

        worker.process_comparison(
            result.id,
            simulate_failure=True,
        )

        loaded = repository.find_by_id(
            self.student,
            result.id,
        )

        self.assertEqual(
            loaded.status,
            MatchStatus.FAILED,
        )

        self.assertEqual(
            loaded.failure_reason,
            'Comparison could not be completed.',
        )

    def test_worker_ignores_missing_comparison(self):
        worker.process_comparison(999999)

        self.assertEqual(
            ComparisonModel.objects.count(),
            0,
        )