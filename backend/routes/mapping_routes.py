
import json
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException

from database_split import (
    get_db_connection, 
    save_mapping_file_to_split_tables, 
    load_mapping_files_from_split_tables,
    update_mapping_row_status_split_tables,
    add_mapping_row_comment_split_tables
)
from models import MappingFileRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["mapping"])

@router.post("/mapping-files")
async def create_mapping_file(mapping_file: MappingFileRequest):
    """Create or update a mapping file using split table structure"""
    try:
        with get_db_connection() as conn:
            file_id = save_mapping_file_to_split_tables(conn, mapping_file)
            logger.info(f"Mapping file saved successfully to split tables: {mapping_file.name}")
            return {"id": file_id, "message": "Mapping file saved successfully to split tables"}
    except Exception as e:
        logger.error(f"Failed to save mapping file to split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save mapping file: {str(e)}")

@router.get("/mapping-files")
async def get_mapping_files():
    """Get all mapping files from split table structure"""
    try:
        with get_db_connection() as conn:
            files = load_mapping_files_from_split_tables(conn)
            logger.info(f"Loaded {len(files)} mapping files from split tables")
            return {"files": files}
    except Exception as e:
        logger.error(f"Failed to load mapping files from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load mapping files: {str(e)}")

@router.put("/mapping-rows/{row_id}/status")
async def update_row_status(row_id: str, status_data: dict):
    """Update mapping row status in split table structure"""
    try:
        status = status_data.get("status")
        reviewer = status_data.get("reviewer")
        
        with get_db_connection() as conn:
            update_mapping_row_status_split_tables(conn, row_id, status, reviewer)
            return {"message": "Status updated successfully in split tables"}
    except Exception as e:
        logger.error(f"Failed to update row status in split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update row status: {str(e)}")

@router.post("/mapping-rows/{row_id}/comments")
async def add_row_comment(row_id: str, comment_data: dict):
    """Add comment to mapping row in split table structure"""
    try:
        comment = comment_data.get("comment", "")
        
        with get_db_connection() as conn:
            add_mapping_row_comment_split_tables(conn, row_id, comment)
            return {"message": "Comment added successfully to split tables"}
    except Exception as e:
        logger.error(f"Failed to add comment to split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")
