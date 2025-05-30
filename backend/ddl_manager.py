
import os
import logging
from contextlib import contextmanager
from database import get_db_connection

logger = logging.getLogger(__name__)

def read_sql_file(file_path: str) -> str:
    """Read SQL content from file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"SQL file not found: {file_path}")
    except Exception as e:
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
        raise Exception(f"Error executing SQL script: {str(e)}")
    finally:
        cursor.close()

def create_tables():
    """Execute create_tables.sql script"""
    sql_file_path = os.path.join("sql", "create_tables.sql")
    sql_script = read_sql_file(sql_file_path)
    
    with get_db_connection() as conn:
        results = execute_sql_script(conn, sql_script)
        logger.info("Tables created successfully")
        return results

def drop_tables():
    """Execute drop_tables.sql script"""
    sql_file_path = os.path.join("sql", "drop_tables.sql")
    sql_script = read_sql_file(sql_file_path)
    
    with get_db_connection() as conn:
        results = execute_sql_script(conn, sql_script)
        logger.info("Tables dropped successfully")
        return results

def verify_tables():
    """Execute verify_tables.sql script"""
    sql_file_path = os.path.join("sql", "verify_tables.sql")
    sql_script = read_sql_file(sql_file_path)
    
    with get_db_connection() as conn:
        results = execute_sql_script(conn, sql_script)
        logger.info("Table verification completed")
        return results

def execute_custom_sql(sql_script: str):
    """Execute custom SQL script"""
    with get_db_connection() as conn:
        results = execute_sql_script(conn, sql_script)
        logger.info("Custom SQL executed successfully")
        return results
