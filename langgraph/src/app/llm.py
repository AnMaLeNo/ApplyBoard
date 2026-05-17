import json
import os
from pathlib import Path
from typing import Any, Protocol

from dotenv import load_dotenv


class LLMConfigurationError(RuntimeError):
    pass


class LLMResponseError(RuntimeError):
    pass


class JsonLLMClient(Protocol):
    async def complete_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        """Return one JSON object produced by an LLM."""


class OpenAICompatibleJsonClient:
    def __init__(
        self,
        *,
        model: str,
        api_key: str | None = None,
        base_url: str | None = None,
        default_headers: dict[str, str] | None = None,
    ):
        if not model:
            raise LLMConfigurationError("LLM model is required.")
        if not api_key:
            raise LLMConfigurationError("LLM API key is required.")

        from openai import AsyncOpenAI

        self._model = model
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            default_headers=default_headers,
        )

    async def complete_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> dict[str, Any]:
        response = await self._client.chat.completions.create(
            model=self._model,
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        content = response.choices[0].message.content
        if not content:
            raise LLMResponseError("The LLM returned an empty response.")

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as error:
            raise LLMResponseError("The LLM response was not valid JSON.") from error

        if not isinstance(parsed, dict):
            raise LLMResponseError("The LLM response must be a JSON object.")

        return parsed


class OpenAIJsonClient(OpenAICompatibleJsonClient):
    @classmethod
    def from_env(cls) -> "OpenAIJsonClient":
        return cls(
            model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            api_key=os.getenv("OPENAI_API_KEY"),
        )


class PioneerJsonClient(OpenAICompatibleJsonClient):
    @classmethod
    def from_env(cls) -> "PioneerJsonClient":
        api_key = os.getenv("PIONEER_API_KEY")
        return cls(
            model=os.getenv("PIONEER_MODEL", "gpt-5-mini"),
            api_key=api_key,
            base_url=os.getenv("PIONEER_BASE_URL", "https://api.pioneer.ai/v1"),
            default_headers={"X-API-Key": api_key} if api_key else None,
        )


def create_llm_client_from_env(*, load_env_file: bool = True) -> JsonLLMClient:
    if load_env_file:
        load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    provider = os.getenv("LLM_PROVIDER", "pioneer").strip().lower()

    if provider == "pioneer":
        return PioneerJsonClient.from_env()
    if provider == "openai":
        return OpenAIJsonClient.from_env()

    raise LLMConfigurationError(
        f"Unsupported LLM_PROVIDER '{provider}'. Expected 'pioneer' or 'openai'."
    )
