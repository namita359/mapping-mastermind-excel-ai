
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from database_split import (
    get_db_connection, 
    search_metadata_split_tables, 
    get_all_malcodes_split_tables,
    get_tables_by_malcode_split_tables,
    get_columns_by_table_split_tables
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/metadata", tags=["metadata"])

@router.get("/search")
async def search_metadata(term: str = Query(..., description="Search term")):
    """Search metadata across malcodes, tables, and columns using split table structure"""
    try:
        with get_db_connection() as conn:
            results = search_metadata_split_tables(conn, term)
            logger.info(f"Found {len(results)} metadata search results for term: {term}")
            return {"results": results}
    except Exception as e:
        logger.error(f"Failed to search metadata in split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search metadata: {str(e)}")

@router.get("/malcodes")
async def get_all_malcodes():
    """Get all malcodes from split table structure"""
    try:
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_split_tables(conn)
            logger.info(f"Retrieved {len(malcodes)} malcodes from split tables")
            return {"malcodes": malcodes}
    except Exception as e:
        logger.error(f"Failed to get malcodes from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get malcodes: {str(e)}")

@router.get("/malcodes/{malcode}")
async def get_malcode_by_name(malcode: str):
    """Get a specific malcode by name from split table structure"""
    try:
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_split_tables(conn)
            found_malcode = next((m for m in malcodes if m['malcode'] == malcode), None)
            
            if not found_malcode:
                raise HTTPException(status_code=404, detail="Malcode not found")
            
            return found_malcode
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get malcode from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get malcode: {str(e)}")

@router.get("/tables")
async def get_tables(malcode_id: Optional[str] = Query(None), table_name: Optional[str] = Query(None)):
    """Get tables from split table structure, optionally filtered by malcode_id and table_name"""
    try:
        with get_db_connection() as conn:
            if malcode_id and not table_name:
                # Get malcode by ID first
                malcodes = get_all_malcodes_split_tables(conn)
                target_malcode = next((m for m in malcodes if m['id'] == malcode_id), None)
                
                if not target_malcode:
                    return {"tables": []}
                
                tables = get_tables_by_malcode_split_tables(conn, target_malcode['malcode'])
            else:
                # Return empty for now - would need more complex logic for other cases
                tables = []
            
            logger.info(f"Retrieved {len(tables)} tables from split tables")
            return {"tables": tables}
    except Exception as e:
        logger.error(f"Failed to get tables from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tables: {str(e)}")

@router.get("/columns")
async def get_columns(table_id: Optional[str] = Query(None)):
    """Get columns from split table structure, optionally filtered by table_id"""
    try:
        with get_db_connection() as conn:
            # For split table structure, this would need complex mapping
            # Simplified implementation for now
            columns = []
            
            logger.info(f"Retrieved {len(columns)} columns from split tables")
            return {"columns": columns}
    except Exception as e:
        logger.error(f"Failed to get columns from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get columns: {str(e)}")

@router.post("/malcodes")
async def create_malcode(malcode_data: dict):
    """Create a new malcode (placeholder - would need implementation for split tables)"""
    logger.info(f"Create malcode requested for split tables: {malcode_data}")
    raise HTTPException(status_code=501, detail="Create malcode not implemented for split table structure")

@router.post("/tables")
async def create_table(table_data: dict):
    """Create a new table (placeholder - would need implementation for split tables)"""
    logger.info(f"Create table requested for split tables: {table_data}")
    raise HTTPException(status_code=501, detail="Create table not implemented for split table structure")

@router.post("/columns")
async def create_column(column_data: dict):
    """Create a new column (placeholder - would need implementation for split tables)"""
    logger.info(f"Create column requested for split tables: {column_data}")
    raise HTTPException(status_code=501, detail="Create column not implemented for split table structure")
