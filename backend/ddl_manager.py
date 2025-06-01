
import os
import logging
from contextlib import contextmanager
from database import get_db_connection

logger = logging.getLogger(__name__)

def read_sql_file(file_path: str) -> str:
    """Read SQL content from file"""
    try:
        # Ensure the path is properly constructed
        if not os.path.isabs(file_path):
            # If it's a relative path, make it relative to the current working directory
            current_dir = os.getcwd()
            full_path = os.path.join(current_dir, file_path)
        else:
            full_path = file_path
            
        logger.info(f"Attempting to read SQL file: {full_path}")
        
        with open(full_path, 'r', encoding='utf-8') as file:
            content = file.read()
            logger.info(f"Successfully read {len(content)} characters from {full_path}")
            return content
            
    except FileNotFoundError:
        logger.error(f"SQL file not found: {full_path}")
        # Check if file exists in backend directory
        backend_path = os.path.join("backend", file_path)
        if os.path.exists(backend_path):
            logger.info(f"Found file in backend directory: {backend_path}")
            with open(backend_path, 'r', encoding='utf-8') as file:
                return file.read()
        else:
            raise FileNotFoundError(f"SQL file not found: {file_path} (also checked: {backend_path})")
    except Exception as e:
        logger.error(f"Error reading SQL file {file_path}: {str(e)}")
        raise Exception(f"Error reading SQL file {file_path}: {str(e)}")

def execute_sql_script(conn, sql_script: str) -> list:
    """Execute SQL script and return results"""
    cursor = conn.cursor()
    results = []
    
    try:
        # Split script into individual statements
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement.upper().startswith('PRINT'):
                # Handle PRINT statements
                print_msg = statement.replace('PRINT', '').strip().strip("'\"")
                logger.info(f"SQL PRINT: {print_msg}")
                results.append({"type": "print", "message": print_msg})
            else:
                # Execute other statements
                cursor.execute(statement)
                
                # Try to fetch results if it's a SELECT statement
                if statement.upper().strip().startswith('SELECT'):
                    rows = cursor.fetchall()
                    columns = [column[0] for column in cursor.description] if cursor.description else []
                    results.append({
                        "type": "select",
                        "columns": columns,
                        "rows": [list(row) for row in rows]
                    })
                else:
                    results.append({
                        "type": "execute",
                        "message": f"Statement executed successfully: {statement[:50]}..."
                    })
        
        conn.commit()
        return results
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error executing SQL script: {str(e)}")
        raise Exception(f"Error executing SQL script: {str(e)}")
    finally:
        cursor.close()

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
