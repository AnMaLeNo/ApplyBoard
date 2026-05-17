# CV Document MCP

Containerized MCP server used to inspect, validate and update `cv_documents` in
Postgres. The server is deterministic: it does not generate CV content itself.
An AI client can generate variants from project READMEs, then use these tools to
preview and apply structured updates.

## Tools

- `users.list`
- `cv_document.get`
- `cv_document.validate`
- `cv_document.preview_patch`
- `cv_document.apply_patch`
- `cv_document.add_title_variants`
- `cv_document.add_summary_variants`
- `cv_document.upsert_project_entry`
- `cv_document.upsert_education_entry`
- `cv_document.upsert_hackathon_entry`
- `cv_document.add_skills`
- `cv_document.add_interests`
- `cv_document.remove_variant`
- `cv_document.remove_entry`
- `cv_document.remove_list_item`
- `cv_document.bulk_upsert`

## Local development

```bash
cd cv-document-mcp
uv sync --extra dev
DATABASE_URL=postgres://admin:securepassword@localhost:5432/offers_db uv run python -m cv_document_mcp.server
```

In Docker Compose, the service uses `postgres://admin:securepassword@database:5432/offers_db`.
