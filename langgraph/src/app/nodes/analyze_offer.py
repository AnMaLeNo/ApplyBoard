import json
from collections.abc import Awaitable, Callable, Mapping
from typing import Any

from app.llm import JsonLLMClient
from app.prompting import render_prompt_template
from app.schemas import OfferAnalysis, OfferInput

SYSTEM_PROMPT = """
You are an offer-analysis node in a deterministic CV generation workflow.
You receive one job offer as JSON and return one JSON object only.

Your job:
- analyze what the offer is looking for;
- identify expectations, important criteria, requested skills, target profile,
  and implicit priorities;
- produce a structured analysis that later nodes can use to select CV variants.

Strict boundaries:
- do not choose CV content;
- do not evaluate the candidate;
- do not invent facts absent from the offer;
- mark reasonable deductions as "implicit";
- use "unknown" when the offer is unclear.
""".strip()


def build_analyze_offer_prompt(offer: OfferInput) -> str:
    offer_json = json.dumps(
        offer.model_dump(mode="json"),
        ensure_ascii=False,
        indent=2,
    )
    output_schema_json = json.dumps(
        OfferAnalysis.model_json_schema(),
        ensure_ascii=False,
        indent=2,
    )

    return render_prompt_template(
        "analyze_offer.md",
        {
            "OFFER_JSON": offer_json,
            "OUTPUT_SCHEMA_JSON": output_schema_json,
        },
    )


async def analyze_offer(
    offer_payload: OfferInput | Mapping[str, Any],
    llm: JsonLLMClient,
) -> OfferAnalysis:
    offer = (
        offer_payload
        if isinstance(offer_payload, OfferInput)
        else OfferInput.model_validate(offer_payload)
    )

    raw_analysis = await llm.complete_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=build_analyze_offer_prompt(offer),
    )

    return OfferAnalysis.model_validate(raw_analysis)


def make_analyze_offer_node(
    llm: JsonLLMClient,
) -> Callable[[Mapping[str, Any]], Awaitable[dict[str, Any]]]:
    async def node(state: Mapping[str, Any]) -> dict[str, Any]:
        analysis = await analyze_offer(state["offer"], llm)
        return {"offer_analysis": analysis.model_dump(mode="json")}

    return node

