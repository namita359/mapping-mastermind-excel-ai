
import pyodbc
from contextlib import contextmanager
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    """Get database connection with proper error handling"""
    from config import AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USERNAME, AZURE_SQL_PASSWORD, get_database_connection_string
    
    if not all([AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USERNAME, AZURE_SQL_PASSWORD]):
        raise HTTPException(
            status_code=500, 
            detail="Database configuration is incomplete. Please set all required environment variables."
        )
    
    connection_string = get_database_connection_string()
    
    try:
        conn = pyodbc.connect(connection_string)
        yield conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
