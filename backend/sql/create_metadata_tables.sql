
-- Create metadata tables for the data mapping application
-- This script creates sample metadata that matches what's in Supabase

-- Drop existing tables if they exist
DROP TABLE IF EXISTS metadata_single;

-- Create a single denormalized metadata table
CREATE TABLE metadata_single (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    malcode NVARCHAR(255) NOT NULL,
    malcode_description NVARCHAR(MAX),
    table_name NVARCHAR(255) NOT NULL,
    table_description NVARCHAR(MAX),
    column_name NVARCHAR(255) NOT NULL,
    column_description NVARCHAR(MAX),
    data_type NVARCHAR(100) DEFAULT 'string',
    is_primary_key BIT DEFAULT 0,
    is_nullable BIT DEFAULT 1,
    default_value NVARCHAR(MAX),
    created_by NVARCHAR(255) NOT NULL DEFAULT 'system',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    
    -- Create a unique constraint
    CONSTRAINT UQ_metadata_single_unique UNIQUE (malcode, table_name, column_name)
);

-- Insert sample data for testing
INSERT INTO metadata_single (malcode, malcode_description, table_name, table_description, column_name, column_description, data_type, is_primary_key, is_nullable) VALUES
('CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table', 'CUSTOMER_ID', 'Unique customer identifier', 'integer', 1, 0),
('CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table', 'CUSTOMER_NAME', 'Full customer name', 'string', 0, 0),
('CUST', 'Customer data and information', 'CUSTOMERS', 'Main customer table', 'EMAIL', 'Customer email address', 'string', 0, 1),
('CUST', 'Customer data and information', 'CUSTOMER_DETAILS', 'Customer additional details', 'CUSTOMER_ID', 'Reference to customer', 'integer', 0, 0),
('CUST', 'Customer data and information', 'CUSTOMER_DETAILS', 'Customer additional details', 'PHONE', 'Customer phone number', 'string', 0, 1),
('PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table', 'PRODUCT_ID', 'Unique product identifier', 'integer', 1, 0),
('PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table', 'PRODUCT_NAME', 'Product name', 'string', 0, 0),
('PROD', 'Product catalog and inventory', 'PRODUCTS', 'Main product table', 'PRICE', 'Product price', 'decimal', 0, 1),
('PROD', 'Product catalog and inventory', 'INVENTORY', 'Product inventory tracking', 'PRODUCT_ID', 'Reference to product', 'integer', 0, 0),
('PROD', 'Product catalog and inventory', 'INVENTORY', 'Product inventory tracking', 'QUANTITY', 'Available quantity', 'integer', 0, 0),
('ORD', 'Order processing and management', 'ORDERS', 'Main orders table', 'ORDER_ID', 'Unique order identifier', 'integer', 1, 0),
('ORD', 'Order processing and management', 'ORDERS', 'Main orders table', 'CUSTOMER_ID', 'Reference to customer', 'integer', 0, 0),
('ORD', 'Order processing and management', 'ORDERS', 'Main orders table', 'ORDER_DATE', 'Date order was placed', 'date', 0, 0),
('ORD', 'Order processing and management', 'ORDER_ITEMS', 'Order line items', 'ORDER_ID', 'Reference to order', 'integer', 0, 0),
('ORD', 'Order processing and management', 'ORDER_ITEMS', 'Order line items', 'PRODUCT_ID', 'Reference to product', 'integer', 0, 0),
('FIN', 'Financial transactions and accounting', 'TRANSACTIONS', 'Financial transactions', 'TRANSACTION_ID', 'Unique transaction identifier', 'integer', 1, 0),
('FIN', 'Financial transactions and accounting', 'TRANSACTIONS', 'Financial transactions', 'AMOUNT', 'Transaction amount', 'decimal', 0, 0),
('FIN', 'Financial transactions and accounting', 'ACCOUNTS', 'Chart of accounts', 'ACCOUNT_ID', 'Unique account identifier', 'integer', 1, 0),
('FIN', 'Financial transactions and accounting', 'ACCOUNTS', 'Chart of accounts', 'ACCOUNT_NAME', 'Account name', 'string', 0, 0),
('HR', 'Human resources and employee data', 'EMPLOYEES', 'Employee master data', 'EMPLOYEE_ID', 'Unique employee identifier', 'integer', 1, 0),
('HR', 'Human resources and employee data', 'EMPLOYEES', 'Employee master data', 'EMPLOYEE_NAME', 'Full employee name', 'string', 0, 0),
('HR', 'Human resources and employee data', 'DEPARTMENTS', 'Department information', 'DEPT_ID', 'Unique department identifier', 'integer', 1, 0),
('HR', 'Human resources and employee data', 'DEPARTMENTS', 'Department information', 'DEPT_NAME', 'Department name', 'string', 0, 0);

-- Create indexes for better performance
CREATE INDEX IX_metadata_single_malcode ON metadata_single(malcode);
CREATE INDEX IX_metadata_single_table_name ON metadata_single(table_name);
CREATE INDEX IX_metadata_single_column_name ON metadata_single(column_name);

PRINT 'Metadata tables created successfully with sample data.';
