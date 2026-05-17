# ApplyBoard AI service

This folder contains the Python/LangGraph service used by the backend to build
CV drafts from tracked offers and a user's CV document.

Current scope:

- scaffold the AI service as an independent Python project;
- implement the first LLM node: `analyze_offer`;
- keep node inputs and outputs JSON-shaped and validated with Pydantic;
- keep prompt templates explicit and versioned on disk.

The `analyze_offer` node only analyzes the offer. It does not read the CV
document and it does not select CV variants.


## LLM provider

The service defaults to Pioneer, using its OpenAI-compatible API. Configure it
with environment variables, or copy `.env.example` to `.env`:

```bash
LLM_PROVIDER=pioneer
PIONEER_API_KEY=your_pioneer_api_key
PIONEER_BASE_URL=https://api.pioneer.ai/v1
PIONEER_MODEL=gpt-5-mini
```

`LLM_PROVIDER=openai` is also supported for direct OpenAI API usage.

## Local run

```bash
cd langgraph
uv sync --extra dev
cp .env.example .env
# edit .env and set PIONEER_API_KEY
uv run uvicorn app.app:app --app-dir src --reload --port 8000
```

Then call the isolated node endpoint:

```bash
curl -X POST http://localhost:8000/analyze-offer \
  -H "Content-Type: application/json" \
  -d '{"offer":{"title":"Backend Developer","company":"Example","expertises":"Python, APIs"}}'
```

## Analyze real offers from Postgres

When the Docker Compose stack is running, you can test `analyze_offer` with real
scraped offers stored in Postgres:

```bash
cd langgraph
uv run python scripts/analyze_offer_from_db.py --latest
```

Or target one offer explicitly:

```bash
uv run python scripts/analyze_offer_from_db.py --offer-id 27458
```

The script reads offers through `docker compose exec database psql`, then sends
them to the configured LLM provider.
