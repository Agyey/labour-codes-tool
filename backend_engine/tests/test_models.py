import pytest
from datetime import datetime
from src.models import (
    DocumentStatus, SuggestionType, SuggestionStatus,
    ExtractedComplianceTask, ExtractedPenalty, ExtractedDefinition,
    ExtractedSubSection, ExtractedSection, ExtractedChapter,
    ExtractedChange, ExtractedLegislation, DocumentResponse,
    AnalysisResponse, SuggestionResponse, DocumentDetailResponse,
    AuditEntry
)

def test_enums():
    assert DocumentStatus.UPLOADED == "uploaded"
    assert SuggestionType.CREATE_LEGISLATION == "create_legislation"
    assert SuggestionStatus.PENDING == "pending"

def test_extracted_compliance_task():
    task = ExtractedComplianceTask(task="File return", due_logic="Monthly", severity="high")
    assert task.task == "File return"

def test_extracted_legislation():
    leg = ExtractedLegislation(
        name="Test Act",
        short_name="TA",
        year=2024,
        summary="Summary test"
    )
    assert leg.name == "Test Act"
    assert leg.document_type == "act"
    assert leg.chapters == []
    
def test_response_models():
    doc = DocumentResponse(
        id="123",
        name="doc.pdf",
        file_name="doc.pdf",
        file_size=1024,
        page_count=5,
        status=DocumentStatus.UPLOADED,
        uploaded_at=datetime.now()
    )
    assert doc.id == "123"

def test_audit_entry():
    entry = AuditEntry(
        action="test",
        entity_type="type",
        entity_id="id1",
        data_hash="hash",
        previous_hash="prev",
        timestamp=datetime.now()
    )
    assert entry.action == "test"
