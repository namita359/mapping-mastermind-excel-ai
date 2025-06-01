
import os
import logging

logger = logging.getLogger(__name__)

def read_sql_file(file_path: str) -> str:
    """Read SQL content from file with robust path resolution"""
    try:
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # If file_path is already absolute, use it as is
        if os.path.isabs(file_path):
            full_path = file_path
        else:
            # Build path relative to the script directory
            full_path = os.path.join(script_dir, file_path)
        
        logger.info(f"Script directory: {script_dir}")
        logger.info(f"Attempting to read SQL file: {full_path}")
        logger.info(f"File exists: {os.path.exists(full_path)}")
        
        if not os.path.exists(full_path):
            # Log directory contents for debugging
            sql_dir = os.path.join(script_dir, "sql")
            if os.path.exists(sql_dir):
                sql_files = [f for f in os.listdir(sql_dir) if f.endswith('.sql')]
                logger.info(f"Available SQL files in {sql_dir}: {sql_files}")
            else:
                logger.warning(f"SQL directory does not exist: {sql_dir}")
            
            raise FileNotFoundError(f"SQL file not found: {full_path}")
        
        with open(full_path, 'r', encoding='utf-8') as file:
            content = file.read()
            logger.info(f"Successfully read {len(content)} characters from {full_path}")
            return content
            
    except FileNotFoundError as e:
        logger.error(f"SQL file not found: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error reading SQL file {file_path}: {str(e)}")
        raise Exception(f"Error reading SQL file {file_path}: {str(e)}")
