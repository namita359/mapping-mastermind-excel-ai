
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from database_split import (
    get_db_connection, 
    search_metadata_split_tables, 
    get_all_malcodes_split_tables,
    get_tables_by_malcode_split_tables,
    get_columns_by_table_split_tables,
    create_malcode_metadata_split_tables,
    create_table_metadata_split_tables,
    create_column_metadata_split_tables
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
            if table_id:
                # Parse table_id to extract malcode and table_name
                # Table ID format: "table_{hash(malcode_tablename)}"
                # We need to reverse lookup from all malcodes and tables
                malcodes = get_all_malcodes_split_tables(conn)
                columns = []
                
                for malcode_data in malcodes:
                    tables = get_tables_by_malcode_split_tables(conn, malcode_data['malcode'])
                    for table in tables:
                        if table['id'] == table_id:
                            columns = get_columns_by_table_split_tables(conn, malcode_data['malcode'], table['table_name'])
                            break
                    if columns:
                        break
            else:
                columns = []
            
            logger.info(f"Retrieved {len(columns)} columns from split tables")
            return {"columns": columns}
    except Exception as e:
        logger.error(f"Failed to get columns from split tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get columns: {str(e)}")

@router.post("/malcodes")
async def create_malcode(malcode_data: dict):
    """Create a new malcode"""
    try:
        malcode = malcode_data.get('malcode')
        description = malcode_data.get('description', '')
        created_by = malcode_data.get('created_by', 'system')
        
        if not malcode:
            raise HTTPException(status_code=400, detail="Malcode is required")
        
        with get_db_connection() as conn:
            malcode_id = create_malcode_metadata_split_tables(conn, malcode, description, created_by)
            logger.info(f"Created malcode: {malcode}")
            return {"id": malcode_id, "message": "Malcode created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create malcode: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create malcode: {str(e)}")

@router.post("/tables")
async def create_table(table_data: dict):
    """Create a new table"""
    try:
        malcode_id = table_data.get('malcode_id')
        table_name = table_data.get('table_name')
        description = table_data.get('description', '')
        created_by = table_data.get('created_by', 'system')
        
        if not malcode_id or not table_name:
            raise HTTPException(status_code=400, detail="Malcode ID and table name are required")
        
        # Get malcode by ID
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_split_tables(conn)
            target_malcode = next((m for m in malcodes if m['id'] == malcode_id), None)
            
            if not target_malcode:
                raise HTTPException(status_code=404, detail="Malcode not found")
            
            table_id = create_table_metadata_split_tables(conn, target_malcode['malcode'], table_name, description, created_by)
            logger.info(f"Created table: {table_name} for malcode: {target_malcode['malcode']}")
            return {"id": table_id, "message": "Table created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create table: {str(e)}")

@router.post("/columns")
async def create_column(column_data: dict):
    """Create a new column"""
    try:
        table_id = column_data.get('table_id')
        column_name = column_data.get('column_name')
        data_type = column_data.get('data_type', 'string')
        description = column_data.get('business_description', '')
        is_primary_key = column_data.get('is_primary_key', False)
        is_nullable = column_data.get('is_nullable', True)
        default_value = column_data.get('default_value')
        created_by = column_data.get('created_by', 'system')
        
        if not table_id or not column_name:
            raise HTTPException(status_code=400, detail="Table ID and column name are required")
        
        # Find the malcode and table for this table_id
        with get_db_connection() as conn:
            malcodes = get_all_malcodes_split_tables(conn)
            target_malcode = None
            target_table = None
            
            for malcode_data in malcodes:
                tables = get_tables_by_malcode_split_tables(conn, malcode_data['malcode'])
                for table in tables:
                    if table['id'] == table_id:
                        target_malcode = malcode_data['malcode']
                        target_table = table['table_name']
                        break
                if target_malcode:
                    break
            
            if not target_malcode or not target_table:
                raise HTTPException(status_code=404, detail="Table not found")
            
            column_id = create_column_metadata_split_tables(
                conn, target_malcode, target_table, column_name, 
                data_type, description, is_primary_key, is_nullable, default_value, created_by
            )
            logger.info(f"Created column: {column_name} for table: {target_malcode}.{target_table}")
            return {"id": column_id, "message": "Column created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create column: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create column: {str(e)}")
