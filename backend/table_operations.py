
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

def create_split_tables():
    """Create the split table structure (metadata_catalog and mapping_data)"""
    try:
        split_tables_sql = """
        -- Create the metadata_catalog table
        CREATE TABLE metadata_catalog (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            
            -- Composite identifier components
            malcode NVARCHAR(255) NOT NULL,
            table_name NVARCHAR(255) NOT NULL,
            column_name NVARCHAR(255) NOT NULL,
            
            -- Metadata information
            malcode_description NVARCHAR(MAX),
            table_description NVARCHAR(MAX),
            column_description NVARCHAR(MAX),
            data_type NVARCHAR(100) DEFAULT 'string',
            is_primary_key BIT DEFAULT 0,
            is_nullable BIT DEFAULT 1,
            default_value NVARCHAR(MAX),
            
            -- Audit fields
            created_by NVARCHAR(255) NOT NULL DEFAULT 'system',
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            is_active BIT DEFAULT 1,
            
            -- Unique constraint for composite identifier
            CONSTRAINT UQ_metadata_catalog_composite UNIQUE (malcode, table_name, column_name)
        );

        -- Create the mapping_data table
        CREATE TABLE mapping_data (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            
            -- File information
            file_name NVARCHAR(255) NOT NULL,
            file_description NVARCHAR(MAX),
            source_system NVARCHAR(255) NOT NULL,
            target_system NVARCHAR(255) NOT NULL,
            
            -- Source column composite identifier
            source_malcode NVARCHAR(255) NOT NULL,
            source_table NVARCHAR(255) NOT NULL,
            source_column NVARCHAR(255) NOT NULL,
            source_type NVARCHAR(50) NOT NULL DEFAULT 'SRZ_ADLS',
            
            -- Target column composite identifier  
            target_malcode NVARCHAR(255) NOT NULL,
            target_table NVARCHAR(255) NOT NULL,
            target_column NVARCHAR(255) NOT NULL,
            target_type NVARCHAR(50) NOT NULL DEFAULT 'CZ_ADLS',
            
            -- Mapping details
            transformation NVARCHAR(MAX),
            join_clause NVARCHAR(MAX),
            
            -- Status and workflow
            status NVARCHAR(50) NOT NULL DEFAULT 'draft',
            created_by NVARCHAR(255) NOT NULL,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2,
            reviewer NVARCHAR(255),
            reviewed_at DATETIME2,
            comments NVARCHAR(MAX), -- JSON array as string
            
            -- Constraints
            CONSTRAINT CHK_mapping_data_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
            CONSTRAINT CHK_mapping_data_source_type CHECK (source_type IN ('SRZ_ADLS')),
            CONSTRAINT CHK_mapping_data_target_type CHECK (target_type IN ('CZ_ADLS', 'SYNAPSE_TABLE'))
        );

        -- Create indexes for performance
        CREATE INDEX IX_metadata_catalog_malcode ON metadata_catalog(malcode);
        CREATE INDEX IX_metadata_catalog_table_name ON metadata_catalog(table_name);
        CREATE INDEX IX_metadata_catalog_column_name ON metadata_catalog(column_name);
        CREATE INDEX IX_metadata_catalog_active ON metadata_catalog(is_active);

        CREATE INDEX IX_mapping_data_file_name ON mapping_data(file_name);
        CREATE INDEX IX_mapping_data_source_composite ON mapping_data(source_malcode, source_table, source_column);
        CREATE INDEX IX_mapping_data_target_composite ON mapping_data(target_malcode, target_table, target_column);
        CREATE INDEX IX_mapping_data_status ON mapping_data(status);
        CREATE INDEX IX_mapping_data_created_by ON mapping_data(created_by);
        """
        
        with get_db_connection() as conn:
            results = execute_sql_script(conn, split_tables_sql)
            logger.info("Split tables (metadata_catalog and mapping_data) created successfully")
            return results
    except Exception as e:
        logger.error(f"Failed to create split tables: {str(e)}")
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
