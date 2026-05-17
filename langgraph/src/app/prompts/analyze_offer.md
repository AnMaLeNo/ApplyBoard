# Offer analysis task

Analyze the following job offer JSON. Your output will be used by later nodes to
select existing CV variants. You must not select, rewrite, or generate CV
content.

## Offer JSON

```json
{{OFFER_JSON}}
```

## Required output

Return one valid JSON object conforming to this JSON schema:

```json
{{OUTPUT_SCHEMA_JSON}}
```

## Analysis rules

- Extract explicit requirements when the offer states them directly.
- Extract implicit priorities only when they are strongly supported by the offer.
- Use `unknown` for unclear seniority, domain, work environment, or source.
- Keep labels concise and reusable by downstream selection nodes.
- `importance` must be `high`, `medium`, or `low`.
- `source` must be `explicit`, `implicit`, or `unknown`.
- `weight` must be an integer from 1 to 5.
- `confidence` must be a number from 0 to 1.
- `keywords` should contain terms useful for matching CV variants later.
- Return JSON only. Do not wrap the JSON in Markdown.

