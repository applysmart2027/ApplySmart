"""Plain Python only: this layer must not import Django (ADR-0006)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Student:
    id: int
    name: str
    email: str
