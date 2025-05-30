
-- Azure SQL Database cleanup script
-- Use this to drop all tables (WARNING: This will delete all data!)

-- Drop triggers first
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_mapping_files_updated_at')
    DROP TRIGGER TR_mapping_files_updated_at;

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_mapping_rows_updated_at')
    DROP TRIGGER TR_mapping_rows_updated_at;

-- Drop tables in reverse order (due to foreign key constraints)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_rows')
    DROP TABLE mapping_rows;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_columns')
    DROP TABLE mapping_columns;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_files')
    DROP TABLE mapping_files;

PRINT 'All tables and triggers have been dropped successfully.';

