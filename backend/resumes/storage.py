from pathlib import Path
from typing import Protocol

from django.conf import settings


class FileStorage(Protocol):
    """Where resume files are kept. Local disk in this release; private S3 on AWS (ADR-0008)."""

    def save(self, key: str, content: bytes) -> None: ...

    def open(self, key: str) -> bytes: ...

    def delete(self, key: str) -> None: ...


class LocalFileStorage:
    """Keeps files in a folder no URL serves, so only the backend can read them."""

    def __init__(self, root_path):
        self.root_path = Path(root_path)

    def save(self, key, content):
        self.root_path.mkdir(parents=True, exist_ok=True)
        # 'xb' refuses to overwrite, so a repeated key can never replace another student's file.
        with open(self._path(key), 'xb') as file:
            file.write(content)

    def open(self, key):
        return self._path(key).read_bytes()

    def delete(self, key):
        self._path(key).unlink(missing_ok=True)

    def _path(self, key):
        # Keys come from the service, never from the request; this guards against a bad caller.
        if Path(key).name != key:
            raise ValueError(f'Not a storage key: {key!r}')
        return self.root_path / key


def default_storage():
    return LocalFileStorage(settings.RESUME_FILES_DIR)
