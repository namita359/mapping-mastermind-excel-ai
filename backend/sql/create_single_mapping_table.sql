
-- Drop the existing tables to start fresh
DROP TABLE IF EXISTS mapping_rows;
DROP TABLE IF EXISTS mapping_columns; 
DROP TABLE IF EXISTS mapping_files;

-- Create a single denormalized table for all mapping and metadata information
CREATE TABLE mapping_single (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Mapping file information
    mapping_file_name NVARCHAR(255),
    mapping_file_description NVARCHAR(MAX),
    source_system NVARCHAR(255),
    target_system NVARCHAR(255),
    mapping_status NVARCHAR(50) DEFAULT 'draft',
    
    -- Source column information
    source_malcode NVARCHAR(255) NOT NULL,
    source_malcode_description NVARCHAR(MAX),
    source_table_name NVARCHAR(255) NOT NULL,
    source_table_description NVARCHAR(MAX),
    source_column_name NVARCHAR(255) NOT NULL,
    source_column_description NVARCHAR(MAX),
    source_data_type NVARCHAR(100) DEFAULT 'string',
    source_is_primary_key BIT DEFAULT 0,
    source_is_nullable BIT DEFAULT 1,
    source_default_value NVARCHAR(MAX),
    source_type NVARCHAR(50) DEFAULT 'SRZ_ADLS',
    
    -- Target column information
    target_malcode NVARCHAR(255) NOT NULL,
    target_malcode_description NVARCHAR(MAX),
    target_table_name NVARCHAR(255) NOT NULL,
    target_table_description NVARCHAR(MAX),
    target_column_name NVARCHAR(255) NOT NULL,
    target_column_description NVARCHAR(MAX),
    target_data_type NVARCHAR(100) DEFAULT 'string',
    target_is_primary_key BIT DEFAULT 0,
    target_is_nullable BIT DEFAULT 1,
    target_default_value NVARCHAR(MAX),
    target_type NVARCHAR(50) DEFAULT 'CZ_ADLS',
    
    -- Mapping transformation information
    transformation NVARCHAR(MAX),
    join_clause NVARCHAR(MAX),
    
    -- Audit and review information
    created_by NVARCHAR(255) NOT NULL DEFAULT 'system',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    reviewer NVARCHAR(255),
    reviewed_at DATETIME2,
    comments NVARCHAR(MAX), -- JSON array stored as string
    is_active BIT DEFAULT 1,
    
    -- Add constraints
    CONSTRAINT CHK_mapping_single_status CHECK (mapping_status IN ('draft', 'pending', 'approved', 'rejected')),
    CONSTRAINT CHK_mapping_single_source_type CHECK (source_type IN ('SRZ_ADLS')),
    CONSTRAINT CHK_mapping_single_target_type CHECK (target_type IN ('CZ_ADLS', 'SYNAPSE_TABLE'))
);

-- Create indexes for better performance
CREATE INDEX IX_mapping_single_source_malcode ON mapping_single(source_malcode);
CREATE INDEX IX_mapping_single_target_malcode ON mapping_single(target_malcode);
CREATE INDEX IX_mapping_single_source_table ON mapping_single(source_table_name);
CREATE INDEX IX_mapping_single_target_table ON mapping_single(target_table_name);
CREATE INDEX IX_mapping_single_mapping_file ON mapping_single(mapping_file_name);
CREATE INDEX IX_mapping_single_status ON mapping_single(mapping_status);
CREATE INDEX IX_mapping_single_created_by ON mapping_single(created_by);

-- Insert sample mapping data
INSERT INTO mapping_single (
    mapping_file_name, mapping_file_description, source_system, target_system, mapping_status,
    source_malcode, source_malcode_description, source_table_name, source_table_description, 
    source_column_name, source_column_description, source_data_type, source_is_primary_key, source_is_nullable,
    target_malcode, target_malcode_description, target_table_name, target_table_description,
    target_column_name, target_column_description, target_data_type, target_is_primary_key, target_is_nullable,
    transformation, created_by
) VALUES
-- Customer data mappings
('Customer Data Mapping', 'Mapping customer data from CRM to Data Warehouse', 'Source_CRM', 'Target_DW', 'draft',
 'CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table', 
 'CUSTOMER_ID', 'Unique customer identifier', 'integer', 1, 0,
 'CUST', 'Customer data and information', 'DIM_CUSTOMER', 'Customer dimension table',
 'CUST_KEY', 'Customer dimension key', 'integer', 1, 0,
 'CAST(CUSTOMER_ID AS INTEGER)', 'system'),

('Customer Data Mapping', 'Mapping customer data from CRM to Data Warehouse', 'Source_CRM', 'Target_DW', 'draft',
 'CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table',
 'CUSTOMER_NAME', 'Full customer name', 'string', 0, 0,
 'CUST', 'Customer data and information', 'DIM_CUSTOMER', 'Customer dimension table',
 'CUST_NAME', 'Customer name in data warehouse', 'string', 0, 0,
 'UPPER(TRIM(CUSTOMER_NAME))', 'system'),

-- Product data mappings
('Product Data Mapping', 'Mapping product data transformation', 'Source_ERP', 'Target_DW', 'pending',
 'PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table',
 'PRODUCT_ID', 'Unique product identifier', 'integer', 1, 0,
 'PROD', 'Product catalog and inventory', 'DIM_PRODUCT', 'Product dimension table',
 'PROD_KEY', 'Product dimension key', 'integer', 1, 0,
 'PRODUCT_ID', 'system'),

('Product Data Mapping', 'Mapping product data transformation', 'Source_ERP', 'Target_DW', 'approved',
 'PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table',
 'PRODUCT_NAME', 'Product name', 'string', 0, 0,
 'PROD', 'Product catalog and inventory', 'DIM_PRODUCT', 'Product dimension table',
 'PROD_NAME', 'Product name in warehouse', 'string', 0, 0,
 'TRIM(PRODUCT_NAME)', 'system'),

-- Order data mappings
('Order Processing Mapping', 'Order processing and management mapping', 'Source_OMS', 'Target_DW', 'draft',
 'ORD', 'Order processing and management', 'ORDERS', 'Main orders table',
 'ORDER_ID', 'Unique order identifier', 'integer', 1, 0,
 'ORD', 'Order processing and management', 'FACT_ORDERS', 'Orders fact table',
 'ORDER_KEY', 'Order fact key', 'integer', 1, 0,
 'ORDER_ID', 'system');

PRINT 'Single mapping table created successfully with sample data.';
