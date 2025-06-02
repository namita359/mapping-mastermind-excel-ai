
import logging
from database import get_db_connection
from sql_executor import execute_sql_script
from table_operations import (
    create_tables,
    create_metadata_tables,
    create_single_mapping_table,
    create_single_metadata_table,
    drop_tables,
    verify_tables
)

logger = logging.getLogger(__name__)

def execute_custom_sql(sql_script: str):
    """Execute custom SQL script"""
    try:
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Custom SQL executed successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to execute custom SQL: {str(e)}")
        raise

# Re-export functions for backward compatibility
__all__ = [
    'create_tables',
    'create_metadata_tables', 
    'create_single_mapping_table',
    'create_single_metadata_table',
    'drop_tables',
    'verify_tables',
    'execute_custom_sql'
]
