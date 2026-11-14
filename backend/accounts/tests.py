from django.contrib.auth.models import User
from django.test import TestCase

WRONG_CREDENTIALS = {'detail': 'Username or password is incorrect.'}


class SessionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            'maya.okafor',
            'maya.okafor@applysmart.test',
            'demo-pass',
            first_name='Maya',
            last_name='Okafor',
        )

    def sign_in(self, **credentials):
        return self.client.post('/api/session/', credentials, 'application/json')

    def test_signed_in_student_is_returned(self):
        self.assertEqual(self.sign_in(username='maya.okafor', password='demo-pass').status_code, 200)

        response = self.client.get('/api/session/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {'id': self.user.pk, 'name': 'Maya Okafor', 'email': 'maya.okafor@applysmart.test'},
        )

    def test_wrong_password_is_rejected_without_saying_which_field(self):
        response = self.sign_in(username='maya.okafor', password='wrong')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), WRONG_CREDENTIALS)

    def test_unknown_username_gets_the_same_message(self):
        response = self.sign_in(username='nobody', password='demo-pass')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), WRONG_CREDENTIALS)

    def test_missing_fields_are_rejected(self):
        response = self.sign_in()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.json()), {'username', 'password'})

    def test_nobody_signed_in(self):
        response = self.client.get('/api/session/')

        self.assertEqual(response.status_code, 403)

    def test_sign_out_ends_the_session(self):
        self.sign_in(username='maya.okafor', password='demo-pass')

        self.assertEqual(self.client.delete('/api/session/').status_code, 204)
        self.assertEqual(self.client.get('/api/session/').status_code, 403)
