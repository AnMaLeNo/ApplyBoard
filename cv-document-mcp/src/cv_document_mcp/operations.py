from copy import deepcopy
from typing import Any

from pydantic import ValidationError

from cv_document_mcp.schemas import (
    BulkEntryUpsert,
    BulkUpsertPayload,
    CvDocument,
    CvDocumentPatch,
    EntryField,
    EntrySection,
    EntryUpsert,
    FlatVariantSection,
    ListSectionName,
)


def normalize_text(value: str) -> str:
    return " ".join(value.split()).strip()


def append_unique(existing: list[str], new_values: list[str]) -> int:
    seen = {normalize_text(value) for value in existing if normalize_text(value)}
    added = 0
    for raw_value in new_values:
        value = normalize_text(raw_value)
        if not value or value in seen:
            continue
        existing.append(value)
        seen.add(value)
        added += 1
    return added


def validate_document(data: dict[str, Any]) -> tuple[bool, list[dict[str, Any]]]:
    try:
        CvDocument.model_validate(data)
        return True, []
    except ValidationError as error:
        return False, error.errors()


def ensure_document(data: dict[str, Any]) -> dict[str, Any]:
    return CvDocument.model_validate(data).model_dump(mode="json")


def apply_patch_to_document(
    data: dict[str, Any],
    patch_payload: dict[str, Any] | CvDocumentPatch,
) -> tuple[dict[str, Any], list[str]]:
    patch = (
        patch_payload
        if isinstance(patch_payload, CvDocumentPatch)
        else CvDocumentPatch.model_validate(patch_payload)
    )
    next_data = ensure_document(deepcopy(data))
    cv = next_data["cv"]
    summary: list[str] = []

    for section_name in ("title", "summary"):
        section_patch = getattr(patch, section_name)
        if section_patch is None:
            continue
        added = append_unique(cv[section_name]["variants"], section_patch.append_variants)
        summary.append(f"Added {added} {section_name} variant(s)")

    for section_name in ("projects", "education", "hackathons"):
        section_patch = getattr(patch, section_name)
        if section_patch is None:
            continue
        for entry in section_patch.upsert_entries:
            added_title, added_description = upsert_entry(cv, section_name, entry)
            summary.append(
                f"Upserted {section_name}.{entry.entry_key}: "
                f"added {added_title} title variant(s), "
                f"{added_description} description variant(s)"
            )

    for section_name in ("skills", "interests"):
        section_patch = getattr(patch, section_name)
        if section_patch is None:
            continue
        added = append_unique(cv[section_name]["items"], section_patch.append_items)
        summary.append(f"Added {added} {section_name} item(s)")

    ensure_document(next_data)
    return next_data, summary


def upsert_entry(
    cv: dict[str, Any],
    section: str,
    entry: EntryUpsert | BulkEntryUpsert,
) -> tuple[int, int]:
    entry_key = normalize_text(entry.entry_key)
    if not entry_key:
        raise ValueError("entry_key must not be empty")

    target = cv[section].setdefault(
        entry_key,
        {"title": {"variants": []}, "description": {"variants": []}},
    )
    added_title = append_unique(target["title"]["variants"], entry.title_variants)
    added_description = append_unique(
        target["description"]["variants"],
        entry.description_variants,
    )
    return added_title, added_description


def make_bulk_patch(payload: dict[str, Any] | BulkUpsertPayload) -> CvDocumentPatch:
    bulk = (
        payload
        if isinstance(payload, BulkUpsertPayload)
        else BulkUpsertPayload.model_validate(payload)
    )
    return CvDocumentPatch(
        title={"append_variants": bulk.title_variants},
        summary={"append_variants": bulk.summary_variants},
        projects={"upsert_entries": [entry.model_dump(mode="json") for entry in bulk.projects]},
        education={"upsert_entries": [entry.model_dump(mode="json") for entry in bulk.education]},
        hackathons={"upsert_entries": [entry.model_dump(mode="json") for entry in bulk.hackathons]},
        skills={"append_items": bulk.skills},
        interests={"append_items": bulk.interests},
    )


def remove_flat_variant(
    data: dict[str, Any],
    section: FlatVariantSection,
    index: int,
) -> tuple[dict[str, Any], str]:
    next_data = ensure_document(deepcopy(data))
    variants = next_data["cv"][section]["variants"]
    removed = variants.pop(index)
    return next_data, f"Removed {section} variant at index {index}: {removed}"


def remove_entry_variant(
    data: dict[str, Any],
    section: EntrySection,
    entry_key: str,
    entry_field: EntryField,
    index: int,
) -> tuple[dict[str, Any], str]:
    next_data = ensure_document(deepcopy(data))
    entry = next_data["cv"][section][entry_key]
    variants = entry[entry_field]["variants"]
    removed = variants.pop(index)
    return (
        next_data,
        f"Removed {section}.{entry_key}.{entry_field} variant at index {index}: {removed}",
    )


def remove_entry(
    data: dict[str, Any],
    section: EntrySection,
    entry_key: str,
) -> tuple[dict[str, Any], str]:
    next_data = ensure_document(deepcopy(data))
    removed = next_data["cv"][section].pop(entry_key)
    title = ""
    titles = removed.get("title", {}).get("variants", [])
    if titles:
        title = f" ({titles[0]})"
    return next_data, f"Removed {section}.{entry_key}{title}"


def remove_list_item(
    data: dict[str, Any],
    section: ListSectionName,
    index: int,
) -> tuple[dict[str, Any], str]:
    next_data = ensure_document(deepcopy(data))
    items = next_data["cv"][section]["items"]
    removed = items.pop(index)
    return next_data, f"Removed {section} item at index {index}: {removed}"
