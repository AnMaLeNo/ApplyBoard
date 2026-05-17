from functools import lru_cache

from fastapi import FastAPI

from app.llm import JsonLLMClient, create_llm_client_from_env
from app.nodes.analyze_offer import analyze_offer
from app.schemas import AnalyzeOfferRequest, AnalyzeOfferResponse

app = FastAPI(title="ApplyBoard AI Service")


@lru_cache
def get_llm_client() -> JsonLLMClient:
    return create_llm_client_from_env()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze-offer", response_model=AnalyzeOfferResponse)
async def analyze_offer_endpoint(payload: AnalyzeOfferRequest) -> AnalyzeOfferResponse:
    analysis = await analyze_offer(payload.offer, get_llm_client())
    return AnalyzeOfferResponse(offer_analysis=analysis)

