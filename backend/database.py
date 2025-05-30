
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

def upsert_mapping_column(conn, column_data: dict) -> str:
    """Insert or update a mapping column and return its ID"""
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("""
        SELECT id FROM mapping_columns 
        WHERE malcode = ? AND table_name = ? AND column_name = ?
    """, (column_data['malcode'], column_data['table'], column_data['column']))
    
    existing = cursor.fetchone()
    if existing:
        return str(existing[0])
    
    # Insert new column
    column_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO mapping_columns 
        (id, malcode, table_name, column_name, data_type, malcode_description, 
         table_description, column_description, is_primary_key, is_nullable, default_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        column_id,
        column_data['malcode'],
        column_data['table'],
        column_data['column'],
        column_data.get('dataType', 'string'),
        column_data.get('malcodeDescription'),
        column_data.get('tableDescription'),
        column_data.get('columnDescription'),
        column_data.get('isPrimaryKey', False),
        column_data.get('isNullable', True),
        column_data.get('defaultValue')
    ))
    
    return column_id

def save_mapping_file_to_db(conn, mapping_file: MappingFileRequest) -> str:
    """Save mapping file and all its rows to database"""
    cursor = conn.cursor()
    
    # Check if file exists
    cursor.execute("SELECT id FROM mapping_files WHERE name = ?", (mapping_file.name,))
    existing_file = cursor.fetchone()
    
    if existing_file:
        file_id = str(existing_file[0])
        # Update existing file
        cursor.execute("""
            UPDATE mapping_files 
            SET description = ?, source_system = ?, target_system = ?, status = ?, updated_at = GETDATE()
            WHERE id = ?
        """, (mapping_file.description, mapping_file.sourceSystem, mapping_file.targetSystem, 
              mapping_file.status, file_id))
        
        # Delete existing rows
        cursor.execute("DELETE FROM mapping_rows WHERE mapping_file_id = ?", (file_id,))
    else:
        # Create new file
        file_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mapping_files 
            (id, name, description, source_system, target_system, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (file_id, mapping_file.name, mapping_file.description, mapping_file.sourceSystem,
              mapping_file.targetSystem, mapping_file.status, mapping_file.createdBy))
    
    # Save all mapping rows
    for row in mapping_file.rows:
        source_column_id = upsert_mapping_column(conn, {
            'malcode': row.sourceColumn.malcode,
            'table': row.sourceColumn.table,
            'column': row.sourceColumn.column,
            'dataType': row.sourceColumn.dataType
        })
        
        target_column_id = upsert_mapping_column(conn, {
            'malcode': row.targetColumn.malcode,
            'table': row.targetColumn.table,
            'column': row.targetColumn.column,
            'dataType': row.targetColumn.dataType
        })
        
        row_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mapping_rows 
            (id, mapping_file_id, source_column_id, target_column_id, source_type, target_type,
             transformation, join_clause, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row_id, file_id, source_column_id, target_column_id,
            row.sourceColumn.sourceType, row.targetColumn.targetType,
            row.transformation, row.join, row.status, row.createdBy
        ))
    
    conn.commit()
    return file_id

def load_mapping_files_from_db(conn) -> List[Dict[str, Any]]:
    """Load all mapping files with their rows from database"""
    cursor = conn.cursor()
    
    # Get all mapping files
    cursor.execute("""
        SELECT id, name, description, source_system, target_system, status, 
               created_by, created_at, updated_at
        FROM mapping_files
    """)
    
    files = []
    for file_row in cursor.fetchall():
        file_id = str(file_row[0])
        
        # Get mapping rows for this file
        cursor.execute("""
            SELECT mr.id, mr.transformation, mr.join_clause, mr.status, mr.created_by,
                   mr.created_at, mr.updated_at, mr.reviewer, mr.reviewed_at, mr.comments,
                   sc.malcode as source_malcode, sc.table_name as source_table, 
                   sc.column_name as source_column, sc.data_type as source_data_type,
                   tc.malcode as target_malcode, tc.table_name as target_table,
                   tc.column_name as target_column, tc.data_type as target_data_type,
                   mr.source_type, mr.target_type
            FROM mapping_rows mr
            JOIN mapping_columns sc ON mr.source_column_id = sc.id
            JOIN mapping_columns tc ON mr.target_column_id = tc.id
            WHERE mr.mapping_file_id = ?
        """, (file_id,))
        
        rows = []
        for row in cursor.fetchall():
            rows.append({
                'id': str(row[0]),
                'sourceColumn': {
                    'malcode': row[10],
                    'table': row[11],
                    'column': row[12],
                    'dataType': row[13],
                    'sourceType': row[18]
                },
                'targetColumn': {
                    'malcode': row[14],
                    'table': row[15],
                    'column': row[16],
                    'dataType': row[17],
                    'targetType': row[19]
                },
                'transformation': row[1],
                'join': row[2],
                'status': row[3],
                'createdBy': row[4],
                'createdAt': row[5].isoformat() if row[5] else None,
                'updatedAt': row[6].isoformat() if row[6] else None,
                'reviewer': row[7],
                'reviewedAt': row[8].isoformat() if row[8] else None,
                'comments': json.loads(row[9]) if row[9] else []
            })
        
        files.append({
            'id': file_id,
            'name': file_row[1],
            'description': file_row[2],
            'sourceSystem': file_row[3],
            'targetSystem': file_row[4],
            'status': file_row[5],
            'createdBy': file_row[6],
            'createdAt': file_row[7].isoformat() if file_row[7] else None,
            'updatedAt': file_row[8].isoformat() if file_row[8] else None,
            'rows': rows
        })
    
    return files
