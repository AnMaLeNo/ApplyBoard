import os
from typing import Any

from mcp.server.fastmcp import FastMCP

from cv_document_mcp.db import Database
from cv_document_mcp.operations import (
    apply_patch_to_document,
    make_bulk_patch,
    remove_entry as remove_entry_from_document,
    remove_entry_variant,
    remove_flat_variant,
    remove_list_item as remove_list_item_from_document,
    validate_document,
)
from cv_document_mcp.schemas import EntryField, EntrySection, FlatVariantSection, ListSectionName

mcp = FastMCP("cv-document-mcp")
db = Database()


async def ensure_db() -> None:
    await db.connect()


def operation_error(message: str, data: dict[str, Any] | None = None) -> dict[str, Any]:
    response: dict[str, Any] = {
        "saved": False,
        "valid": False,
        "errors": [{"message": message}],
        "summary": [],
    }
    if data is not None:
        response["data"] = data
    return response


@mcp.tool(name="users.list")
async def users_list() -> dict[str, Any]:
    await ensure_db()
    return {"users": await db.list_users()}


@mcp.tool(name="cv_document.get")
async def cv_document_get(user_id: int) -> dict[str, Any]:
    await ensure_db()
    return await db.get_cv_document(user_id)


@mcp.tool(name="cv_document.validate")
async def cv_document_validate(data: dict[str, Any]) -> dict[str, Any]:
    valid, errors = validate_document(data)
    return {"valid": valid, "errors": errors}


@mcp.tool(name="cv_document.preview_patch")
async def cv_document_preview_patch(user_id: int, patch: dict[str, Any]) -> dict[str, Any]:
    await ensure_db()
    row = await db.get_cv_document(user_id)
    before = row["data"]
    try:
        after, summary = apply_patch_to_document(before, patch)
    except Exception as error:
        return {
            "valid": False,
            "errors": [{"message": str(error)}],
            "before": before,
            "after": before,
            "summary": [],
        }
    valid, errors = validate_document(after)
    return {
        "valid": valid,
        "errors": errors,
        "before": before,
        "after": after,
        "summary": summary,
    }


@mcp.tool(name="cv_document.apply_patch")
async def cv_document_apply_patch(user_id: int, patch: dict[str, Any]) -> dict[str, Any]:
    await ensure_db()
    row = await db.get_cv_document(user_id)
    try:
        after, summary = apply_patch_to_document(row["data"], patch)
    except Exception as error:
        return operation_error(str(error), row["data"])
    valid, errors = validate_document(after)
    if not valid:
        return {"saved": False, "valid": False, "errors": errors, "data": row["data"], "summary": summary}
    saved = await db.save_cv_document(user_id, after)
    return {"saved": True, "valid": True, "errors": [], "data": saved["data"], "summary": summary}


@mcp.tool(name="cv_document.add_title_variants")
async def cv_document_add_title_variants(user_id: int, variants: list[str]) -> dict[str, Any]:
    return await cv_document_apply_patch(user_id, {"title": {"append_variants": variants}})


@mcp.tool(name="cv_document.add_summary_variants")
async def cv_document_add_summary_variants(user_id: int, variants: list[str]) -> dict[str, Any]:
    return await cv_document_apply_patch(user_id, {"summary": {"append_variants": variants}})


async def upsert_entry_tool(
    user_id: int,
    section: EntrySection,
    entry_key: str,
    title_variants: list[str],
    description_variants: list[str],
) -> dict[str, Any]:
    return await cv_document_apply_patch(
        user_id,
        {section: {"upsert_entries": [{
            "entry_key": entry_key,
            "title_variants": title_variants,
            "description_variants": description_variants,
        }]}},
    )


@mcp.tool(name="cv_document.upsert_project_entry")
async def cv_document_upsert_project_entry(
    user_id: int,
    entry_key: str,
    title_variants: list[str],
    description_variants: list[str],
) -> dict[str, Any]:
    return await upsert_entry_tool(user_id, "projects", entry_key, title_variants, description_variants)


@mcp.tool(name="cv_document.upsert_education_entry")
async def cv_document_upsert_education_entry(
    user_id: int,
    entry_key: str,
    title_variants: list[str],
    description_variants: list[str],
) -> dict[str, Any]:
    return await upsert_entry_tool(user_id, "education", entry_key, title_variants, description_variants)


@mcp.tool(name="cv_document.upsert_hackathon_entry")
async def cv_document_upsert_hackathon_entry(
    user_id: int,
    entry_key: str,
    title_variants: list[str],
    description_variants: list[str],
) -> dict[str, Any]:
    return await upsert_entry_tool(user_id, "hackathons", entry_key, title_variants, description_variants)


@mcp.tool(name="cv_document.add_skills")
async def cv_document_add_skills(user_id: int, items: list[str]) -> dict[str, Any]:
    return await cv_document_apply_patch(user_id, {"skills": {"append_items": items}})


@mcp.tool(name="cv_document.add_interests")
async def cv_document_add_interests(user_id: int, items: list[str]) -> dict[str, Any]:
    return await cv_document_apply_patch(user_id, {"interests": {"append_items": items}})


@mcp.tool(name="cv_document.remove_variant")
async def cv_document_remove_variant(
    user_id: int,
    section: FlatVariantSection | EntrySection,
    index: int,
    entry_key: str | None = None,
    entry_field: EntryField | None = None,
) -> dict[str, Any]:
    await ensure_db()
    row = await db.get_cv_document(user_id)
    try:
        if section in ("title", "summary"):
            after, message = remove_flat_variant(row["data"], section, index)  # type: ignore[arg-type]
        else:
            if entry_key is None or entry_field is None:
                return operation_error("entry_key and entry_field are required for entry sections", row["data"])
            after, message = remove_entry_variant(row["data"], section, entry_key, entry_field, index)  # type: ignore[arg-type]
    except Exception as error:
        return operation_error(str(error), row["data"])
    valid, errors = validate_document(after)
    if not valid:
        return {"saved": False, "valid": False, "errors": errors, "data": row["data"], "summary": [message]}
    saved = await db.save_cv_document(user_id, after)
    return {"saved": True, "valid": True, "errors": [], "data": saved["data"], "summary": [message]}


@mcp.tool(name="cv_document.remove_entry")
async def cv_document_remove_entry(user_id: int, section: EntrySection, entry_key: str) -> dict[str, Any]:
    await ensure_db()
    row = await db.get_cv_document(user_id)
    try:
        after, message = remove_entry_from_document(row["data"], section, entry_key)
    except Exception as error:
        return operation_error(str(error), row["data"])
    valid, errors = validate_document(after)
    if not valid:
        return {"saved": False, "valid": False, "errors": errors, "data": row["data"], "summary": [message]}
    saved = await db.save_cv_document(user_id, after)
    return {"saved": True, "valid": True, "errors": [], "data": saved["data"], "summary": [message]}


@mcp.tool(name="cv_document.remove_list_item")
async def cv_document_remove_list_item(user_id: int, section: ListSectionName, index: int) -> dict[str, Any]:
    await ensure_db()
    row = await db.get_cv_document(user_id)
    try:
        after, message = remove_list_item_from_document(row["data"], section, index)
    except Exception as error:
        return operation_error(str(error), row["data"])
    valid, errors = validate_document(after)
    if not valid:
        return {"saved": False, "valid": False, "errors": errors, "data": row["data"], "summary": [message]}
    saved = await db.save_cv_document(user_id, after)
    return {"saved": True, "valid": True, "errors": [], "data": saved["data"], "summary": [message]}


@mcp.tool(name="cv_document.bulk_upsert")
async def cv_document_bulk_upsert(user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        patch = make_bulk_patch(payload)
    except Exception as error:
        return operation_error(str(error))
    return await cv_document_apply_patch(user_id, patch.model_dump(mode="json"))


if __name__ == "__main__":
    host = os.getenv("MCP_HOST", "0.0.0.0")
    port = int(os.getenv("MCP_PORT", "8002"))
    mcp.settings.host = host
    mcp.settings.port = port
    mcp.run(transport=os.getenv("MCP_TRANSPORT", "streamable-http"))
