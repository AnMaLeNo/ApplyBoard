import asyncio

import pytest

from app.llm import LLMResponseError
from app.nodes.select_title import build_select_title_prompt, select_title
from app.schemas import OfferAnalysis, SelectTitleInput


def offer_analysis_payload():
    return {
        "role": {
            "title": "Fullstack Developer",
            "seniority": "internship",
            "confidence": 0.9,
        },
        "company_context": {
            "company": "Example",
            "domain": "software",
            "work_environment": ["startup"],
            "confidence": 0.8,
        },
        "responsibilities": [],
        "technical_skills": [
            {
                "name": "React",
                "importance": "high",
                "source": "explicit",
                "evidence": "React is listed in the offer.",
            }
        ],
        "soft_skills": [],
        "profile_target": {
            "summary": "Internship fullstack profile.",
            "signals": ["fullstack", "react"],
        },
        "priorities": [
            {
                "label": "Fullstack web development",
                "weight": 5,
                "source": "explicit",
                "reason": "The offer targets fullstack web development.",
            }
        ],
        "keywords": ["fullstack", "react"],
        "uncertainties": [],
    }


class FakeLLM:
    def __init__(self, response):
        self.response = response
        self.system_prompt = None
        self.user_prompt = None
        self.called = False

    async def complete_json(self, *, system_prompt, user_prompt):
        self.called = True
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        return self.response


def test_prompt_injects_analysis_and_title_variants():
    input_data = SelectTitleInput(
        offer_analysis=OfferAnalysis.model_validate(offer_analysis_payload()),
        title_variants=["Développeur Backend", "Développeur Fullstack"],
    )

    prompt = build_select_title_prompt(input_data)

    assert "Fullstack Developer" in prompt
    assert "Développeur Fullstack" in prompt
    assert "{{OFFER_ANALYSIS_JSON}}" not in prompt
    assert "{{TITLE_VARIANTS_JSON}}" not in prompt


def test_select_title_returns_existing_variant():
    llm = FakeLLM(
        {
            "selected_index": 1,
            "selected_title": "Développeur Fullstack",
            "is_sufficient": True,
            "confidence": 0.86,
            "rationale": "Best match for the fullstack role.",
            "matched_signals": ["fullstack", "react"],
            "missing_signals": [],
        }
    )

    selection = asyncio.run(
        select_title(
            {
                "offer_analysis": offer_analysis_payload(),
                "title_variants": ["Développeur Backend", "Développeur Fullstack"],
            },
            llm,
        )
    )

    assert selection.selected_index == 1
    assert selection.selected_title == "Développeur Fullstack"
    assert selection.is_sufficient is True
    assert llm.called is True


def test_select_title_rejects_rewritten_title():
    llm = FakeLLM(
        {
            "selected_index": 1,
            "selected_title": "Développeur Fullstack React",
            "is_sufficient": True,
            "confidence": 0.86,
            "rationale": "Rewritten title.",
            "matched_signals": ["fullstack", "react"],
            "missing_signals": [],
        }
    )

    with pytest.raises(LLMResponseError):
        asyncio.run(
            select_title(
                {
                    "offer_analysis": offer_analysis_payload(),
                    "title_variants": ["Développeur Backend", "Développeur Fullstack"],
                },
                llm,
            )
        )


def test_select_title_empty_variants_is_deterministic():
    llm = FakeLLM({})

    selection = asyncio.run(
        select_title(
            {
                "offer_analysis": offer_analysis_payload(),
                "title_variants": [],
            },
            llm,
        )
    )

    assert selection.selected_index is None
    assert selection.selected_title is None
    assert selection.is_sufficient is False
    assert llm.called is False
