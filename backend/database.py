
import pyodbc
import json
import uuid
from contextlib import contextmanager
from fastapi import HTTPException
from typing import List, Dict, Any
import logging

from config import get_database_connection_string
from models import MappingFileRequest

logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    """Get database connection with proper error handling"""
    from config import AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USERNAME, AZURE_SQL_PASSWORD
    
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

def save_mapping_file_to_single_table(conn, mapping_file: MappingFileRequest) -> str:
    """Save mapping file and all its rows to the single mapping table"""
    cursor = conn.cursor()
    
    # Delete existing mappings for this file
    cursor.execute("DELETE FROM mapping_single WHERE mapping_file_name = ?", (mapping_file.name,))
    
    # Insert all mapping rows
    for row in mapping_file.rows:
        row_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mapping_single (
                id, mapping_file_name, mapping_file_description, source_system, target_system, mapping_status,
                source_malcode, source_table_name, source_column_name, source_data_type, source_type,
                target_malcode, target_table_name, target_column_name, target_data_type, target_type,
                transformation, join_clause, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row_id, mapping_file.name, mapping_file.description, mapping_file.sourceSystem, mapping_file.targetSystem, mapping_file.status,
            row.sourceColumn.malcode, row.sourceColumn.table, row.sourceColumn.column, row.sourceColumn.dataType, row.sourceColumn.sourceType,
            row.targetColumn.malcode, row.targetColumn.table, row.targetColumn.column, row.targetColumn.dataType, row.targetColumn.targetType,
            row.transformation, row.join, row.createdBy
        ))
    
    conn.commit()
    return str(uuid.uuid4())  # Return a file ID

def load_mapping_files_from_single_table(conn) -> List[Dict[str, Any]]:
    """Load all mapping files with their rows from the single table"""
    cursor = conn.cursor()
    
    # Get all unique mapping files
    cursor.execute("""
        SELECT DISTINCT mapping_file_name, mapping_file_description, source_system, target_system, mapping_status,
               created_by, MIN(created_at) as created_at, MAX(updated_at) as updated_at
        FROM mapping_single
        WHERE is_active = 1
        GROUP BY mapping_file_name, mapping_file_description, source_system, target_system, mapping_status, created_by
    """)
    
    files = []
    for file_row in cursor.fetchall():
        file_name = file_row[0]
        
        # Get mapping rows for this file
        cursor.execute("""
            SELECT id, source_malcode, source_table_name, source_column_name, source_data_type, source_type,
                   target_malcode, target_table_name, target_column_name, target_data_type, target_type,
                   transformation, join_clause, mapping_status, created_by, created_at, updated_at,
                   reviewer, reviewed_at, comments
            FROM mapping_single
            WHERE mapping_file_name = ? AND is_active = 1
        """, (file_name,))
        
        rows = []
        for row in cursor.fetchall():
            rows.append({
                'id': str(row[0]),
                'sourceColumn': {
                    'malcode': row[1],
                    'table': row[2],
                    'column': row[3],
                    'dataType': row[4],
                    'sourceType': row[5]
                },
                'targetColumn': {
                    'malcode': row[6],
                    'table': row[7],
                    'column': row[8],
                    'dataType': row[9],
                    'targetType': row[10]
                },
                'transformation': row[11],
                'join': row[12],
                'status': row[13],
                'createdBy': row[14],
                'createdAt': row[15].isoformat() if row[15] else None,
                'updatedAt': row[16].isoformat() if row[16] else None,
                'reviewer': row[17],
                'reviewedAt': row[18].isoformat() if row[18] else None,
                'comments': json.loads(row[19]) if row[19] else []
            })
        
        files.append({
            'id': str(uuid.uuid4()),  # Generate a temporary ID
            'name': file_name,
            'description': file_row[1],
            'sourceSystem': file_row[2],
            'targetSystem': file_row[3],
            'status': file_row[4],
            'createdBy': file_row[5],
            'createdAt': file_row[6].isoformat() if file_row[6] else None,
            'updatedAt': file_row[7].isoformat() if file_row[7] else None,
            'rows': rows
        })
    
    return files

def update_mapping_row_status_single_table(conn, row_id: str, status: str, reviewer: str = None):
    """Update mapping row status in single table"""
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE mapping_single 
        SET mapping_status = ?, reviewer = ?, reviewed_at = GETDATE(), updated_at = GETDATE()
        WHERE id = ?
    """, (status, reviewer, row_id))
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Mapping row not found")
    
    conn.commit()

def add_mapping_row_comment_single_table(conn, row_id: str, comment: str):
    """Add comment to mapping row in single table"""
    cursor = conn.cursor()
    
    # Get current comments
    cursor.execute("SELECT comments FROM mapping_single WHERE id = ?", (row_id,))
    result = cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Mapping row not found")
    
    current_comments = json.loads(result[0]) if result[0] else []
    current_comments.append(comment)
    
    # Update with new comments
    cursor.execute("""
        UPDATE mapping_single 
        SET comments = ?, updated_at = GETDATE()
        WHERE id = ?
    """, (json.dumps(current_comments), row_id))
    
    conn.commit()

# Metadata functions for single table structure
def search_metadata_single_table(conn, search_term: str) -> List[Dict[str, Any]]:
    """Search metadata in the single table"""
    cursor = conn.cursor()
    search_pattern = f"%{search_term}%"
    
    cursor.execute("""
        SELECT DISTINCT source_malcode as malcode, source_table_name as table_name, 
               source_column_name as column_name, source_malcode_description as business_description,
               source_data_type as data_type
        FROM mapping_single
        WHERE (source_malcode LIKE ? OR source_table_name LIKE ? OR source_column_name LIKE ? OR source_malcode_description LIKE ?)
           AND is_active = 1
        UNION
        SELECT DISTINCT target_malcode as malcode, target_table_name as table_name,
               target_column_name as column_name, target_malcode_description as business_description,
               target_data_type as data_type
        FROM mapping_single
        WHERE (target_malcode LIKE ? OR target_table_name LIKE ? OR target_column_name LIKE ? OR target_malcode_description LIKE ?)
           AND is_active = 1
    """, (search_pattern, search_pattern, search_pattern, search_pattern,
          search_pattern, search_pattern, search_pattern, search_pattern))
    
    results = []
    for row in cursor.fetchall():
        results.append({
            'malcode': row[0],
            'table_name': row[1],
            'column_name': row[2],
            'business_description': row[3],
            'data_type': row[4]
        })
    
    return results

def get_all_malcodes_single_table(conn) -> List[Dict[str, Any]]:
    """Get all unique malcodes from single table"""
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT malcode, malcode_description, MIN(created_at) as created_at, 
               MAX(updated_at) as updated_at, created_by
        FROM (
            SELECT source_malcode as malcode, source_malcode_description as malcode_description,
                   created_at, updated_at, created_by
            FROM mapping_single WHERE is_active = 1
            UNION
            SELECT target_malcode as malcode, target_malcode_description as malcode_description,
                   created_at, updated_at, created_by
            FROM mapping_single WHERE is_active = 1
        ) combined
        GROUP BY malcode, malcode_description, created_by
        ORDER BY malcode
    """)
    
    malcodes = []
    for row in cursor.fetchall():
        malcodes.append({
            'id': str(uuid.uuid4()),  # Generate ID for compatibility
            'malcode': row[0],
            'business_description': row[1],
            'created_at': row[2].isoformat() if row[2] else None,
            'updated_at': row[3].isoformat() if row[3] else None,
            'created_by': row[4],
            'is_active': True
        })
    
    return malcodes

def get_tables_by_malcode_single_table(conn, malcode: str) -> List[Dict[str, Any]]:
    """Get all tables for a specific malcode from single table"""
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT table_name, table_description, MIN(created_at) as created_at,
               MAX(updated_at) as updated_at, created_by
        FROM (
            SELECT source_table_name as table_name, source_table_description as table_description,
                   created_at, updated_at, created_by
            FROM mapping_single WHERE source_malcode = ? AND is_active = 1
            UNION
            SELECT target_table_name as table_name, target_table_description as table_description,
                   created_at, updated_at, created_by
            FROM mapping_single WHERE target_malcode = ? AND is_active = 1
        ) combined
        GROUP BY table_name, table_description, created_by
        ORDER BY table_name
    """, (malcode, malcode))
    
    tables = []
    for row in cursor.fetchall():
        tables.append({
            'id': str(uuid.uuid4()),  # Generate ID for compatibility
            'malcode_id': str(uuid.uuid4()),  # Generate malcode_id for compatibility
            'table_name': row[0],
            'business_description': row[1],
            'created_at': row[2].isoformat() if row[2] else None,
            'updated_at': row[3].isoformat() if row[3] else None,
            'created_by': row[4],
            'is_active': True
        })
    
    return tables

def get_columns_by_table_single_table(conn, malcode: str, table_name: str) -> List[Dict[str, Any]]:
    """Get all columns for a specific table from single table"""
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DISTINCT column_name, column_description, data_type, is_primary_key, is_nullable,
               default_value, MIN(created_at) as created_at, MAX(updated_at) as updated_at, created_by
        FROM (
            SELECT source_column_name as column_name, source_column_description as column_description,
                   source_data_type as data_type, source_is_primary_key as is_primary_key,
                   source_is_nullable as is_nullable, source_default_value as default_value,
                   created_at, updated_at, created_by
            FROM mapping_single 
            WHERE source_malcode = ? AND source_table_name = ? AND is_active = 1
            UNION
            SELECT target_column_name as column_name, target_column_description as column_description,
                   target_data_type as data_type, target_is_primary_key as is_primary_key,
                   target_is_nullable as is_nullable, target_default_value as default_value,
                   created_at, updated_at, created_by
            FROM mapping_single 
            WHERE target_malcode = ? AND target_table_name = ? AND is_active = 1
        ) combined
        GROUP BY column_name, column_description, data_type, is_primary_key, is_nullable, default_value, created_by
        ORDER BY column_name
    """, (malcode, table_name, malcode, table_name))
    
    columns = []
    for row in cursor.fetchall():
        columns.append({
            'id': str(uuid.uuid4()),  # Generate ID for compatibility
            'table_id': str(uuid.uuid4()),  # Generate table_id for compatibility
            'column_name': row[0],
            'business_description': row[1],
            'data_type': row[2],
            'is_primary_key': row[3] or False,
            'is_nullable': row[4] if row[4] is not None else True,
            'default_value': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'updated_at': row[7].isoformat() if row[7] else None,
            'created_by': row[8],
            'is_active': True
        })
    
    return columns
