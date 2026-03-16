import pytest
from unittest.mock import AsyncMock, patch
from src.parser import (
    extract_text_from_pdf, analyze_document, build_graph_and_suggestions
)

def test_extract_text_from_pdf(mocker):
    # Mock PyMuPDF (fitz)
    class MockPage:
        def get_text(self):
            return "test page text"
            
    class MockDoc:
        def __init__(self):
            self.pages = [MockPage(), MockPage()]
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def __len__(self):
            return len(self.pages)
        def __iter__(self):
            return iter(self.pages)
            
    mocker.patch("fitz.open", return_value=MockDoc())
    text, count = extract_text_from_pdf("dummy.pdf")
    assert count == 2
    assert "test page text" in text

@pytest.mark.asyncio
async def test_analyze_document(mocker):
    mocker.patch("src.parser._client.aio.models.generate_content", new_callable=AsyncMock)
    
    # We don't want to actually run the genai request
    class MockResponse:
        text = '{"name": "test", "short_name": "t", "year": 2024, "summary": "s", "chapters": []}'
        
    mock_gen = mocker.patch("src.parser._client.aio.models.generate_content", new_callable=AsyncMock)
    mock_gen.return_value = MockResponse()
    
    res = await analyze_document("123", "raw_text")
    assert res.name == "test"
    assert res.year == 2024

@pytest.mark.asyncio
async def test_build_graph_and_suggestions(mocker):
    # Mock Neo4j creation
    mock_create_tree = mocker.patch("src.parser.create_document_tree", new_callable=AsyncMock)
    mock_create_tree.return_value = {"nodes": 10, "relationships": 5}
    
    # Mock postgres DB
    mock_db = mocker.patch("src.parser.db")
    class MockAnalysis:
        id = "analysis_id"
    mock_db.documentanalysis.create.return_value = MockAnalysis()
    mock_db.documentsuggestion.create.return_value = AsyncMock()
    
    # Mock audit chain
    mock_record_audit = mocker.patch("src.parser.record_audit", new_callable=AsyncMock)
    
    from src.models import ExtractedLegislation
    
    from src.models import (
        ExtractedLegislation, ExtractedChapter, ExtractedSection, 
        ExtractedSubSection, ExtractedComplianceTask, ExtractedPenalty, ExtractedChange, ExtractedDefinition
    )
    
    extracted = ExtractedLegislation(
        name="test",
        short_name="t",
        year=2024,
        document_type="act",
        summary="sum",
        chapters=[
            ExtractedChapter(
                chapter_number="I",
                chapter_name="Pre",
                summary="summary",
                sections=[
                    ExtractedSection(
                        section_number="1",
                        title="T1",
                        summary="S1",
                        full_text="F1",
                        sub_sections=[
                            ExtractedSubSection(
                                sub_section_number="a",
                                full_text="sub-f",
                                summary="sub-s",
                                compliance_tasks=[
                                    ExtractedComplianceTask(task="SubTask", due_logic="logic", severity="low")
                                ]
                            )
                        ],
                        compliance_tasks=[
                            ExtractedComplianceTask(task="Task1", due_logic="logic", severity="high")
                        ],
                        penalties=[
                            ExtractedPenalty(description="Fine", fine_amount="100", imprisonment="No")
                        ]
                    )
                ]
            )
        ],
        definitions=[
            ExtractedDefinition(term="Employer", definition="The boss", section_ref="s2")
        ],
        key_changes=[
            ExtractedChange(difference_type="Amendment", description="Changed something", previous_reference="Old Act", new_reference="New Act")
        ],
        penalties=[],
        effective_date="now",
        repealed_acts=["old act"]
    )
    
    res = await build_graph_and_suggestions("doc_123", extracted)
    assert res["analysis_id"] == "analysis_id"
    assert res["suggestion_count"] > 0
    mock_create_tree.assert_called_once()
    mock_record_audit.assert_called_once()
