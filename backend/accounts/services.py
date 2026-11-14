from django.contrib.auth import authenticate, login, logout

from . import repository


class InvalidCredentialsError(Exception):
    pass


def sign_in(request, username, password):
    user = authenticate(request, username=username, password=password)
    if user is None:
        raise InvalidCredentialsError
    login(request, user)
    return repository.student_for(user)


def sign_out(request):
    logout(request)


def current_student(request):
    """Return the signed-in student, or None when nobody is signed in."""
    if not request.user.is_authenticated:
        return None
    return repository.student_for(request.user)
