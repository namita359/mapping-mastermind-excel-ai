
import uuid
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

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
