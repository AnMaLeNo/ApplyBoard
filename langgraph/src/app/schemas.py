from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Importance = Literal["high", "medium", "low"]
EvidenceSource = Literal["explicit", "implicit", "unknown"]
Seniority = Literal["internship", "junior", "mid", "senior", "lead", "unknown"]


class OfferInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int | None = None
    url: str | None = None
    title: str | None = None
    company: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    salary: str | None = None
    contract_type: str | None = None
    email: str | None = None
    address: str | None = None
    availability: str | None = None
    campus: str | None = None
    expertises: str | None = None
    target: str | None = None
    created_at: str | None = None
    apply: bool | None = None
    answer: bool | None = None


class RoleAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(description="Canonical role title inferred from the offer.")
    seniority: Seniority
    confidence: float = Field(ge=0, le=1)


class CompanyContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company: str | None = None
    domain: str | None = None
    work_environment: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


class RequirementSignal(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    importance: Importance
    source: EvidenceSource
    evidence: str | None = Field(
        default=None,
        description="Short clue from the offer or brief explanation for implicit signals.",
    )


class SkillSignal(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    importance: Importance
    source: EvidenceSource
    evidence: str | None = None


class ProfileTarget(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    signals: list[str] = Field(default_factory=list)


class PrioritySignal(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    weight: int = Field(ge=1, le=5)
    source: EvidenceSource
    reason: str


class Uncertainty(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: str
    reason: str


class OfferAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: RoleAnalysis
    company_context: CompanyContext
    responsibilities: list[RequirementSignal] = Field(default_factory=list)
    technical_skills: list[SkillSignal] = Field(default_factory=list)
    soft_skills: list[SkillSignal] = Field(default_factory=list)
    profile_target: ProfileTarget
    priorities: list[PrioritySignal] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    uncertainties: list[Uncertainty] = Field(default_factory=list)


class AnalyzeOfferRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    offer: OfferInput


class AnalyzeOfferResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    offer_analysis: OfferAnalysis

