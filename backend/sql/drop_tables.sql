
-- Azure SQL Database cleanup script
-- Use this to drop all tables (WARNING: This will delete all data!)

-- Drop the single mapping table if it exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_single')
    DROP TABLE mapping_single;

-- Drop the single metadata table if it exists  
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'metadata_single')
    DROP TABLE metadata_single;

-- Drop tables in reverse order (due to foreign key constraints)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_rows')
    DROP TABLE mapping_rows;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_columns')
    DROP TABLE mapping_columns;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_files')
    DROP TABLE mapping_files;

PRINT 'All tables have been dropped successfully.';
