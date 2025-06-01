
-- Create a single denormalized table for all metadata information
-- This complements the mapping_single table by providing a dedicated metadata store

-- Drop the existing metadata table to start fresh
DROP TABLE IF EXISTS metadata_single;

-- Create the metadata_single table with all necessary columns
CREATE TABLE metadata_single (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Malcode information
    malcode NVARCHAR(255) NOT NULL,
    malcode_description NVARCHAR(MAX),
    
    -- Table information
    table_name NVARCHAR(255) NOT NULL,
    table_description NVARCHAR(MAX),
    
    -- Column information
    column_name NVARCHAR(255) NOT NULL,
    column_description NVARCHAR(MAX),
    data_type NVARCHAR(100) DEFAULT 'string',
    is_primary_key BIT DEFAULT 0,
    is_nullable BIT DEFAULT 1,
    default_value NVARCHAR(MAX),
    
    -- Audit information
    created_by NVARCHAR(255) NOT NULL DEFAULT 'system',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    
    -- Add constraints and indexes
    CONSTRAINT UQ_metadata_single_malcode_table_column UNIQUE (malcode, table_name, column_name)
);

-- Create indexes for better performance
CREATE INDEX IX_metadata_single_malcode ON metadata_single(malcode);
CREATE INDEX IX_metadata_single_table ON metadata_single(table_name);
CREATE INDEX IX_metadata_single_column ON metadata_single(column_name);
CREATE INDEX IX_metadata_single_active ON metadata_single(is_active);

-- Insert sample metadata that matches the mapping_single data
INSERT INTO metadata_single (
    malcode, malcode_description, table_name, table_description,
    column_name, column_description, data_type, is_primary_key, is_nullable, created_by
) VALUES
-- Customer malcode metadata
('CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table', 
 'CUSTOMER_ID', 'Unique customer identifier', 'integer', 1, 0, 'system'),
('CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table',
 'CUSTOMER_NAME', 'Full customer name', 'string', 0, 0, 'system'),
('CUST', 'Customer data and information', 'DIM_CUSTOMER', 'Customer dimension table',
 'CUST_KEY', 'Customer dimension key', 'integer', 1, 0, 'system'),
('CUST', 'Customer data and information', 'DIM_CUSTOMER', 'Customer dimension table',
 'CUST_NAME', 'Customer name in data warehouse', 'string', 0, 0, 'system'),

-- Product malcode metadata
('PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table',
 'PRODUCT_ID', 'Unique product identifier', 'integer', 1, 0, 'system'),
('PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table',
 'PRODUCT_NAME', 'Product name', 'string', 0, 0, 'system'),
('PROD', 'Product catalog and inventory', 'DIM_PRODUCT', 'Product dimension table',
 'PROD_KEY', 'Product dimension key', 'integer', 1, 0, 'system'),
('PROD', 'Product catalog and inventory', 'DIM_PRODUCT', 'Product dimension table',
 'PROD_NAME', 'Product name in warehouse', 'string', 0, 0, 'system'),

-- Order malcode metadata
('ORD', 'Order processing and management', 'ORDERS', 'Main orders table',
 'ORDER_ID', 'Unique order identifier', 'integer', 1, 0, 'system'),
('ORD', 'Order processing and management', 'FACT_ORDERS', 'Orders fact table',
 'ORDER_KEY', 'Order fact key', 'integer', 1, 0, 'system');

PRINT 'Single metadata table created successfully with sample data.';
