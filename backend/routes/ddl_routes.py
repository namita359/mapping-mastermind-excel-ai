
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from ddl_manager import (
    create_tables, 
    create_metadata_tables, 
    create_single_mapping_table, 
    drop_tables, 
    verify_tables, 
    execute_custom_sql
)

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
        logger.info("Starting table creation process")
        results = create_tables()
        return DDLResponse(
            success=True,
            message="Tables created successfully",
            results=results
        )
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise HTTPException(
            status_code=404, 
            detail=f"SQL file not found. Please ensure create_tables.sql exists in the sql directory. Error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to create tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create tables: {str(e)}")

@router.post("/create-metadata-tables", response_model=DDLResponse)
async def create_metadata_database_tables():
    """Create metadata tables using create_metadata_tables.sql"""
    try:
        logger.info("Starting metadata table creation process")
        results = create_metadata_tables()
        return DDLResponse(
            success=True,
            message="Metadata tables created successfully",
            results=results
        )
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise HTTPException(
            status_code=404, 
            detail=f"SQL file not found. Please ensure create_metadata_tables.sql exists in the sql directory. Error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to create metadata tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create metadata tables: {str(e)}")

@router.post("/create-single-mapping-table", response_model=DDLResponse)
async def create_single_mapping_database_table():
    """Create single mapping table using create_single_mapping_table.sql"""
    try:
        logger.info("Starting single mapping table creation process")
        results = create_single_mapping_table()
        return DDLResponse(
            success=True,
            message="Single mapping table created successfully",
            results=results
        )
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise HTTPException(
            status_code=404, 
            detail=f"SQL file not found. Please ensure create_single_mapping_table.sql exists in the sql directory. Error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to create single mapping table: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create single mapping table: {str(e)}")

@router.post("/drop-tables", response_model=DDLResponse)
async def drop_database_tables():
    """Drop all database tables using drop_tables.sql"""
    try:
        logger.info("Starting table drop process")
        results = drop_tables()
        return DDLResponse(
            success=True,
            message="Tables dropped successfully",
            results=results
        )
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise HTTPException(
            status_code=404, 
            detail=f"SQL file not found. Please ensure drop_tables.sql exists in the sql directory. Error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to drop tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to drop tables: {str(e)}")

@router.get("/verify-tables", response_model=DDLResponse)
async def verify_database_tables():
    """Verify database tables using verify_tables.sql"""
    try:
        logger.info("Starting table verification process")
        results = verify_tables()
        return DDLResponse(
            success=True,
            message="Table verification completed",
            results=results
        )
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise HTTPException(
            status_code=404, 
            detail=f"SQL file not found. Please ensure verify_tables.sql exists in the sql directory. Error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to verify tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify tables: {str(e)}")

@router.post("/execute-sql", response_model=DDLResponse)
async def execute_custom_sql_script(request: CustomSQLRequest):
    """Execute custom SQL script"""
    try:
        logger.info(f"Executing custom SQL script (length: {len(request.sql_script)} characters)")
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
        logger.info("Performing DDL health check")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return {"status": "healthy", "message": "DDL operations available"}
    except Exception as e:
        logger.error(f"DDL health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DDL operations unavailable: {str(e)}")

@router.get("/list-files")
async def list_sql_files():
    """List available SQL files for debugging with enhanced path information"""
    import os
    try:
        # Get the directory where ddl_manager.py is located (via import)
        import ddl_manager
        ddl_manager_dir = os.path.dirname(os.path.abspath(ddl_manager.__file__))
        
        sql_dir = os.path.join(ddl_manager_dir, "sql")
        
        files = {
            "current_working_directory": os.getcwd(),
            "ddl_manager_directory": ddl_manager_dir,
            "sql_directory_path": sql_dir,
            "sql_directory_exists": os.path.exists(sql_dir),
            "sql_files": [],
            "all_backend_files": []
        }
        
        # List SQL files
        if os.path.exists(sql_dir):
            files["sql_files"] = [f for f in os.listdir(sql_dir) if f.endswith('.sql')]
            
        # List all files in backend directory for debugging
        if os.path.exists(ddl_manager_dir):
            for root, dirs, filenames in os.walk(ddl_manager_dir):
                for filename in filenames:
                    rel_path = os.path.relpath(os.path.join(root, filename), ddl_manager_dir)
                    files["all_backend_files"].append(rel_path)
            
        return files
    except Exception as e:
        logger.error(f"Failed to list SQL files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list SQL files: {str(e)}")
