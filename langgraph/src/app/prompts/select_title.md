# Title selection task

You receive a structured offer analysis and the complete list of available CV
title variants. Select at most one existing title variant.

## Offer analysis JSON

```json
{{OFFER_ANALYSIS_JSON}}
```

## Available title variants JSON

The array order is important. If you select a title, `selected_index` must be the
zero-based index in this exact array, and `selected_title` must be copied exactly.

```json
{{TITLE_VARIANTS_JSON}}
```

## Required output

Return one valid JSON object conforming to this JSON schema:

```json
{{OUTPUT_SCHEMA_JSON}}
```

## Selection rules

- Choose only from the provided title variants.
- Do not rewrite, translate, shorten, expand, or create a title.
- If no title variant is sufficiently aligned with the offer analysis, set:
  - `selected_index` to null;
  - `selected_title` to null;
  - `is_sufficient` to false.
- If a title is selected, set `is_sufficient` to true and copy the exact title.
- Prefer titles matching the role, seniority, domain, technical priorities, and
  target profile identified by `analyze_offer`.
- Use `matched_signals` for the offer signals that justify the choice.
- Use `missing_signals` for important offer signals not covered by the selected
  title, or for the reason no title is sufficient.
- `confidence` must be a number from 0 to 1.
- Return JSON only. Do not wrap the JSON in Markdown.
