from dataclasses import replace

from .domain import ParseStatus, ResumeFile, ResumeVersion
from .models import ResumeVersionModel


def save(version):
    row = _to_model(version)
    row.save()
    return replace(version, id=row.pk)


def list_for_owner(owner):
    rows = ResumeVersionModel.objects.filter(owner_id=owner.id).order_by('id')
    return [_to_domain(row) for row in rows]


def count_for_owner(owner):
    return ResumeVersionModel.objects.filter(owner_id=owner.id).count()


def name_taken(owner, version_name):
    return ResumeVersionModel.objects.filter(
        owner_id=owner.id, version_name__iexact=version_name
    ).exists()


def _to_domain(row):
    return ResumeVersion(
        id=row.pk,
        owner_id=row.owner_id,
        version_name=row.version_name,
        parse_status=ParseStatus(row.parse_status),
        is_primary=row.is_primary,
        uploaded_at=row.uploaded_at,
        file=ResumeFile(
            file_name=row.file_name,
            file_type=row.file_type,
            size_bytes=row.size_bytes,
            storage_key=row.storage_key,
        ),
    )


def _to_model(version):
    return ResumeVersionModel(
        id=version.id,
        owner_id=version.owner_id,
        version_name=version.version_name,
        parse_status=version.parse_status.value,
        is_primary=version.is_primary,
        file_name=version.file.file_name,
        file_type=version.file.file_type,
        size_bytes=version.file.size_bytes,
        storage_key=version.file.storage_key,
        uploaded_at=version.uploaded_at,
    )
