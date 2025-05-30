
# DDL Operations Usage Guide

This guide shows how to execute the DDL scripts on your Azure SQL Database.

## API Endpoints

The DDL operations are exposed through REST API endpoints:

### 1. Create Tables
```bash
POST /api/ddl/create-tables
```
Executes `sql/create_tables.sql` to create all required tables.

### 2. Drop Tables  
```bash
POST /api/ddl/drop-tables
```
Executes `sql/drop_tables.sql` to drop all tables (WARNING: This deletes all data!).

### 3. Verify Tables
```bash
GET /api/ddl/verify-tables
```
Executes `sql/verify_tables.sql` to check table structure and relationships.

### 4. Execute Custom SQL
```bash
POST /api/ddl/execute-sql
```
Body: `{"sql_script": "YOUR SQL HERE"}`
Executes custom SQL scripts.

## Usage Examples

### Using cURL

```bash
# Create tables
curl -X POST http://localhost:3000/api/ddl/create-tables

# Verify tables
curl -X GET http://localhost:3000/api/ddl/verify-tables

# Drop tables
curl -X POST http://localhost:3000/api/ddl/drop-tables

# Execute custom SQL
curl -X POST http://localhost:3000/api/ddl/execute-sql \
  -H "Content-Type: application/json" \
  -d '{"sql_script": "SELECT COUNT(*) FROM mapping_files;"}'
```

### Using Python Script

Run the example script:
```bash
cd backend
python run_ddl_example.py
```

### Using Python Code

```python
from ddl_manager import create_tables, drop_tables, verify_tables

# Create all tables
results = create_tables()
print("Tables created:", results)

# Verify table structure
verification = verify_tables()
print("Verification:", verification)

# Drop all tables (use with caution!)
drop_results = drop_tables()
print("Tables dropped:", drop_results)
```

## Response Format

All endpoints return a response in this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "results": [
    {
      "type": "execute|select|print",
      "message": "Description of what happened",
      "columns": ["col1", "col2"],  // For SELECT queries
      "rows": [["val1", "val2"]]    // For SELECT queries
    }
  ]
}
```

## Error Handling

- All operations include proper error handling and rollback
- Database connections are managed automatically
- Detailed error messages are provided in the response

## Security Notes

- The drop-tables operation will delete ALL data
- Always backup your database before running DDL operations
- Test in a development environment first
- Use environment variables for database credentials

## Prerequisites

1. Set up your `.env` file with Azure SQL credentials
2. Install required Python packages: `pip install -r requirements.txt`
3. Ensure your Azure SQL Database is accessible
4. Run the FastAPI server: `python main.py`
