import os
import shutil
import tempfile
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from loguru import logger
import uvicorn
from contextlib import asynccontextmanager
from typing import Optional

from src.database import db, connect_db, disconnect_db
from src.parser import process_pdf
from src.settings import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup Loguru
    logger.add("backend-engine.log", serialize=True, rotation="10 MB")
    
    # Connect Prisma
    await connect_db()
    logger.info("Database connection established.")
    
    yield
    
    # Disconnect Prisma
    await disconnect_db()
    logger.info("Database connection closed.")

app = FastAPI(title="Backend Engine", version="0.1.0", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok"}

async def run_parser_background(file_path: str, framework_id: str):
    logger.info("Running background parser...")
    try:
        await process_pdf(file_path, framework_id)
        logger.info(f"Finished parsing background task for {file_path}.")
    except Exception as e:
        logger.error(f"Failed to parse document: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/documents/upload")
async def upload_document(
    framework_id: str,
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")
        
    try:
        # Save temp file
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Received file: {file.filename}, Size: {os.path.getsize(file_path)} bytes. Parsing...")
        
        # Process synchronously
        extracted_data = await process_pdf(file_path, framework_id)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {
            "message": "Upload & auto-population successful.",
            "file_name": file.filename,
            "data": extracted_data.model_dump()
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(500, f"Error receiving upload: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
