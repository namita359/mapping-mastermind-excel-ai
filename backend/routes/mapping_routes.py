
import json
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException

from database import get_db_connection, save_mapping_file_to_db, load_mapping_files_from_db
from models import MappingFileRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["mapping"])

@router.post("/mapping-files")
async def create_mapping_file(mapping_file: MappingFileRequest):
    """Create or update a mapping file"""
    try:
        with get_db_connection() as conn:
            file_id = save_mapping_file_to_db(conn, mapping_file)
            logger.info(f"Mapping file saved successfully: {mapping_file.name}")
            return {"id": file_id, "message": "Mapping file saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save mapping file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save mapping file: {str(e)}")

@router.get("/mapping-files")
async def get_mapping_files():
    """Get all mapping files"""
    try:
        with get_db_connection() as conn:
            files = load_mapping_files_from_db(conn)
            logger.info(f"Loaded {len(files)} mapping files")
            return {"files": files}
    except Exception as e:
        logger.error(f"Failed to load mapping files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load mapping files: {str(e)}")

@router.put("/mapping-rows/{row_id}/status")
async def update_row_status(row_id: str, status: str, reviewer: Optional[str] = None):
    """Update mapping row status"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE mapping_rows 
                SET status = ?, reviewer = ?, reviewed_at = GETDATE(), updated_at = GETDATE()
                WHERE id = ?
            """, (status, reviewer, row_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Mapping row not found")
            
            conn.commit()
            return {"message": "Status updated successfully"}
    except Exception as e:
        logger.error(f"Failed to update row status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update row status: {str(e)}")

@router.post("/mapping-rows/{row_id}/comments")
async def add_row_comment(row_id: str, comment: dict):
    """Add comment to mapping row"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get current comments
            cursor.execute("SELECT comments FROM mapping_rows WHERE id = ?", (row_id,))
            result = cursor.fetchone()
            
            if not result:
                raise HTTPException(status_code=404, detail="Mapping row not found")
            
            current_comments = json.loads(result[0]) if result[0] else []
            current_comments.append(comment.get("comment", ""))
            
            # Update with new comments
            cursor.execute("""
                UPDATE mapping_rows 
                SET comments = ?, updated_at = GETDATE()
                WHERE id = ?
            """, (json.dumps(current_comments), row_id))
            
            conn.commit()
            return {"message": "Comment added successfully"}
    except Exception as e:
        logger.error(f"Failed to add comment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")
