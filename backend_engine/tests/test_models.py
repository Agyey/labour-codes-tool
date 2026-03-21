import pytest
from datetime import datetime, timezone
from pydantic import ValidationError
from src.models import (
    DocumentStatus,
    SuggestionType,
    SuggestionStatus,
    ExtractedComplianceTask,
    ExtractedLegislation,
    AuditEntry,
    SuggestionResponse,
    ExtractedChapter,
    ExtractedSection,
    ExtractedSubSection,
    ExtractedPenalty,
)


def test_document_status_enum() -> None:
    assert DocumentStatus.UPLOADED.value == "uploaded"
    assert DocumentStatus.ANALYZED.value == "analyzed"
    assert DocumentStatus.ERROR.value == "error"


def test_suggestion_status_enum() -> None:
    assert SuggestionStatus.PENDING.value == "pending"
    assert SuggestionStatus.APPROVED.value == "approved"


def test_suggestion_response_validation() -> None:
    # Valid
    resp = SuggestionResponse(
        id="sug1",
        document_id="doc1",
        type=SuggestionType.CREATE_LEGISLATION,
        target_module="db",
        suggested_data={"foo": "bar"},
        confidence=0.95,
        status=SuggestionStatus.PENDING,
        created_at=datetime.now(timezone.utc),
    )
    assert resp.type == SuggestionType.CREATE_LEGISLATION


def test_extracted_compliance_task_validation() -> None:
    # Valid
    task = ExtractedComplianceTask(
        task="Submit Form 1", due_logic="Within 30 days", severity="high"
    )
    assert task.task == "Submit Form 1"

    # Missing required fields
    with pytest.raises(ValidationError):
        # Missing due_logic
        ExtractedComplianceTask(task="Missing due_logic", severity="high")  # type: ignore


def test_extracted_legislation_edge_cases() -> None:
    # Minimal valid
    leg = ExtractedLegislation(
        name="Test Act", short_name="TA", year=2024, summary="Summary test"
    )
    assert leg.name == "Test Act"
    assert leg.chapters == []

    # Type coercion: year as string should work if Pydantic coerces it
    leg2 = ExtractedLegislation(
        name="Test Act",
        short_name="TA",
        year=2024,
        summary="Summary test",
        document_type="act",
    )
    assert leg2.year == 2024

    # Invalid year type that cannot be coerced
    with pytest.raises(ValidationError):
        ExtractedLegislation(
            name="Test Act",
            short_name="TA",
            year="invalid",  # type: ignore
            summary="Summary",
        )


def test_audit_entry_validation() -> None:
    # Valid
    entry = AuditEntry(
        action="CREATE",
        entity_type="provision",
        entity_id="p1",
        data_hash="abc123hash",
        previous_hash="000...000",
        user_id="user1",
        timestamp=datetime.now(timezone.utc),
    )
    assert entry.action == "CREATE"

    # Missing required fields
    with pytest.raises(ValidationError):
        AuditEntry(
            action="MISSING_FIELDS",
            entity_type="provision",
            previous_hash="prev",
            timestamp=datetime.now(timezone.utc),
        )  # type: ignore

    _ = AuditEntry(
        action="CREATE",
        entity_type="T",
        entity_id="E",
        data_hash="1",
        previous_hash="0",
        timestamp=datetime.now(timezone.utc),
    )


def test_extracted_section_complex_nesting() -> None:
    # Verifying deeply nested Pydantic arrays conform to strict schemas natively
    section = ExtractedSection(
        section_number="42",
        title="Offences by Companies",
        full_text="Where an offence is committed by a company...",
        summary="Company liability parameters",
        sub_sections=[
            ExtractedSubSection(
                sub_section_number="1", full_text="Subtext", summary="Subtext summary"
            )
        ],
        compliance_tasks=[],
        penalties=[ExtractedPenalty(description="Fine up to 1 Lakh")],
    )
    assert len(section.sub_sections) == 1
    assert section.sub_sections[0].sub_section_number == "1"
    assert len(section.penalties) == 1
    assert section.penalties[0].description == "Fine up to 1 Lakh"


def test_invalid_array_types_rejected() -> None:
    # Verifying strict boundaries catch malformed downstream mappings
    with pytest.raises(ValidationError):
        ExtractedChapter(
            chapter_number="IX",
            chapter_name="Penalties",
            summary="Penalty summary",
            sections=[
                "This is a string, not an ExtractedSection object"  # type: ignore
            ],
        )
