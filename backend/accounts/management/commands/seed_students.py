from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

# Sample students for local runs. The shared password is listed in backend/README.md.
STUDENTS = [('maya.okafor', 'Maya', 'Okafor'), ('daniel.reyes', 'Daniel', 'Reyes')]
PASSWORD = 'applysmart-demo'


class Command(BaseCommand):
    help = 'Create the sample student accounts that do not exist yet.'

    def handle(self, *args, **options):
        for username, first_name, last_name in STUDENTS:
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username,
                    f'{username}@applysmart.test',
                    PASSWORD,
                    first_name=first_name,
                    last_name=last_name,
                )
