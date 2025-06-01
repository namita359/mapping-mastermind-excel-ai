
import logging

logger = logging.getLogger(__name__)

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
