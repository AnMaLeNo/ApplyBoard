import asyncio

from app.nodes.analyze_offer import analyze_offer, build_analyze_offer_prompt
from app.schemas import OfferInput


class FakeLLM:
    def __init__(self):
        self.system_prompt = None
        self.user_prompt = None

    async def complete_json(self, *, system_prompt, user_prompt):
        self.system_prompt = system_prompt
        self.user_prompt = user_prompt
        return {
            "role": {
                "title": "Backend Developer",
                "seniority": "junior",
                "confidence": 0.8,
            },
            "company_context": {
                "company": "Example Corp",
                "domain": "software",
                "work_environment": [],
                "confidence": 0.5,
            },
            "responsibilities": [
                {
                    "label": "Build and maintain APIs",
                    "importance": "high",
                    "source": "explicit",
                    "evidence": "API development is mentioned in the offer.",
                }
            ],
            "technical_skills": [
                {
                    "name": "Node.js",
                    "importance": "high",
                    "source": "explicit",
                    "evidence": "Node.js is listed as a required expertise.",
                }
            ],
            "soft_skills": [],
            "profile_target": {
                "summary": "A junior backend profile focused on API development.",
                "signals": ["backend", "api"],
            },
            "priorities": [
                {
                    "label": "Backend API experience",
                    "weight": 5,
                    "source": "explicit",
                    "reason": "The offer emphasizes API development.",
                }
            ],
            "keywords": ["backend", "api", "node.js"],
            "uncertainties": [],
        }


def test_prompt_injects_offer_json():
    offer = OfferInput(title="Backend intern", company="Example Corp")
    prompt = build_analyze_offer_prompt(offer)

    assert "Backend intern" in prompt
    assert "Example Corp" in prompt
    assert "{{OFFER_JSON}}" not in prompt


def test_analyze_offer_validates_llm_json():
    llm = FakeLLM()
    analysis = asyncio.run(
        analyze_offer(
            {"title": "Backend intern", "expertises": "Node.js, APIs"},
            llm,
        )
    )

    assert analysis.role.title == "Backend Developer"
    assert analysis.priorities[0].weight == 5
    assert "Node.js" in llm.user_prompt

