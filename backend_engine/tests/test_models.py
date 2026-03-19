import pytest
from datetime import datetime
from pydantic import ValidationError

from src.models import (
    DocumentStatus,
    SuggestionType,
    SuggestionStatus,
    ExtractedComplianceTask,
    ExtractedLegislation,
    DocumentResponse,
    AuditEntry,
    ExtractedChapter,
    ExtractedSection,
)


def test_enums():
    assert DocumentStatus.UPLOADED == "uploaded"
    assert SuggestionType.CREATE_LEGISLATION == "create_legislation"
    assert SuggestionStatus.PENDING == "pending"
    # Negative test for enum
    with pytest.raises(ValidationError):
        # We need a model that uses the enum to trigger validation
        # SuggestionResponse uses SuggestionType and SuggestionStatus
        from src.models import SuggestionResponse
        SuggestionResponse(
            id="1",
            document_id="doc1",
            type="invalid_type",
            target_module="test",
            suggested_data={},
            confidence=0.9,
            status=SuggestionStatus.PENDING,
            created_at=datetime.now()
        )


def test_extracted_compliance_task_validation():
    # Happy path
    task = ExtractedComplianceTask(
        task="File return", due_logic="Monthly", severity="high"
    )
    assert task.task == "File return"
    
    # Missing required fields
    with pytest.raises(ValidationError):
        ExtractedComplianceTask(task="Missing due_logic")


def test_extracted_legislation_edge_cases():
    # Happy path
    leg = ExtractedLegislation(
        name="Test Act", short_name="TA", year=2024, summary="Summary test"
    )
    assert leg.name == "Test Act"
    assert leg.document_type == "act"
    assert leg.chapters == []

    # Type coercion: year as string should work if Pydantic coerces it
    leg2 = ExtractedLegislation(
        name="Test Act", short_name="TA", year="2024", summary="Summary test"
    )
    assert leg2.year == 2024

    # Invalid year type that cannot be coerced
    with pytest.raises(ValidationError):
        ExtractedLegislation(
            name="Test Act", short_name="TA", year="not-a-year", summary="Summary test"
        )


def test_nested_model_integrity():
    # Test nested chapters and sections
    section = ExtractedSection(
        section_number="1",
        title="Definitions",
        full_text="Some long text...",
        summary="Short summary"
    )
    chapter = ExtractedChapter(
        chapter_number="I",
        chapter_name="Preliminary",
        summary="Prelim summary",
        sections=[section]
    )
    assert len(chapter.sections) == 1
    assert chapter.sections[0].section_number == "1"


def test_response_models():
    doc = DocumentResponse(
        id="123",
        name="doc.pdf",
        file_name="doc.pdf",
        file_size=1024,
        page_count=5,
        status=DocumentStatus.UPLOADED,
        uploaded_at=datetime.now(),
    )
    assert doc.id == "123"


def test_audit_entry_validation():
    # Error: Missing user_id is fine (None), but action is required
    with pytest.raises(ValidationError):
        AuditEntry(
            entity_type="type",
            entity_id="id1",
            data_hash="hash",
            previous_hash="prev",
            timestamp=datetime.now(),
        )
