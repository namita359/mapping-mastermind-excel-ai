
import os
import logging
from database import get_db_connection
from sql_file_manager import read_sql_file
from sql_executor import execute_sql_script

logger = logging.getLogger(__name__)

def create_tables():
    """Execute create_tables.sql script"""
    sql_file_path = os.path.join("sql", "create_tables.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Tables created successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to create tables: {str(e)}")
        raise

def create_metadata_tables():
    """Execute create_metadata_tables.sql script"""
    sql_file_path = os.path.join("sql", "create_metadata_tables.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Metadata tables created successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to create metadata tables: {str(e)}")
        raise

def create_single_mapping_table():
    """Execute create_single_mapping_table.sql script"""
    sql_file_path = os.path.join("sql", "create_single_mapping_table.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Single mapping table created successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to create single mapping table: {str(e)}")
        raise

def create_single_metadata_table():
    """Execute create_single_metadata_table.sql script"""
    sql_file_path = os.path.join("sql", "create_single_metadata_table.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Single metadata table created successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to create single metadata table: {str(e)}")
        raise

def drop_tables():
    """Execute drop_tables.sql script"""
    sql_file_path = os.path.join("sql", "drop_tables.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Tables dropped successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to drop tables: {str(e)}")
        raise

def verify_tables():
    """Execute verify_tables.sql script"""
    sql_file_path = os.path.join("sql", "verify_tables.sql")
    try:
        sql_script = read_sql_file(sql_file_path)
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, sql_script)
            logger.info("Table verification completed")
            return results
    except Exception as e:
        logger.error(f"Failed to verify tables: {str(e)}")
        raise
