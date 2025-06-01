
-- Verification script to check if tables were created successfully

-- Check if tables exist
SELECT 
    'mapping_files' as table_name,
    CASE WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_files') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'mapping_columns' as table_name,
    CASE WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_columns') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'mapping_rows' as table_name,
    CASE WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_rows') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'metadata_single' as table_name,
    CASE WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'metadata_single') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'mapping_single' as table_name,
    CASE WHEN EXISTS (SELECT * FROM sys.tables WHERE name = 'mapping_single') THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check table schemas for existing tables
SELECT 
    t.name AS table_name,
    c.name AS column_name,
    ty.name AS data_type,
    c.max_length,
    c.is_nullable,
    c.is_identity
FROM sys.tables t
INNER JOIN sys.columns c ON t.object_id = c.object_id
INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE t.name IN ('mapping_files', 'mapping_columns', 'mapping_rows', 'metadata_single', 'mapping_single')
ORDER BY t.name, c.column_id;

-- Check foreign key relationships
SELECT 
    fk.name AS foreign_key_name,
    tp.name AS parent_table,
    cp.name AS parent_column,
    tr.name AS referenced_table,
    cr.name AS referenced_column
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
WHERE tp.name IN ('mapping_files', 'mapping_columns', 'mapping_rows', 'metadata_single', 'mapping_single')
   OR tr.name IN ('mapping_files', 'mapping_columns', 'mapping_rows', 'metadata_single', 'mapping_single');

-- Check indexes
SELECT 
    t.name AS table_name,
    i.name AS index_name,
    i.type_desc AS index_type,
    i.is_unique
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name IN ('mapping_files', 'mapping_columns', 'mapping_rows', 'metadata_single', 'mapping_single')
  AND i.name IS NOT NULL
ORDER BY t.name, i.name;

PRINT 'Table verification completed successfully.';
