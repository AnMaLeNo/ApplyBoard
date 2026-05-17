from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FlatVariantSection = Literal["title", "summary"]
EntrySection = Literal["projects", "education", "hackathons"]
ListSectionName = Literal["skills", "interests"]
EntryField = Literal["title", "description"]


class VariantBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")

    variants: list[str] = Field(default_factory=list)


class Entry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: VariantBlock
    description: VariantBlock


class ListSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[str] = Field(default_factory=list)


class CvContent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: VariantBlock
    summary: VariantBlock
    projects: dict[str, Entry] = Field(default_factory=dict)
    education: dict[str, Entry] = Field(default_factory=dict)
    hackathons: dict[str, Entry] = Field(default_factory=dict)
    skills: ListSection
    interests: ListSection


class CvDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cv: CvContent


class VariantSectionPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    append_variants: list[str] = Field(default_factory=list)


class ListSectionPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    append_items: list[str] = Field(default_factory=list)


class EntryUpsert(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entry_key: str
    title_variants: list[str] = Field(default_factory=list)
    description_variants: list[str] = Field(default_factory=list)


class EntrySectionPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    upsert_entries: list[EntryUpsert] = Field(default_factory=list)


class CvDocumentPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: VariantSectionPatch | None = None
    summary: VariantSectionPatch | None = None
    projects: EntrySectionPatch | None = None
    education: EntrySectionPatch | None = None
    hackathons: EntrySectionPatch | None = None
    skills: ListSectionPatch | None = None
    interests: ListSectionPatch | None = None


class BulkEntryUpsert(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entry_key: str
    title_variants: list[str] = Field(default_factory=list)
    description_variants: list[str] = Field(default_factory=list)


class BulkUpsertPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title_variants: list[str] = Field(default_factory=list)
    summary_variants: list[str] = Field(default_factory=list)
    projects: list[BulkEntryUpsert] = Field(default_factory=list)
    education: list[BulkEntryUpsert] = Field(default_factory=list)
    hackathons: list[BulkEntryUpsert] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)


EMPTY_CV_DOCUMENT = {
    "cv": {
        "title": {"variants": []},
        "summary": {"variants": []},
        "projects": {},
        "education": {},
        "hackathons": {},
        "skills": {"items": []},
        "interests": {"items": []},
    }
}
