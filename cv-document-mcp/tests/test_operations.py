from cv_document_mcp.operations import apply_patch_to_document, make_bulk_patch, remove_flat_variant
from cv_document_mcp.schemas import EMPTY_CV_DOCUMENT


def test_apply_patch_appends_without_duplicates():
    after, summary = apply_patch_to_document(
        EMPTY_CV_DOCUMENT,
        {
            "title": {"append_variants": [" Dev Backend ", "Dev Backend"]},
            "skills": {"append_items": ["Python", "Python", "PostgreSQL"]},
        },
    )

    assert after["cv"]["title"]["variants"] == ["Dev Backend"]
    assert after["cv"]["skills"]["items"] == ["Python", "PostgreSQL"]
    assert "Added 1 title variant(s)" in summary


def test_bulk_patch_upserts_project():
    patch = make_bulk_patch(
        {
            "projects": [
                {
                    "entry_key": "project-applyboard",
                    "title_variants": ["ApplyBoard"],
                    "description_variants": ["Plateforme de suivi de candidatures."],
                }
            ],
            "skills": ["React"],
        }
    )
    after, _ = apply_patch_to_document(EMPTY_CV_DOCUMENT, patch)

    project = after["cv"]["projects"]["project-applyboard"]
    assert project["title"]["variants"] == ["ApplyBoard"]
    assert project["description"]["variants"] == ["Plateforme de suivi de candidatures."]
    assert after["cv"]["skills"]["items"] == ["React"]


def test_remove_flat_variant():
    data, _ = apply_patch_to_document(
        EMPTY_CV_DOCUMENT,
        {"title": {"append_variants": ["A", "B"]}},
    )
    after, message = remove_flat_variant(data, "title", 0)

    assert after["cv"]["title"]["variants"] == ["B"]
    assert message.startswith("Removed title variant")
