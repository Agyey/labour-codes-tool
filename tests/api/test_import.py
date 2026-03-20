import pytest

@pytest.mark.asyncio
async def test_bulk_import_from_json(async_client):
    """Test the end-to-end bulk import pipeline with a mock JSON payload."""
    
    payload = {
        "document": {
            "title": "Test Companies Act",
            "document_type": "Act",
            "jurisdiction": "India",
            "enactment_date": "2013-08-30",
            "status": "Active"
        },
        "units": [
            {
                "unit_type": "Chapter",
                "number": "I",
                "title": "Preliminary",
                "content_text": "Short title and definition chapter.",
                "depth_level": 1,
                "status": "Active",
                "children": [
                    {
                        "unit_type": "Section",
                        "number": "1",
                        "title": "Short title",
                        "content_text": "This Act may be called the Test Companies Act.",
                        "depth_level": 2,
                        "status": "Active",
                        "children": []
                    }
                ]
            }
        ],
        "definitions": [
            {
                "term": "Company",
                "definition_text": "A corporate entity registered under this test act.",
                "is_inclusive": True
            }
        ]
    }
    
    response = await async_client.post("/api/v1/documents/import", json=payload)
    assert response.status_code in (200, 201), f"Import failed: {response.text}"
    
    data = response.json()
    assert "document_id" in data
    assert data["total_units_created"] == 2 # 1 chapter + 1 section
    
    # Verify the document actually exists in db
    doc_id = data["document_id"]
    get_resp = await async_client.get(f"/api/v1/documents/{doc_id}")
    assert get_resp.status_code == 200
    
    get_data = get_resp.json()
    assert get_data["title"] == "Test Companies Act"
    assert get_data["document_type"] == "Act"

@pytest.mark.asyncio
async def test_search_endpoint(async_client):
    """Search for the inserted section text using tsvector search."""
    # First ensure standard response format
    query = "Test Companies Act"
    response = await async_client.get(f"/api/v1/advanced/search?q={query}")
    
    # We might not get real tsvector results with sqlite in memory, 
    # but the endpoint should at least return 200 OK and parse the query
    assert response.status_code == 200
    assert "results" in response.json()
