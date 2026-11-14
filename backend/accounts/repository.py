from .domain import Student


def student_for(user):
    return Student(id=user.pk, name=user.get_full_name(), email=user.email)
