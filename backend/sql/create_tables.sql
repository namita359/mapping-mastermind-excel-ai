
-- Azure SQL Database DDL for Data Mapping Application
-- Execute these statements in order to create the required tables

-- Create mapping_files table
CREATE TABLE mapping_files (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    source_system NVARCHAR(255) NOT NULL,
    target_system NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Add constraints
    CONSTRAINT CHK_mapping_files_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    CONSTRAINT UQ_mapping_files_name UNIQUE (name)
);

-- Create mapping_columns table
CREATE TABLE mapping_columns (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    malcode NVARCHAR(255) NOT NULL,
    table_name NVARCHAR(255) NOT NULL,
    column_name NVARCHAR(255) NOT NULL,
    data_type NVARCHAR(100) NOT NULL DEFAULT 'string',
    malcode_description NVARCHAR(MAX),
    table_description NVARCHAR(MAX),
    column_description NVARCHAR(MAX),
    is_primary_key BIT DEFAULT 0,
    is_nullable BIT DEFAULT 1,
    default_value NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    -- Add constraints
    CONSTRAINT UQ_mapping_columns_unique UNIQUE (malcode, table_name, column_name)
);

-- Create mapping_rows table
CREATE TABLE mapping_rows (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    mapping_file_id UNIQUEIDENTIFIER NOT NULL,
    source_column_id UNIQUEIDENTIFIER NOT NULL,
    target_column_id UNIQUEIDENTIFIER NOT NULL,
    source_type NVARCHAR(50) NOT NULL DEFAULT 'SRZ_ADLS',
    target_type NVARCHAR(50) NOT NULL DEFAULT 'CZ_ADLS',
    transformation NVARCHAR(MAX),
    join_clause NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2,
    reviewer NVARCHAR(255),
    reviewed_at DATETIME2,
    comments NVARCHAR(MAX), -- JSON array stored as string
    
    -- Add foreign key constraints
    CONSTRAINT FK_mapping_rows_file FOREIGN KEY (mapping_file_id) REFERENCES mapping_files(id) ON DELETE CASCADE,
    CONSTRAINT FK_mapping_rows_source_column FOREIGN KEY (source_column_id) REFERENCES mapping_columns(id),
    CONSTRAINT FK_mapping_rows_target_column FOREIGN KEY (target_column_id) REFERENCES mapping_columns(id),
    
    -- Add constraints
    CONSTRAINT CHK_mapping_rows_status CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    CONSTRAINT CHK_mapping_rows_source_type CHECK (source_type IN ('SRZ_ADLS')),
    CONSTRAINT CHK_mapping_rows_target_type CHECK (target_type IN ('CZ_ADLS', 'SYNAPSE_TABLE'))
);

-- Create indexes for better performance
CREATE INDEX IX_mapping_files_status ON mapping_files(status);
CREATE INDEX IX_mapping_files_created_by ON mapping_files(created_by);
CREATE INDEX IX_mapping_files_created_at ON mapping_files(created_at);

CREATE INDEX IX_mapping_columns_malcode ON mapping_columns(malcode);
CREATE INDEX IX_mapping_columns_table_name ON mapping_columns(table_name);
CREATE INDEX IX_mapping_columns_column_name ON mapping_columns(column_name);

CREATE INDEX IX_mapping_rows_mapping_file_id ON mapping_rows(mapping_file_id);
CREATE INDEX IX_mapping_rows_source_column_id ON mapping_rows(source_column_id);
CREATE INDEX IX_mapping_rows_target_column_id ON mapping_rows(target_column_id);
CREATE INDEX IX_mapping_rows_status ON mapping_rows(status);
CREATE INDEX IX_mapping_rows_created_by ON mapping_rows(created_by);
CREATE INDEX IX_mapping_rows_reviewer ON mapping_rows(reviewer);

-- Create trigger to automatically update updated_at column
CREATE TRIGGER TR_mapping_files_updated_at
ON mapping_files
AFTER UPDATE
AS
BEGIN
    UPDATE mapping_files 
    SET updated_at = GETDATE()
    FROM mapping_files f
    INNER JOIN inserted i ON f.id = i.id;
END;

CREATE TRIGGER TR_mapping_rows_updated_at
ON mapping_rows
AFTER UPDATE
AS
BEGIN
    UPDATE mapping_rows 
    SET updated_at = GETDATE()
    FROM mapping_rows r
    INNER JOIN inserted i ON r.id = i.id;
END;

-- Sample data insertion (optional - for testing)
/*
INSERT INTO mapping_files (name, description, source_system, target_system, created_by)
VALUES 
    ('Customer Data Mapping', 'Mapping customer data from source to target', 'Source_CRM', 'Target_DW', 'admin'),
    ('Product Data Mapping', 'Mapping product data transformation', 'Source_ERP', 'Target_DW', 'admin');

INSERT INTO mapping_columns (malcode, table_name, column_name, data_type, malcode_description)
VALUES 
    ('CRM001', 'customers', 'customer_id', 'integer', 'Customer identifier'),
    ('CRM002', 'customers', 'customer_name', 'string', 'Customer full name'),
    ('DW001', 'dim_customer', 'cust_key', 'integer', 'Customer dimension key'),
    ('DW002', 'dim_customer', 'cust_name', 'string', 'Customer name in data warehouse');
*/

