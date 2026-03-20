import os
import json
import asyncio
import httpx
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

async def ingest_file(client: httpx.AsyncClient, file_path: Path):
    """Reads a JSON file outputted by the Extractor Agent and posts it to the FastAPI backend."""
    logger.info(f"Ingesting {file_path.name}...")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            payload = json.load(f)
            
        # The payload should match the BulkImportPayload schema
        response = await client.post(
            f"{API_BASE_URL}/documents/import",
            json=payload,
            timeout=120.0 # Bulk imports can take time
        )
        
        if response.status_code in (200, 201):
            data = response.json()
            logger.info(f"✅ Successfully imported {file_path.name}: Document ID {data.get('document_id')} with {data.get('total_units_created')} units created.")
        else:
            logger.error(f"❌ Failed to import {file_path.name}: [{response.status_code}] {response.text}")
            
    except Exception as e:
        logger.error(f"🔥 Exception processing {file_path.name}: {e}")

async def main():
    """Iterates through the extractor outputs directory and ingests all JSONs."""
    output_dir = Path("outputs")
    if not output_dir.exists():
        logger.warning(f"Output directory '{output_dir.absolute()}' does not exist. Nothing to ingest.")
        return
        
    json_files = list(output_dir.glob("*.json"))
    if not json_files:
        logger.warning(f"No JSON files found in {output_dir.absolute()}")
        return
        
    logger.info(f"Found {len(json_files)} files to ingest. Starting pipeline...")
    
    async with httpx.AsyncClient() as client:
        # We process sequentially to avoid overwhelming the database with concurrent bulk inserts
        for file_path in sorted(json_files):
            await ingest_file(client, file_path)
            
    logger.info("Ingestion pipeline completed.")

if __name__ == "__main__":
    asyncio.run(main())
