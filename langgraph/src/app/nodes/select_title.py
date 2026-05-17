import json
from collections.abc import Awaitable, Callable, Mapping
from typing import Any

from pydantic import BaseModel

from app.llm import JsonLLMClient, LLMResponseError
from app.prompting import render_prompt_template
from app.schemas import OfferAnalysis, SelectTitleInput, TitleSelection

SYSTEM_PROMPT = """
You are a title-selection node in a deterministic CV generation workflow.
You receive an offer analysis JSON and a list of existing CV title variants.
You return one JSON object only.

Your job:
- select the single best existing title variant for the offer;
- or explicitly indicate that no existing variant is sufficient.

Strict boundaries:
- do not create a new title;
- do not rewrite a title;
- do not choose outside the provided title variants;
- keep the output structure identical whether a title is selected or not.
""".strip()


def build_select_title_prompt(input_data: SelectTitleInput) -> str:
    offer_analysis_json = json.dumps(
        input_data.offer_analysis.model_dump(mode="json"),
        ensure_ascii=False,
        indent=2,
    )
    title_variants_json = json.dumps(
        input_data.title_variants,
        ensure_ascii=False,
        indent=2,
    )
    output_schema_json = json.dumps(
        TitleSelection.model_json_schema(),
        ensure_ascii=False,
        indent=2,
    )

    return render_prompt_template(
        "select_title.md",
        {
            "OFFER_ANALYSIS_JSON": offer_analysis_json,
            "TITLE_VARIANTS_JSON": title_variants_json,
            "OUTPUT_SCHEMA_JSON": output_schema_json,
        },
    )


def no_sufficient_title(reason: str) -> TitleSelection:
    return TitleSelection(
        selected_index=None,
        selected_title=None,
        is_sufficient=False,
        confidence=1.0,
        rationale=reason,
        matched_signals=[],
        missing_signals=[reason],
    )


def validate_selected_title(
    selection: TitleSelection,
    title_variants: list[str],
) -> TitleSelection:
    if not selection.is_sufficient:
        if selection.selected_index is not None or selection.selected_title is not None:
            raise LLMResponseError(
                "Insufficient title selections must use null selected_index and selected_title."
            )
        return selection

    if selection.selected_index is None or selection.selected_title is None:
        raise LLMResponseError(
            "Sufficient title selections require selected_index and selected_title."
        )

    if selection.selected_index >= len(title_variants):
        raise LLMResponseError("The selected title index is out of range.")

    expected_title = title_variants[selection.selected_index]
    if selection.selected_title != expected_title:
        raise LLMResponseError(
            "The selected title must exactly match the variant at selected_index."
        )

    return selection


async def select_title(
    payload: SelectTitleInput | Mapping[str, Any],
    llm: JsonLLMClient,
) -> TitleSelection:
    if isinstance(payload, SelectTitleInput):
        input_data = payload
    elif isinstance(payload, BaseModel):
        input_data = SelectTitleInput.model_validate(payload.model_dump(mode="json"))
    else:
        input_data = SelectTitleInput.model_validate(payload)

    if not input_data.title_variants:
        return no_sufficient_title("No title variants are available.")

    raw_selection = await llm.complete_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=build_select_title_prompt(input_data),
    )

    selection = TitleSelection.model_validate(raw_selection)
    return validate_selected_title(selection, input_data.title_variants)


def make_select_title_node(
    llm: JsonLLMClient,
) -> Callable[[Mapping[str, Any]], Awaitable[dict[str, Any]]]:
    async def node(state: Mapping[str, Any]) -> dict[str, Any]:
        offer_analysis = OfferAnalysis.model_validate(state["offer_analysis"])
        selection = await select_title(
            {
                "offer_analysis": offer_analysis.model_dump(mode="json"),
                "title_variants": state.get("title_variants", []),
            },
            llm,
        )
        return {"title_selection": selection.model_dump(mode="json")}

    return node
