
import json
import uuid
from typing import List, Dict, Any
import logging
from fastapi import HTTPException

from models import MappingFileRequest

logger = logging.getLogger(__name__)

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
