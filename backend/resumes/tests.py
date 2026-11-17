import io
import shutil
import tempfile
import zipfile
from pathlib import Path
from unittest import mock

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import DatabaseError
from django.test import SimpleTestCase, TestCase, override_settings

from accounts.repository import student_for

from . import services
from .domain import (
    LIMIT_REACHED,
    MAX_UPLOAD_BYTES,
    NOT_PDF_OR_DOCX,
    RESUME_VERSION_LIMIT,
    TOO_LARGE,
    UNREADABLE,
    ResumeFile,
    ResumeUpload,
    ResumeValidationError,
)
from .storage import LocalFileStorage

PDF = b'%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n'


def docx_bytes():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as package:
        package.writestr('[Content_Types].xml', '<Types/>')
        package.writestr('word/document.xml', '<w:document/>')
    return buffer.getvalue()


def upload(file_name='Cloud resume.pdf', content=PDF, size_bytes=None, version_name='Cloud'):
    return ResumeUpload(
        file_name=file_name,
        content_type='application/pdf',
        size_bytes=len(content) if size_bytes is None else size_bytes,
        content=content,
        version_name=version_name,
    )


class ResumeFileRulesTests(SimpleTestCase):
    def reason(self, **changes):
        sent = upload(**changes)
        try:
            ResumeFile.for_upload(sent).validate(sent.content)
        except ResumeValidationError as error:
            return error.reason
        return None

    def test_pdf_and_docx_files_are_accepted(self):
        self.assertIsNone(self.reason())
        self.assertIsNone(self.reason(file_name='Resume.DOCX', content=docx_bytes()))

    def test_other_file_types_are_refused(self):
        for name in ['Resume.png', 'Resume.doc', 'Resume.pdf.exe', 'Resume']:
            with self.subTest(name=name):
                self.assertEqual(self.reason(file_name=name), NOT_PDF_OR_DOCX)

    def test_files_over_5_mb_are_refused(self):
        self.assertIsNone(self.reason(size_bytes=MAX_UPLOAD_BYTES))
        self.assertEqual(self.reason(size_bytes=MAX_UPLOAD_BYTES + 1), TOO_LARGE)

    def test_content_that_does_not_match_the_type_is_unreadable(self):
        self.assertEqual(self.reason(content=b'just some text'), UNREADABLE)
        self.assertEqual(self.reason(file_name='Resume.docx', content=PDF), UNREADABLE)
        not_word = io.BytesIO()
        with zipfile.ZipFile(not_word, 'w') as package:
            package.writestr('notes.txt', 'hello')
        self.assertEqual(
            self.reason(file_name='Resume.docx', content=not_word.getvalue()), UNREADABLE
        )

    def test_storage_key_never_contains_the_file_name(self):
        file = ResumeFile.for_upload(upload(file_name='../../Maya resume.pdf'))
        self.assertNotIn('Maya', file.storage_key)
        self.assertRegex(file.storage_key, r'^[0-9a-f]{32}\.pdf$')


class StorageFolderTestCase(TestCase):
    """Each test gets an empty resume folder that is deleted afterwards."""

    def setUp(self):
        self.files_dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.files_dir, ignore_errors=True)
        settings_override = override_settings(RESUME_FILES_DIR=str(self.files_dir))
        settings_override.enable()
        self.addCleanup(settings_override.disable)
        self.maya = User.objects.create_user('maya.okafor', password='demo-pass')
        self.daniel = User.objects.create_user('daniel.reyes', password='demo-pass')

    def stored_files(self):
        return list(self.files_dir.iterdir()) if self.files_dir.exists() else []


class UploadResumeApiTests(StorageFolderTestCase):
    def post(self, file_name='Cloud resume.pdf', content=PDF, version_name='Cloud and DevOps'):
        return self.client.post(
            '/api/resumes/',
            {'file': SimpleUploadedFile(file_name, content), 'versionName': version_name},
        )

    def assert_refused(self, response, status_code, body):
        self.assertEqual(response.status_code, status_code)
        self.assertEqual(response.json(), body)
        self.assertEqual(self.stored_files(), [])

    def test_student_uploads_a_resume_and_finds_it_processing_in_their_list(self):
        self.client.force_login(self.maya)

        created = self.post()
        listed = self.client.get('/api/resumes/')

        self.assertEqual(created.status_code, 201)
        version = created.json()
        self.assertEqual(version['versionName'], 'Cloud and DevOps')
        self.assertEqual(version['parseStatus'], 'Processing')
        self.assertFalse(version['isPrimary'])
        self.assertRegex(version['uploaded'], r'^\d{4}-\d{2}-\d{2}$')
        self.assertEqual(listed.json(), [version])
        [stored] = self.stored_files()
        self.assertEqual(stored.read_bytes(), PDF)
        self.assertNotIn('Cloud', stored.name)

    def test_docx_upload_is_accepted(self):
        self.client.force_login(self.maya)

        response = self.post(file_name='Resume.docx', content=docx_bytes())

        self.assertEqual(response.status_code, 201)

    def test_unsupported_file_is_refused_and_nothing_is_stored(self):
        self.client.force_login(self.maya)

        self.assert_refused(self.post(file_name='Resume.png'), 400, {'file': NOT_PDF_OR_DOCX})
        self.assertEqual(self.client.get('/api/resumes/').json(), [])

    def test_file_that_only_claims_to_be_a_pdf_is_refused(self):
        self.client.force_login(self.maya)

        self.assert_refused(self.post(content=b'MZ not really a pdf'), 400, {'file': UNREADABLE})

    def test_file_over_5_mb_is_refused(self):
        self.client.force_login(self.maya)
        too_big = PDF + b'0' * MAX_UPLOAD_BYTES

        self.assert_refused(self.post(content=too_big), 400, {'file': TOO_LARGE})

    def test_missing_file_is_refused(self):
        self.client.force_login(self.maya)

        response = self.client.post('/api/resumes/', {'versionName': 'Cloud'})

        self.assert_refused(response, 400, {'file': 'Choose a PDF or DOCX file to upload.'})

    def test_upload_over_the_version_limit_is_refused(self):
        self.client.force_login(self.maya)
        for number in range(RESUME_VERSION_LIMIT):
            self.assertEqual(self.post(version_name=f'Version {number}').status_code, 201)
        stored_before = self.stored_files()

        response = self.post(version_name='One too many')

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json(), {'detail': LIMIT_REACHED})
        self.assertEqual(self.stored_files(), stored_before)
        self.assertEqual(len(self.client.get('/api/resumes/').json()), RESUME_VERSION_LIMIT)

    def test_version_name_already_in_use_is_refused(self):
        self.client.force_login(self.maya)
        self.post(version_name='Cloud and DevOps')
        stored_before = self.stored_files()

        response = self.post(version_name='cloud and devops')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(), {'versionName': 'You already have a version named “cloud and devops”.'}
        )
        self.assertEqual(self.stored_files(), stored_before)

    def test_blank_version_name_is_refused(self):
        self.client.force_login(self.maya)

        response = self.post(version_name='  ')

        self.assert_refused(response, 400, {'versionName': 'Enter a version name.'})

    def test_nobody_signed_in_is_refused(self):
        self.assertEqual(self.client.get('/api/resumes/').status_code, 403)
        self.assertEqual(self.post().status_code, 403)
        self.assertEqual(self.stored_files(), [])

    def test_students_only_see_their_own_resumes(self):
        self.client.force_login(self.maya)
        self.post()

        self.client.force_login(self.daniel)

        self.assertEqual(self.client.get('/api/resumes/').json(), [])
        # The same name is free for another student, and the limit counts per student.
        self.assertEqual(self.post().status_code, 201)

    def test_stored_files_are_not_served_at_any_url(self):
        self.client.force_login(self.maya)
        self.post()
        [stored] = self.stored_files()

        for url in [f'/media/{stored.name}', f'/resume_files/{stored.name}', f'/{stored.name}']:
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 404)


class UploadResumeServiceTests(StorageFolderTestCase):
    def test_file_is_removed_when_the_version_cannot_be_saved(self):
        student = student_for(self.maya)

        with mock.patch('resumes.repository.save', side_effect=DatabaseError):
            with self.assertRaises(DatabaseError):
                services.upload_resume(student, upload())

        self.assertEqual(self.stored_files(), [])

    def test_versions_are_owned_by_the_student_who_uploaded_them(self):
        maya, daniel = student_for(self.maya), student_for(self.daniel)

        version = services.upload_resume(maya, upload())

        self.assertTrue(version.is_owned_by(maya))
        self.assertFalse(version.is_owned_by(daniel))
        self.assertFalse(version.is_owned_by(None))


class LocalFileStorageTests(SimpleTestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.storage = LocalFileStorage(self.root)

    def test_saves_opens_and_deletes_a_file(self):
        self.storage.save('abc.pdf', PDF)
        self.assertEqual(self.storage.open('abc.pdf'), PDF)
        self.storage.delete('abc.pdf')
        self.assertEqual(list(self.root.iterdir()), [])

    def test_never_overwrites_a_stored_file(self):
        self.storage.save('abc.pdf', PDF)
        with self.assertRaises(FileExistsError):
            self.storage.save('abc.pdf', b'other')

    def test_refuses_keys_that_leave_the_folder(self):
        with self.assertRaises(ValueError):
            self.storage.save('../escape.pdf', PDF)
