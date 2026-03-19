import pytest
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
from src.parser import (
    extract_text_from_pdf,
    analyze_document_stream,
    build_graph_and_suggestions,
)
from src.models import (
    ExtractedLegislation,
    ExtractedChapter,
    ExtractedDefinition,
    ExtractedChange,
    ExtractedSection,
    ExtractedSubSection,
    ExtractedComplianceTask,
    ExtractedPenalty,
)


@pytest.fixture
def mock_extracted_legislation() -> ExtractedLegislation:
    return ExtractedLegislation(
        name="Test Act",
        short_name="TA",
        year=2024,
        document_type="Act",
        summary="Test Summary",
        chapters=[
            ExtractedChapter(
                chapter_number="I",
                chapter_name="Preliminary",
                summary="Chapter summary",
                sections=[
                    ExtractedSection(
                        section_number="1",
                        title="Short title",
                        summary="Section summary",
                        full_text="Full text of section 1",
                        sub_sections=[
                            ExtractedSubSection(
                                sub_section_number="1",
                                full_text="Sub 1 full_text",
                                summary="Sub 1 summary",
                                compliance_tasks=[
                                    ExtractedComplianceTask(
                                        task="Task 1",
                                        due_logic="Logic",
                                        severity="High",
                                    )
                                ],
                            )
                        ],
                        compliance_tasks=[],
                        penalties=[
                            ExtractedPenalty(
                                description="Fine",
                                fine_amount="1000",
                                imprisonment="None",
                            )
                        ],
                    )
                ],
            )
        ],
        definitions=[
            ExtractedDefinition(term="Test", definition="Def", section_ref="2")
        ],
        key_changes=[
            ExtractedChange(
                difference_type="Addition",
                description="New",
                previous_reference="N/A",
                new_reference="1",
            )
        ],
        repealed_acts=["Old Act"],
    )


def test_extract_text_from_pdf(mocker: Any) -> None:
    mock_doc = MagicMock()
    mock_page = MagicMock()
    mock_page.get_text.return_value = "Page text"

    # Mocking context manager and iteration
    mock_doc.__enter__.return_value = mock_doc
    mock_doc.__exit__.return_value = None
    mock_doc.__iter__.return_value = [mock_page]
    mock_doc.__len__.return_value = 1

    with patch("fitz.open", return_value=mock_doc):
        text, count = extract_text_from_pdf("dummy.pdf")
        assert "Page text" in text
        assert count == 1


@pytest.mark.asyncio
async def test_analyze_document_stream(
    mocker: Any, mock_extracted_legislation: ExtractedLegislation
) -> None:
    mock_response = MagicMock()
    mock_response.text = mock_extracted_legislation.model_dump_json()

    with patch("src.parser._client") as mock_client:

        from collections.abc import AsyncGenerator
        async def mock_stream_gen() -> AsyncGenerator[Any, None]:
            yield mock_response

        mock_client.aio.models.generate_content_stream = AsyncMock(
            return_value=mock_stream_gen()
        )

        chunks = [chunk async for chunk in analyze_document_stream("doc1", "raw text")]

        assert len(chunks) > 0
        mock_client.aio.models.generate_content_stream.assert_called_once()


@pytest.mark.asyncio
async def test_build_graph_and_suggestions(
    mocker: Any, mock_extracted_legislation: Any
) -> None:
    mock_graph_stats = {"nodes": 10, "relationships": 5}
    mock_analysis = MagicMock()
    mock_analysis.id = "analysis1"

    with (
        patch("src.parser.create_document_tree", new_callable=AsyncMock) as mock_tree,
        patch("src.parser.db") as mock_db,
        patch("src.parser.record_audit", new_callable=AsyncMock) as mock_audit,
    ):
        mock_tree.return_value = mock_graph_stats
        mock_db.documentanalysis.create = AsyncMock(return_value=mock_analysis)
        mock_db.documentsuggestion.create = AsyncMock()

        result = await build_graph_and_suggestions("doc1", mock_extracted_legislation)

        assert result["analysis_id"] == "analysis1"
        assert result["graph_stats"] == mock_graph_stats
        # 1 (Legislation) + 1 (Change) + 1 (Provision) + 1 (Compliance) + 1 (Penalty) + 1 (Repeal) + 1 (Definition) = 7
        assert result["suggestion_count"] == 7

        assert mock_tree.called
        assert mock_db.documentanalysis.create.called
        assert mock_db.documentsuggestion.create.call_count == 7
        assert mock_audit.called
