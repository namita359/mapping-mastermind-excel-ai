
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from ddl_manager import create_tables, create_metadata_tables, create_single_mapping_table, drop_tables, verify_tables, execute_custom_sql

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ddl", tags=["ddl"])

class CustomSQLRequest(BaseModel):
    sql_script: str

class DDLResponse(BaseModel):
    success: bool
    message: str
    results: List[Dict[str, Any]]

@router.post("/create-tables", response_model=DDLResponse)
async def create_database_tables():
    """Create all database tables using create_tables.sql"""
    try:
        results = create_tables()
        return DDLResponse(
            success=True,
            message="Tables created successfully",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to create tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create tables: {str(e)}")

@router.post("/create-metadata-tables", response_model=DDLResponse)
async def create_metadata_database_tables():
    """Create metadata tables using create_metadata_tables.sql"""
    try:
        results = create_metadata_tables()
        return DDLResponse(
            success=True,
            message="Metadata tables created successfully",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to create metadata tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create metadata tables: {str(e)}")

@router.post("/create-single-mapping-table", response_model=DDLResponse)
async def create_single_mapping_database_table():
    """Create single mapping table using create_single_mapping_table.sql"""
    try:
        results = create_single_mapping_table()
        return DDLResponse(
            success=True,
            message="Single mapping table created successfully",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to create single mapping table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create single mapping table: {str(e)}")

@router.post("/drop-tables", response_model=DDLResponse)
async def drop_database_tables():
    """Drop all database tables using drop_tables.sql"""
    try:
        results = drop_tables()
        return DDLResponse(
            success=True,
            message="Tables dropped successfully",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to drop tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to drop tables: {str(e)}")

@router.get("/verify-tables", response_model=DDLResponse)
async def verify_database_tables():
    """Verify database tables using verify_tables.sql"""
    try:
        results = verify_tables()
        return DDLResponse(
            success=True,
            message="Table verification completed",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to verify tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify tables: {str(e)}")

@router.post("/execute-sql", response_model=DDLResponse)
async def execute_custom_sql_script(request: CustomSQLRequest):
    """Execute custom SQL script"""
    try:
        results = execute_custom_sql(request.sql_script)
        return DDLResponse(
            success=True,
            message="SQL script executed successfully",
            results=results
        )
    except Exception as e:
        logger.error(f"Failed to execute SQL script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute SQL script: {str(e)}")

@router.get("/health")
async def ddl_health_check():
    """Check if DDL operations are available"""
    try:
        from database import get_db_connection
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            return {"status": "healthy", "message": "DDL operations available"}
    except Exception as e:
        logger.error(f"DDL health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DDL operations unavailable: {str(e)}")
