from pathlib import Path

PROMPTS_DIR = Path(__file__).resolve().parent / "prompts"


class PromptTemplateError(RuntimeError):
    pass


def load_prompt_template(name: str) -> str:
    path = PROMPTS_DIR / name
    if not path.is_file():
        raise PromptTemplateError(f"Prompt template not found: {name}")
    return path.read_text(encoding="utf-8")


def render_prompt_template(name: str, replacements: dict[str, str]) -> str:
    rendered = load_prompt_template(name)
    for key, value in replacements.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", value)

    if "{{" in rendered or "}}" in rendered:
        raise PromptTemplateError(f"Unresolved placeholder in prompt template: {name}")

    return rendered

