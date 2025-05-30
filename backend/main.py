
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from openai import AzureOpenAI
import json
import logging
from datetime import datetime
import pyodbc
from contextlib import contextmanager
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Data Mapping Backend API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
AZURE_SQL_SERVER = os.getenv("AZURE_SQL_SERVER")
AZURE_SQL_DATABASE = os.getenv("AZURE_SQL_DATABASE")
AZURE_SQL_USERNAME = os.getenv("AZURE_SQL_USERNAME")
AZURE_SQL_PASSWORD = os.getenv("AZURE_SQL_PASSWORD")
AZURE_SQL_DRIVER = os.getenv("AZURE_SQL_DRIVER", "{ODBC Driver 18 for SQL Server}")

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
    logger.warning("Azure OpenAI configuration is missing. OpenAI features will be disabled.")
    client = None
else:
    client = AzureOpenAI(
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_key=AZURE_OPENAI_KEY,
        api_version=AZURE_OPENAI_API_VERSION,
    )

# Database connection
@contextmanager
def get_db_connection():
    """Get database connection with proper error handling"""
    if not all([AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USERNAME, AZURE_SQL_PASSWORD]):
        raise HTTPException(
            status_code=500, 
            detail="Database configuration is incomplete. Please set all required environment variables."
        )
    
    connection_string = (
        f"DRIVER={AZURE_SQL_DRIVER};"
        f"SERVER={AZURE_SQL_SERVER};"
        f"DATABASE={AZURE_SQL_DATABASE};"
        f"UID={AZURE_SQL_USERNAME};"
        f"PWD={AZURE_SQL_PASSWORD};"
        f"Encrypt=yes;"
        f"TrustServerCertificate=no;"
        f"Connection Timeout=30;"
    )
    
    try:
        conn = pyodbc.connect(connection_string)
        yield conn
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

# Pydantic models
class SourceColumn(BaseModel):
    malcode: str
    table: str
    column: str
    dataType: Optional[str] = "string"
    sourceType: Optional[str] = "SRZ_ADLS"

class TargetColumn(BaseModel):
    malcode: str
    table: str
    column: str
    dataType: Optional[str] = "string"
    targetType: Optional[str] = "CZ_ADLS"

class MappingRowRequest(BaseModel):
    sourceColumn: SourceColumn
    targetColumn: TargetColumn
    transformation: Optional[str] = None
    join: Optional[str] = None
    status: Optional[str] = "draft"
    createdBy: Optional[str] = "API User"

class MappingFileRequest(BaseModel):
    name: str
    description: Optional[str] = None
    sourceSystem: str
    targetSystem: str
    status: Optional[str] = "draft"
    createdBy: str
    rows: List[MappingRowRequest]

class MappingInfo(BaseModel):
    name: str
    rows: List[Dict[str, Any]]

class ValidationResults(BaseModel):
    isValid: bool
    message: str
    executedResults: Optional[List[Dict[str, Any]]] = None
    errors: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None

class BackendApiResponse(BaseModel):
    sqlQuery: str
    testData: List[Dict[str, Any]]
    validationResults: ValidationResults

class OpenAIProcessRequest(BaseModel):
    mappingInfo: MappingInfo

class OpenAISQLRequest(BaseModel):
    mappingInfo: MappingInfo

class OpenAITestDataRequest(BaseModel):
    mappingInfo: MappingInfo
    sqlQuery: str

class OpenAIValidateRequest(BaseModel):
    sqlQuery: str
    testData: List[Dict[str, Any]]

# OpenAI utility functions
def call_azure_openai(messages: List[Dict[str, str]], max_tokens: int = 2000) -> str:
    """Call Azure OpenAI with the given messages"""
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0.7,
            top_p=0.9,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Azure OpenAI API call failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Azure OpenAI API call failed: {str(e)}")

def generate_sql_query(mapping_info: MappingInfo) -> str:
    """Generate SQL query using Azure OpenAI based on mapping information"""
    
    mapping_details = "\n".join([
        f"Source: {row['sourceColumn']['malcode']}.{row['sourceColumn']['table']}.{row['sourceColumn']['column']} -> "
        f"Target: {row['targetColumn']['malcode']}.{row['targetColumn']['table']}.{row['targetColumn']['column']}"
        for row in mapping_info.rows
    ])

    messages = [
        {
            "role": "system",
            "content": """You are an expert SQL developer specializing in data transformation and ETL processes. 
            Generate efficient SQL queries for data mapping scenarios between source and target systems.
            Focus on:
            1. Creating proper SELECT statements with transformations
            2. Handling data type conversions appropriately
            3. Including necessary JOINs when multiple tables are involved
            4. Adding WHERE clauses for data quality checks
            5. Using appropriate SQL functions for data transformation"""
        },
        {
            "role": "user",
            "content": f"""Generate a SQL query for the following data mapping:

Mapping Name: {mapping_info.name}

Mappings:
{mapping_details}

Requirements:
- Create a SELECT query that transforms source data to target format
- Include all mapped columns
- Add appropriate data type conversions
- Include comments explaining the transformation logic
- Make the query production-ready

Please provide only the SQL query without additional explanations."""
        }
    ]
    
    return call_azure_openai(messages, max_tokens=1500)

def generate_test_data(mapping_info: MappingInfo, sql_query: str) -> List[Dict[str, Any]]:
    """Generate test data using Azure OpenAI based on mapping and SQL query"""
    
    column_info = "\n".join([
        f"{row['targetColumn']['table']}.{row['targetColumn']['column']} ({row.get('dataType', 'string')})"
        for row in mapping_info.rows
    ])

    messages = [
        {
            "role": "system",
            "content": """You are a test data generator expert. Create realistic test data that covers various scenarios including:
            1. Normal/valid data cases
            2. Edge cases (nulls, empty strings, boundary values)
            3. Data quality issues (for testing validation)
            4. Different data types and formats
            
            Always return valid JSON array format."""
        },
        {
            "role": "user",
            "content": f"""Generate test data for this mapping scenario:

Mapping: {mapping_info.name}

Target Columns:
{column_info}

SQL Query:
{sql_query}

Generate 10-15 test records that include:
- 5-7 normal valid records
- 2-3 edge case records (nulls, empty values)
- 2-3 boundary value records
- 1-2 potential data quality issue records

Return as a JSON array of objects. Each object should have keys matching the target column names.
Example format: [{"column1": "value1", "column2": "value2"}, ...]

Provide only the JSON array without additional text."""
        }
    ]
    
    response = call_azure_openai(messages, max_tokens=2000)
    
    try:
        # Try to parse the JSON response
        test_data = json.loads(response)
        if not isinstance(test_data, list):
            raise ValueError("Response is not a JSON array")
        return test_data
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"Failed to parse test data JSON: {e}")
        # Return fallback test data
        return [
            {"id": i, "sample_column": f"test_value_{i}", "status": "valid"}
            for i in range(1, 6)
        ]

def validate_sql_query(sql_query: str, test_data: List[Dict[str, Any]]) -> ValidationResults:
    """Validate SQL query using Azure OpenAI"""
    
    test_data_sample = json.dumps(test_data[:3], indent=2) if test_data else "No test data provided"

    messages = [
        {
            "role": "system",
            "content": """You are a SQL validation expert. Analyze SQL queries for:
            1. Syntax correctness
            2. Performance optimization opportunities
            3. Data quality and integrity checks
            4. Best practices compliance
            5. Potential runtime issues
            
            Provide structured feedback with specific recommendations."""
        },
        {
            "role": "user",
            "content": f"""Validate this SQL query:

SQL Query:
{sql_query}

Sample Test Data:
{test_data_sample}

Provide validation results in this format:
- Overall Assessment: (Valid/Invalid with reasoning)
- Syntax Issues: (List any syntax problems)
- Performance Suggestions: (List optimization recommendations)
- Data Quality Concerns: (List potential data issues)
- Best Practice Recommendations: (List improvements)

Be specific and actionable in your feedback."""
        }
    ]
    
    response = call_azure_openai(messages, max_tokens=1500)
    
    # Parse the response to determine validity
    is_valid = "invalid" not in response.lower() and "error" not in response.lower()
    
    return ValidationResults(
        isValid=is_valid,
        message=response,
        executedResults=None,
        errors=[] if is_valid else ["Validation issues found - see message for details"],
        suggestions=[response] if not is_valid else []
    )

# Database operations
def upsert_mapping_column(conn, column_data: dict) -> str:
    """Insert or update a mapping column and return its ID"""
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("""
        SELECT id FROM mapping_columns 
        WHERE malcode = ? AND table_name = ? AND column_name = ?
    """, (column_data['malcode'], column_data['table'], column_data['column']))
    
    existing = cursor.fetchone()
    if existing:
        return str(existing[0])
    
    # Insert new column
    column_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO mapping_columns 
        (id, malcode, table_name, column_name, data_type, malcode_description, 
         table_description, column_description, is_primary_key, is_nullable, default_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        column_id,
        column_data['malcode'],
        column_data['table'],
        column_data['column'],
        column_data.get('dataType', 'string'),
        column_data.get('malcodeDescription'),
        column_data.get('tableDescription'),
        column_data.get('columnDescription'),
        column_data.get('isPrimaryKey', False),
        column_data.get('isNullable', True),
        column_data.get('defaultValue')
    ))
    
    return column_id

def save_mapping_file_to_db(conn, mapping_file: MappingFileRequest) -> str:
    """Save mapping file and all its rows to database"""
    cursor = conn.cursor()
    
    # Check if file exists
    cursor.execute("SELECT id FROM mapping_files WHERE name = ?", (mapping_file.name,))
    existing_file = cursor.fetchone()
    
    if existing_file:
        file_id = str(existing_file[0])
        # Update existing file
        cursor.execute("""
            UPDATE mapping_files 
            SET description = ?, source_system = ?, target_system = ?, status = ?, updated_at = GETDATE()
            WHERE id = ?
        """, (mapping_file.description, mapping_file.sourceSystem, mapping_file.targetSystem, 
              mapping_file.status, file_id))
        
        # Delete existing rows
        cursor.execute("DELETE FROM mapping_rows WHERE mapping_file_id = ?", (file_id,))
    else:
        # Create new file
        file_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mapping_files 
            (id, name, description, source_system, target_system, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (file_id, mapping_file.name, mapping_file.description, mapping_file.sourceSystem,
              mapping_file.targetSystem, mapping_file.status, mapping_file.createdBy))
    
    # Save all mapping rows
    for row in mapping_file.rows:
        source_column_id = upsert_mapping_column(conn, {
            'malcode': row.sourceColumn.malcode,
            'table': row.sourceColumn.table,
            'column': row.sourceColumn.column,
            'dataType': row.sourceColumn.dataType
        })
        
        target_column_id = upsert_mapping_column(conn, {
            'malcode': row.targetColumn.malcode,
            'table': row.targetColumn.table,
            'column': row.targetColumn.column,
            'dataType': row.targetColumn.dataType
        })
        
        row_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO mapping_rows 
            (id, mapping_file_id, source_column_id, target_column_id, source_type, target_type,
             transformation, join_clause, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row_id, file_id, source_column_id, target_column_id,
            row.sourceColumn.sourceType, row.targetColumn.targetType,
            row.transformation, row.join, row.status, row.createdBy
        ))
    
    conn.commit()
    return file_id

def load_mapping_files_from_db(conn) -> List[Dict[str, Any]]:
    """Load all mapping files with their rows from database"""
    cursor = conn.cursor()
    
    # Get all mapping files
    cursor.execute("""
        SELECT id, name, description, source_system, target_system, status, 
               created_by, created_at, updated_at
        FROM mapping_files
    """)
    
    files = []
    for file_row in cursor.fetchall():
        file_id = str(file_row[0])
        
        # Get mapping rows for this file
        cursor.execute("""
            SELECT mr.id, mr.transformation, mr.join_clause, mr.status, mr.created_by,
                   mr.created_at, mr.updated_at, mr.reviewer, mr.reviewed_at, mr.comments,
                   sc.malcode as source_malcode, sc.table_name as source_table, 
                   sc.column_name as source_column, sc.data_type as source_data_type,
                   tc.malcode as target_malcode, tc.table_name as target_table,
                   tc.column_name as target_column, tc.data_type as target_data_type,
                   mr.source_type, mr.target_type
            FROM mapping_rows mr
            JOIN mapping_columns sc ON mr.source_column_id = sc.id
            JOIN mapping_columns tc ON mr.target_column_id = tc.id
            WHERE mr.mapping_file_id = ?
        """, (file_id,))
        
        rows = []
        for row in cursor.fetchall():
            rows.append({
                'id': str(row[0]),
                'sourceColumn': {
                    'malcode': row[10],
                    'table': row[11],
                    'column': row[12],
                    'dataType': row[13],
                    'sourceType': row[18]
                },
                'targetColumn': {
                    'malcode': row[14],
                    'table': row[15],
                    'column': row[16],
                    'dataType': row[17],
                    'targetType': row[19]
                },
                'transformation': row[1],
                'join': row[2],
                'status': row[3],
                'createdBy': row[4],
                'createdAt': row[5].isoformat() if row[5] else None,
                'updatedAt': row[6].isoformat() if row[6] else None,
                'reviewer': row[7],
                'reviewedAt': row[8].isoformat() if row[8] else None,
                'comments': json.loads(row[9]) if row[9] else []
            })
        
        files.append({
            'id': file_id,
            'name': file_row[1],
            'description': file_row[2],
            'sourceSystem': file_row[3],
            'targetSystem': file_row[4],
            'status': file_row[5],
            'createdBy': file_row[6],
            'createdAt': file_row[7].isoformat() if file_row[7] else None,
            'updatedAt': file_row[8].isoformat() if file_row[8] else None,
            'rows': rows
        })
    
    return files

# API Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    db_status = "disconnected"
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
    
    return {
        "status": "healthy",
        "service": "Data Mapping Backend API",
        "database": db_status,
        "openai": "configured" if client else "not configured"
    }

@app.post("/api/mapping-files")
async def create_mapping_file(mapping_file: MappingFileRequest):
    """Create or update a mapping file"""
    try:
        with get_db_connection() as conn:
            file_id = save_mapping_file_to_db(conn, mapping_file)
            logger.info(f"Mapping file saved successfully: {mapping_file.name}")
            return {"id": file_id, "message": "Mapping file saved successfully"}
    except Exception as e:
        logger.error(f"Failed to save mapping file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save mapping file: {str(e)}")

@app.get("/api/mapping-files")
async def get_mapping_files():
    """Get all mapping files"""
    try:
        with get_db_connection() as conn:
            files = load_mapping_files_from_db(conn)
            logger.info(f"Loaded {len(files)} mapping files")
            return {"files": files}
    except Exception as e:
        logger.error(f"Failed to load mapping files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load mapping files: {str(e)}")

@app.put("/api/mapping-rows/{row_id}/status")
async def update_row_status(row_id: str, status: str, reviewer: Optional[str] = None):
    """Update mapping row status"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE mapping_rows 
                SET status = ?, reviewer = ?, reviewed_at = GETDATE(), updated_at = GETDATE()
                WHERE id = ?
            """, (status, reviewer, row_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Mapping row not found")
            
            conn.commit()
            return {"message": "Status updated successfully"}
    except Exception as e:
        logger.error(f"Failed to update row status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update row status: {str(e)}")

@app.post("/api/mapping-rows/{row_id}/comments")
async def add_row_comment(row_id: str, comment: dict):
    """Add comment to mapping row"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get current comments
            cursor.execute("SELECT comments FROM mapping_rows WHERE id = ?", (row_id,))
            result = cursor.fetchone()
            
            if not result:
                raise HTTPException(status_code=404, detail="Mapping row not found")
            
            current_comments = json.loads(result[0]) if result[0] else []
            current_comments.append(comment.get("comment", ""))
            
            # Update with new comments
            cursor.execute("""
                UPDATE mapping_rows 
                SET comments = ?, updated_at = GETDATE()
                WHERE id = ?
            """, (json.dumps(current_comments), row_id))
            
            conn.commit()
            return {"message": "Comment added successfully"}
    except Exception as e:
        logger.error(f"Failed to add comment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add comment: {str(e)}")

# OpenAI API Routes
@app.post("/api/openai/process-complete")
async def process_complete_openai(request: OpenAIProcessRequest):
    """Complete OpenAI processing pipeline: SQL generation, test data creation, and validation"""
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        logger.info(f"Starting complete OpenAI processing for mapping: {request.mappingInfo.name}")
        
        # Step 1: Generate SQL query
        sql_query = generate_sql_query(request.mappingInfo)
        logger.info("SQL query generated successfully")
        
        # Step 2: Generate test data
        test_data = generate_test_data(request.mappingInfo, sql_query)
        logger.info(f"Generated {len(test_data)} test records")
        
        # Step 3: Validate SQL query
        validation_results = validate_sql_query(sql_query, test_data)
        logger.info("SQL validation completed")
        
        return BackendApiResponse(
            sqlQuery=sql_query,
            testData=test_data,
            validationResults=validation_results
        )
        
    except Exception as e:
        logger.error(f"Complete OpenAI processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Complete OpenAI processing failed: {str(e)}")

@app.post("/api/openai/generate-sql")
async def generate_sql_openai(request: OpenAISQLRequest):
    """Generate SQL query using Azure OpenAI"""
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        sql_query = generate_sql_query(request.mappingInfo)
        return {"sqlQuery": sql_query}
    except Exception as e:
        logger.error(f"SQL generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

@app.post("/api/openai/generate-test-data")
async def generate_test_data_openai(request: OpenAITestDataRequest):
    """Generate test data using Azure OpenAI"""
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        test_data = generate_test_data(request.mappingInfo, request.sqlQuery)
        return {"testData": test_data}
    except Exception as e:
        logger.error(f"Test data generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test data generation failed: {str(e)}")

@app.post("/api/openai/validate-sql")
async def validate_sql_openai(request: OpenAIValidateRequest):
    """Validate SQL query using Azure OpenAI"""
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        validation_results = validate_sql_query(request.sqlQuery, request.testData)
        return {"validationResults": validation_results}
    except Exception as e:
        logger.error(f"SQL validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL validation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
