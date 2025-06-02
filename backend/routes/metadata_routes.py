
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from database import (
    get_db_connection, 
    search_metadata_single_table, 
    get_all_malcodes_single_table,
    get_tables_by_malcode_single_table,
    get_columns_by_table_single_table
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/metadata", tags=["metadata"])

@router.get("/search")
async def search_metadata(term: str = Query(..., description="Search term")):
    """Search metadata across malcodes, tables, and columns using single table structure"""
    try:
        with get_db_connection() as conn:
            results = search_metadata_single_table(conn, term)
            logger.info(f"Found {len(results)} metadata search results for term: {term}")
            return {"results": results}
    except Exception as e:
        logger.error(f"Failed to search metadata in single table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search metadata: {str(e)}")

@router.get("/malcodes")
async def get_all_malcodes():
    """Get all malcodes from single table structure"""
    try:
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_single_table(conn)
            logger.info(f"Retrieved {len(malcodes)} malcodes from single table")
            return {"malcodes": malcodes}
    except Exception as e:
        logger.error(f"Failed to get malcodes from single table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get malcodes: {str(e)}")

@router.get("/malcodes/{malcode}")
async def get_malcode_by_name(malcode: str):
    """Get a specific malcode by name from single table structure"""
    try:
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_single_table(conn)
            found_malcode = next((m for m in malcodes if m['malcode'] == malcode), None)
            
            if not found_malcode:
                raise HTTPException(status_code=404, detail="Malcode not found")
            
            return found_malcode
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get malcode from single table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get malcode: {str(e)}")

@router.get("/tables")
async def get_tables(malcode_id: Optional[str] = Query(None), table_name: Optional[str] = Query(None)):
    """Get tables from single table structure, optionally filtered by malcode_id and table_name"""
    try:
        with get_db_connection() as conn:
            if malcode_id and not table_name:
                # Get malcode by ID first
                malcodes = get_all_malcodes_single_table(conn)
                target_malcode = next((m for m in malcodes if m['id'] == malcode_id), None)
                
                if not target_malcode:
                    return {"tables": []}
                
                tables = get_tables_by_malcode_single_table(conn, target_malcode['malcode'])
            else:
                # Return empty for now - would need more complex logic for other cases
                tables = []
            
            logger.info(f"Retrieved {len(tables)} tables from single table")
            return {"tables": tables}
    except Exception as e:
        logger.error(f"Failed to get tables from single table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tables: {str(e)}")

@router.get("/columns")
async def get_columns(table_id: Optional[str] = Query(None)):
    """Get columns from single table structure, optionally filtered by table_id"""
    try:
        with get_db_connection() as conn:
            if table_id:
                # Parse table_id to extract malcode and table_name
                # Table ID format: "table_{hash(malcode_tablename)}"
                # We need to reverse lookup from all malcodes and tables
                malcodes = get_all_malcodes_single_table(conn)
                columns = []
                
                for malcode_data in malcodes:
                    tables = get_tables_by_malcode_single_table(conn, malcode_data['malcode'])
                    for table in tables:
                        if table['id'] == table_id:
                            columns = get_columns_by_table_single_table(conn, malcode_data['malcode'], table['table_name'])
                            break
                    if columns:
                        break
            else:
                columns = []
            
            logger.info(f"Retrieved {len(columns)} columns from single table")
            return {"columns": columns}
    except Exception as e:
        logger.error(f"Failed to get columns from single table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get columns: {str(e)}")
