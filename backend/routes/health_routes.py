
import logging
from fastapi import APIRouter

from database import get_db_connection
from config import get_openai_client

logger = logging.getLogger(__name__)
router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "disconnected"
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
    
    client = get_openai_client()
    
    return {
        "status": "healthy",
        "service": "Data Mapping Backend API",
        "database": db_status,
        "openai": "configured" if client else "not configured"
    }
