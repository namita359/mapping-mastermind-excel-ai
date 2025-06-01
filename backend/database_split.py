
import pyodbc
import logging
import json
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
from config import get_db_config

logger = logging.getLogger(__name__)

@contextmanager
def get_db_connection():
    """Create database connection with proper error handling"""
    connection = None
    try:
        config = get_db_config()
        connection_string = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={config['server']};"
            f"DATABASE={config['database']};"
            f"UID={config['username']};"
            f"PWD={config['password']};"
            f"Encrypt=yes;"
            f"TrustServerCertificate=yes;"
        )
        
        connection = pyodbc.connect(connection_string)
        logger.info("Database connection established successfully")
        yield connection
        
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise Exception(f"Database connection failed: {str(e)}")
    finally:
        if connection:
            connection.close()
            logger.info("Database connection closed")

# ... keep existing code (save_mapping_file_to_split_tables, insert_metadata_if_not_exists, load_mapping_files_from_split_tables, update_mapping_row_status_split_tables, add_mapping_row_comment_split_tables)

def search_metadata_split_tables(conn, search_term):
    """Search metadata in split table structure"""
    cursor = conn.cursor()
    
    try:
        search_pattern = f"%{search_term}%"
        cursor.execute("""
            SELECT 
                malcode, table_name, column_name, data_type,
                malcode_description, table_description, column_description
            FROM metadata_catalog
            WHERE is_active = 1 AND (
                malcode LIKE ? OR
                table_name LIKE ? OR
                column_name LIKE ? OR
                malcode_description LIKE ? OR
                table_description LIKE ? OR
                column_description LIKE ?
            )
            ORDER BY malcode, table_name, column_name
        """, (search_pattern, search_pattern, search_pattern, 
              search_pattern, search_pattern, search_pattern))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'malcode': row[0],
                'table_name': row[1],
                'column_name': row[2],
                'data_type': row[3],
                'business_description': row[6] or row[5] or row[4]
            })
        
        logger.info(f"Found {len(results)} metadata search results")
        return results
        
    except Exception as e:
        logger.error(f"Error searching metadata: {str(e)}")
        raise Exception(f"Error searching metadata: {str(e)}")

def get_all_malcodes_split_tables(conn):
    """Get all malcodes from split table structure"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT DISTINCT 
                malcode, malcode_description,
                MIN(created_at) as created_at,
                MAX(updated_at) as updated_at
            FROM metadata_catalog
            WHERE is_active = 1
            GROUP BY malcode, malcode_description
            ORDER BY malcode
        """)
        
        malcodes = []
        for row in cursor.fetchall():
            malcodes.append({
                'id': f"malcode_{hash(row[0])}",
                'malcode': row[0],
                'business_description': row[1],
                'created_at': row[2],
                'updated_at': row[3],
                'is_active': True
            })
        
        logger.info(f"Retrieved {len(malcodes)} malcodes")
        return malcodes
        
    except Exception as e:
        logger.error(f"Error getting malcodes: {str(e)}")
        raise Exception(f"Error getting malcodes: {str(e)}")

def get_tables_by_malcode_split_tables(conn, malcode):
    """Get tables by malcode from split table structure"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT DISTINCT 
                table_name, table_description,
                MIN(created_at) as created_at,
                MAX(updated_at) as updated_at
            FROM metadata_catalog
            WHERE malcode = ? AND is_active = 1
            GROUP BY table_name, table_description
            ORDER BY table_name
        """, (malcode,))
        
        tables = []
        for row in cursor.fetchall():
            tables.append({
                'id': f"table_{hash(f'{malcode}_{row[0]}')}",
                'table_name': row[0],
                'business_description': row[1],
                'created_at': row[2],
                'updated_at': row[3],
                'is_active': True
            })
        
        logger.info(f"Retrieved {len(tables)} tables for malcode {malcode}")
        return tables
        
    except Exception as e:
        logger.error(f"Error getting tables: {str(e)}")
        raise Exception(f"Error getting tables: {str(e)}")

def get_columns_by_table_split_tables(conn, malcode, table_name):
    """Get columns by table from split table structure"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                column_name, column_description, data_type,
                is_primary_key, is_nullable, default_value,
                created_at, updated_at
            FROM metadata_catalog
            WHERE malcode = ? AND table_name = ? AND is_active = 1
            ORDER BY column_name
        """, (malcode, table_name))
        
        columns = []
        for row in cursor.fetchall():
            columns.append({
                'id': f"column_{hash(f'{malcode}_{table_name}_{row[0]}')}",
                'column_name': row[0],
                'business_description': row[1],
                'data_type': row[2],
                'is_primary_key': row[3],
                'is_nullable': row[4],
                'default_value': row[5],
                'created_at': row[6],
                'updated_at': row[7],
                'is_active': True
            })
        
        logger.info(f"Retrieved {len(columns)} columns for {malcode}.{table_name}")
        return columns
        
    except Exception as e:
        logger.error(f"Error getting columns: {str(e)}")
        raise Exception(f"Error getting columns: {str(e)}")

def create_malcode_metadata_split_tables(conn, malcode, description, created_by):
    """Create a new malcode metadata entry"""
    cursor = conn.cursor()
    
    try:
        # Create a dummy table and column to establish the malcode
        cursor.execute("""
            INSERT INTO metadata_catalog (
                malcode, table_name, column_name, 
                malcode_description, table_description, column_description,
                data_type, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            malcode, '_metadata', '_malcode_info',
            description, 'Metadata table for malcode', 'Malcode information placeholder',
            'string', created_by
        ))
        
        conn.commit()
        malcode_id = f"malcode_{hash(malcode)}"
        logger.info(f"Created malcode metadata: {malcode}")
        return malcode_id
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating malcode metadata: {str(e)}")
        raise Exception(f"Error creating malcode metadata: {str(e)}")

def create_table_metadata_split_tables(conn, malcode, table_name, description, created_by):
    """Create a new table metadata entry"""
    cursor = conn.cursor()
    
    try:
        # Create a dummy column to establish the table
        cursor.execute("""
            INSERT INTO metadata_catalog (
                malcode, table_name, column_name,
                table_description, column_description,
                data_type, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            malcode, table_name, '_table_info',
            description, 'Table information placeholder',
            'string', created_by
        ))
        
        conn.commit()
        table_id = f"table_{hash(f'{malcode}_{table_name}')}"
        logger.info(f"Created table metadata: {malcode}.{table_name}")
        return table_id
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating table metadata: {str(e)}")
        raise Exception(f"Error creating table metadata: {str(e)}")

def create_column_metadata_split_tables(conn, malcode, table_name, column_name, data_type, description, is_primary_key, is_nullable, default_value, created_by):
    """Create a new column metadata entry"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO metadata_catalog (
                malcode, table_name, column_name,
                column_description, data_type, is_primary_key, is_nullable, default_value,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            malcode, table_name, column_name,
            description, data_type, is_primary_key, is_nullable, default_value,
            created_by
        ))
        
        conn.commit()
        column_id = f"column_{hash(f'{malcode}_{table_name}_{column_name}')}"
        logger.info(f"Created column metadata: {malcode}.{table_name}.{column_name}")
        return column_id
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating column metadata: {str(e)}")
        raise Exception(f"Error creating column metadata: {str(e)}")

# ... keep existing code (save_mapping_file_to_split_tables and other functions)

def save_mapping_file_to_split_tables(conn, mapping_file):
    """Save mapping file to split table structure"""
    cursor = conn.cursor()
    
    try:
        file_id = mapping_file.id
        
        # Save each mapping row
        for row in mapping_file.rows:
            # Insert source column metadata if not exists
            insert_metadata_if_not_exists(cursor, 
                row.sourceColumn.malcode,
                row.sourceColumn.table, 
                row.sourceColumn.column,
                row.sourceColumn.dataType,
                row.sourceColumn.businessMetadata
            )
            
            # Insert target column metadata if not exists
            insert_metadata_if_not_exists(cursor,
                row.targetColumn.malcode,
                row.targetColumn.table,
                row.targetColumn.column, 
                row.targetColumn.dataType,
                row.targetColumn.businessMetadata
            )
            
            # Insert mapping data
            comments_json = json.dumps(row.comments or [])
            
            cursor.execute("""
                INSERT INTO mapping_data (
                    id, file_name, file_description, source_system, target_system,
                    source_malcode, source_table, source_column, source_type,
                    target_malcode, target_table, target_column, target_type,
                    transformation, join_clause, status, created_by, comments
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row.id, mapping_file.name, mapping_file.description,
                mapping_file.sourceSystem, mapping_file.targetSystem,
                row.sourceColumn.malcode, row.sourceColumn.table, row.sourceColumn.column,
                getattr(row.sourceColumn, 'sourceType', 'SRZ_ADLS'),
                row.targetColumn.malcode, row.targetColumn.table, row.targetColumn.column,
                getattr(row.targetColumn, 'targetType', 'CZ_ADLS'),
                row.transformation, row.join, row.status, row.createdBy, comments_json
            ))
        
        conn.commit()
        logger.info(f"Mapping file '{mapping_file.name}' saved successfully")
        return file_id
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error saving mapping file: {str(e)}")
        raise Exception(f"Error saving mapping file: {str(e)}")

def insert_metadata_if_not_exists(cursor, malcode, table_name, column_name, data_type, business_metadata):
    """Insert metadata record if it doesn't exist"""
    # Check if exists
    cursor.execute("""
        SELECT id FROM metadata_catalog 
        WHERE malcode = ? AND table_name = ? AND column_name = ?
    """, (malcode, table_name, column_name))
    
    if cursor.fetchone() is None:
        # Insert new metadata record
        cursor.execute("""
            INSERT INTO metadata_catalog (
                malcode, table_name, column_name, data_type,
                malcode_description, table_description, column_description,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            malcode, table_name, column_name, data_type,
            business_metadata.get('malcodeDescription') if business_metadata else None,
            business_metadata.get('tableDescription') if business_metadata else None,
            business_metadata.get('columnDescription') if business_metadata else None,
            'system'
        ))

def load_mapping_files_from_split_tables(conn):
    """Load all mapping files from split table structure"""
    cursor = conn.cursor()
    
    try:
        # Get all mapping data with metadata
        cursor.execute("""
            SELECT DISTINCT 
                md.file_name,
                md.file_description,
                md.source_system,
                md.target_system,
                md.status,
                md.created_by,
                md.created_at
            FROM mapping_data md
            ORDER BY md.created_at DESC
        """)
        
        files = []
        file_rows = cursor.fetchall()
        
        for file_row in file_rows:
            file_name = file_row[0]
            
            # Get all rows for this file
            cursor.execute("""
                SELECT 
                    md.id, md.transformation, md.join_clause, md.status,
                    md.created_by, md.created_at, md.updated_at, md.reviewer,
                    md.reviewed_at, md.comments,
                    md.source_malcode, md.source_table, md.source_column, md.source_type,
                    md.target_malcode, md.target_table, md.target_column, md.target_type,
                    src_meta.data_type as source_data_type,
                    src_meta.malcode_description as source_malcode_desc,
                    src_meta.table_description as source_table_desc,
                    src_meta.column_description as source_column_desc,
                    tgt_meta.data_type as target_data_type,
                    tgt_meta.malcode_description as target_malcode_desc,
                    tgt_meta.table_description as target_table_desc,
                    tgt_meta.column_description as target_column_desc
                FROM mapping_data md
                LEFT JOIN metadata_catalog src_meta ON (
                    md.source_malcode = src_meta.malcode AND
                    md.source_table = src_meta.table_name AND
                    md.source_column = src_meta.column_name
                )
                LEFT JOIN metadata_catalog tgt_meta ON (
                    md.target_malcode = tgt_meta.malcode AND
                    md.target_table = tgt_meta.table_name AND
                    md.target_column = tgt_meta.column_name
                )
                WHERE md.file_name = ?
                ORDER BY md.created_at
            """, (file_name,))
            
            rows_data = cursor.fetchall()
            mapping_rows = []
            
            for row_data in rows_data:
                # Parse comments
                try:
                    comments = json.loads(row_data[9]) if row_data[9] else []
                except:
                    comments = []
                
                mapping_row = {
                    'id': row_data[0],
                    'sourceColumn': {
                        'id': f"src_{row_data[0]}",
                        'malcode': row_data[10],
                        'table': row_data[11],
                        'column': row_data[12],
                        'sourceType': row_data[13],
                        'dataType': row_data[14] or 'string',
                        'businessMetadata': {
                            'malcodeDescription': row_data[15],
                            'tableDescription': row_data[16],
                            'columnDescription': row_data[17]
                        }
                    },
                    'targetColumn': {
                        'id': f"tgt_{row_data[0]}",
                        'malcode': row_data[18],
                        'table': row_data[19],
                        'column': row_data[20],
                        'targetType': row_data[21],
                        'dataType': row_data[22] or 'string',
                        'businessMetadata': {
                            'malcodeDescription': row_data[23],
                            'tableDescription': row_data[24],
                            'columnDescription': row_data[25]
                        }
                    },
                    'transformation': row_data[1],
                    'join': row_data[2],
                    'status': row_data[3],
                    'createdBy': row_data[4],
                    'createdAt': row_data[5],
                    'updatedAt': row_data[6],
                    'reviewer': row_data[7],
                    'reviewedAt': row_data[8],
                    'comments': comments
                }
                mapping_rows.append(mapping_row)
            
            mapping_file = {
                'id': f"file_{hash(file_name)}",
                'name': file_name,
                'description': file_row[1],
                'sourceSystem': file_row[2],
                'targetSystem': file_row[3],
                'status': file_row[4],
                'createdBy': file_row[5],
                'createdAt': file_row[6],
                'rows': mapping_rows
            }
            files.append(mapping_file)
        
        logger.info(f"Loaded {len(files)} mapping files from split tables")
        return files
        
    except Exception as e:
        logger.error(f"Error loading mapping files: {str(e)}")
        raise Exception(f"Error loading mapping files: {str(e)}")

def update_mapping_row_status_split_tables(conn, row_id, status, reviewer=None):
    """Update mapping row status in split table structure"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE mapping_data 
            SET status = ?, reviewer = ?, reviewed_at = ?, updated_at = ?
            WHERE id = ?
        """, (status, reviewer, 'GETDATE()' if reviewer else None, 'GETDATE()', row_id))
        
        conn.commit()
        logger.info(f"Row {row_id} status updated to {status}")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error updating row status: {str(e)}")
        raise Exception(f"Error updating row status: {str(e)}")

def add_mapping_row_comment_split_tables(conn, row_id, comment):
    """Add comment to mapping row in split table structure"""
    cursor = conn.cursor()
    
    try:
        # Get current comments
        cursor.execute("SELECT comments FROM mapping_data WHERE id = ?", (row_id,))
        result = cursor.fetchone()
        
        if result:
            try:
                current_comments = json.loads(result[0]) if result[0] else []
            except:
                current_comments = []
            
            current_comments.append(comment)
            updated_comments = json.dumps(current_comments)
            
            cursor.execute("""
                UPDATE mapping_data 
                SET comments = ?, updated_at = ?
                WHERE id = ?
            """, (updated_comments, 'GETDATE()', row_id))
            
            conn.commit()
            logger.info(f"Comment added to row {row_id}")
        else:
            raise Exception(f"Row {row_id} not found")
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Error adding comment: {str(e)}")
        raise Exception(f"Error adding comment: {str(e)}")
