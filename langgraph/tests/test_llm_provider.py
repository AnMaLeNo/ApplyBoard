import pytest

from app.llm import LLMConfigurationError, create_llm_client_from_env


def test_default_provider_is_pioneer_and_requires_pioneer_key(monkeypatch):
    monkeypatch.delenv("LLM_PROVIDER", raising=False)
    monkeypatch.delenv("PIONEER_API_KEY", raising=False)

    with pytest.raises(LLMConfigurationError, match="LLM API key is required"):
        create_llm_client_from_env(load_env_file=False)


def test_unknown_provider_is_rejected(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "unknown")

    with pytest.raises(LLMConfigurationError, match="Unsupported LLM_PROVIDER"):
        create_llm_client_from_env(load_env_file=False)
