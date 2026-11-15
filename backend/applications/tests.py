from datetime import date

from django.contrib.auth.models import User
from django.test import SimpleTestCase, TestCase

from .domain import ApplicationRecord, ApplicationValidationError, Contact


def record(**changes):
    fields = {
        'id': None,
        'owner_id': 1,
        'job_title': 'Junior Cloud Developer',
        'employer': 'Northwind Logistics',
        'posting_url': 'https://careers.northwind.example/jobs/42',
        'status': 'Applied',
        'deadline': None,
        'contact': Contact(name='Priya Raman', email='priya.raman@northwind.example'),
        'resume_id': 'res-1',
        'resume_name': 'Software resume, September 2026.pdf',
        'notes': '',
    }
    return ApplicationRecord(**(fields | changes))


class ApplicationRecordRulesTests(SimpleTestCase):
    def errors(self, **changes):
        try:
            record(**changes).validate()
        except ApplicationValidationError as error:
            return error.field_errors
        return {}

    def test_complete_record_is_valid(self):
        self.assertEqual(self.errors(), {})

    def test_job_title_and_employer_are_required(self):
        self.assertEqual(
            self.errors(job_title='  ', employer=''),
            {'job_title': 'Enter the job title.', 'employer': 'Enter the employer.'},
        )

    def test_posting_url_must_be_a_full_web_address(self):
        message = 'Enter a full web address starting with https://, or leave this blank.'
        for url in ['careers.northwind.example', 'ftp://files.example/job', 'https://']:
            with self.subTest(url=url):
                self.assertEqual(self.errors(posting_url=url), {'posting_url': message})
        self.assertEqual(self.errors(posting_url=''), {})

    def test_contact_email_must_look_like_an_address(self):
        message = 'Enter an email address like name@example.com, or leave this blank.'
        self.assertEqual(
            self.errors(contact=Contact(name='Priya Raman', email='priya at northwind')),
            {'contact_email': message},
        )
        self.assertEqual(self.errors(contact=Contact(name='', email='')), {})

    def test_status_must_be_one_of_the_six(self):
        self.assertEqual(
            self.errors(status='Ghosted'), {'status': 'Choose one of the listed statuses.'}
        )

    def test_deadline_is_optional(self):
        self.assertEqual(self.errors(deadline=date(2026, 11, 30)), {})


NEW_APPLICATION = {
    'jobTitle': 'Junior Cloud Developer',
    'employer': 'Northwind Logistics',
    'postingUrl': 'https://careers.northwind.example/jobs/42',
    'status': 'Applied',
    'deadline': '2026-11-30',
    'resumeId': 'res-1',
    'resumeName': 'Software resume, September 2026.pdf',
    'notes': 'Referred by a classmate.',
    'contactName': 'Priya Raman',
    'contactEmail': 'priya.raman@northwind.example',
}


class ApplicationRecordsApiTests(TestCase):
    def setUp(self):
        self.maya = User.objects.create_user('maya.okafor', password='demo-pass')
        self.daniel = User.objects.create_user('daniel.reyes', password='demo-pass')

    def create(self, data):
        return self.client.post('/api/applications/', data, 'application/json')

    def test_student_saves_a_record_and_finds_it_in_their_list(self):
        self.client.force_login(self.maya)

        created = self.create(NEW_APPLICATION)
        listed = self.client.get('/api/applications/')

        self.assertEqual(created.status_code, 201)
        saved = created.json()
        self.assertEqual(saved | {'id': None}, NEW_APPLICATION | {'id': None})
        self.assertEqual(listed.json(), [saved])

    def test_optional_fields_can_be_left_blank(self):
        self.client.force_login(self.maya)
        optional = ['postingUrl', 'resumeId', 'resumeName', 'notes', 'contactName', 'contactEmail']
        blank = dict.fromkeys(optional, '')

        response = self.create(NEW_APPLICATION | blank | {'deadline': ''})

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['deadline'], '')

    def test_invalid_fields_get_one_message_each_and_nothing_is_saved(self):
        self.client.force_login(self.maya)

        response = self.create(
            NEW_APPLICATION
            | {'jobTitle': '', 'postingUrl': 'northwind.example', 'status': 'Ghosted'}
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {
                'jobTitle': 'Enter the job title.',
                'postingUrl': (
                    'Enter a full web address starting with https://, or leave this blank.'
                ),
                'status': 'Choose one of the listed statuses.',
            },
        )
        self.assertEqual(self.client.get('/api/applications/').json(), [])

    def test_badly_formed_deadline_is_rejected(self):
        self.client.force_login(self.maya)

        response = self.create(NEW_APPLICATION | {'deadline': '30/11/2026'})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.json()), {'deadline'})

    def test_nobody_signed_in_is_refused(self):
        self.assertEqual(self.client.get('/api/applications/').status_code, 403)
        self.assertEqual(self.create(NEW_APPLICATION).status_code, 403)

    def test_students_only_see_their_own_records(self):
        self.client.force_login(self.maya)
        self.create(NEW_APPLICATION)

        self.client.force_login(self.daniel)

        self.assertEqual(self.client.get('/api/applications/').json(), [])
