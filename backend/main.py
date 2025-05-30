
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from openai import AzureOpenAI
import json
import sqlite3
import tempfile
from contextlib import contextmanager
import logging

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

# Pydantic models for request/response
class SourceColumn(BaseModel):
    malcode: str
    table: str
    column: str

class TargetColumn(BaseModel):
    malcode: str
    table: str
    column: str

class MappingRow(BaseModel):
    sourceColumn: SourceColumn
    targetColumn: TargetColumn
    dataType: str
    transformationLogic: Optional[str] = ""

class MappingInfo(BaseModel):
    name: str
    rows: List[MappingRow]

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

class SQLGenerationRequest(BaseModel):
    mappingInfo: MappingInfo

class TestDataGenerationRequest(BaseModel):
    mappingInfo: MappingInfo
    sqlQuery: str

class SQLValidationRequest(BaseModel):
    sqlQuery: str
    testData: List[Dict[str, Any]]

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")

if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
    raise ValueError("Azure OpenAI configuration is missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY environment variables.")

# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
)

@contextmanager
def get_temp_db():
    """Create a temporary SQLite database for testing SQL queries"""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
        db_path = tmp_file.name
    
    try:
        conn = sqlite3.connect(db_path)
        yield conn
    finally:
        conn.close()
        os.unlink(db_path)

def call_azure_openai(messages: List[Dict[str, str]], max_tokens: int = 2000) -> str:
    """Call Azure OpenAI with the given messages"""
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
        raise HTTPException(status_code=500, f"Azure OpenAI API call failed: {str(e)}")

def generate_sql_query(mapping_info: MappingInfo) -> str:
    """Generate SQL query from mapping information using Azure OpenAI"""
    
    # Create a detailed prompt for SQL generation
    mappings_text = "\n".join([
        f"- Map {row.sourceColumn.malcode}.{row.sourceColumn.table}.{row.sourceColumn.column} "
        f"to {row.targetColumn.malcode}.{row.targetColumn.table}.{row.targetColumn.column} "
        f"(Type: {row.dataType})"
        + (f" with transformation: {row.transformationLogic}" if row.transformationLogic else "")
        for row in mapping_info.rows
    ])
    
    prompt = f"""
You are a SQL expert. Generate a SQL query that implements the following data mappings for "{mapping_info.name}":

{mappings_text}

Requirements:
1. Create appropriate source and target table structures
2. Use proper SQL JOIN syntax where needed
3. Include any necessary data transformations
4. Use standard SQL that works with SQLite
5. Include SELECT, FROM, and any needed JOIN clauses
6. Make the query executable and syntactically correct

Return ONLY the SQL query, no explanations or markdown formatting.
"""

    messages = [
        {"role": "system", "content": "You are a SQL expert that generates clean, executable SQL queries."},
        {"role": "user", "content": prompt}
    ]
    
    return call_azure_openai(messages, max_tokens=1500)

def generate_test_data(mapping_info: MappingInfo, sql_query: str) -> List[Dict[str, Any]]:
    """Generate test data using Azure OpenAI"""
    
    mappings_text = "\n".join([
        f"- {row.sourceColumn.malcode}.{row.sourceColumn.table}.{row.sourceColumn.column}: {row.dataType}"
        for row in mapping_info.rows
    ])
    
    prompt = f"""
Generate realistic test data for the following SQL query and mappings:

SQL Query:
{sql_query}

Column Mappings:
{mappings_text}

Requirements:
1. Generate 5-10 test records
2. Include realistic data values appropriate for each data type
3. Ensure data relationships make sense
4. Return data as a JSON array of objects
5. Use column names that match the SQL query

Return ONLY the JSON array, no explanations or markdown formatting.
"""

    messages = [
        {"role": "system", "content": "You are a test data generation expert. Return only valid JSON arrays."},
        {"role": "user", "content": prompt}
    ]
    
    response = call_azure_openai(messages, max_tokens=2000)
    
    try:
        # Clean the response and parse JSON
        cleaned_response = response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        test_data = json.loads(cleaned_response)
        if not isinstance(test_data, list):
            test_data = [test_data]
        
        return test_data
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse test data JSON: {str(e)}")
        logger.error(f"Raw response: {response}")
        # Return fallback test data
        return [{"id": 1, "sample_column": "sample_value"}]

def validate_sql_query(sql_query: str, test_data: List[Dict[str, Any]]) -> ValidationResults:
    """Validate SQL query using Azure OpenAI and actual execution"""
    
    # First, try to execute the query
    execution_results = []
    execution_errors = []
    
    try:
        with get_temp_db() as conn:
            cursor = conn.cursor()
            
            # Create tables and insert test data based on the SQL query structure
            # This is a simplified approach - in production you'd want more sophisticated schema detection
            if test_data:
                # Extract table name from query (simplified)
                table_name = "test_table"
                
                # Create table schema from test data
                if test_data:
                    columns = list(test_data[0].keys())
                    create_table_sql = f"CREATE TABLE {table_name} ({', '.join([f'{col} TEXT' for col in columns])})"
                    cursor.execute(create_table_sql)
                    
                    # Insert test data
                    for record in test_data:
                        placeholders = ', '.join(['?' for _ in record.values()])
                        insert_sql = f"INSERT INTO {table_name} VALUES ({placeholders})"
                        cursor.execute(insert_sql, list(record.values()))
                    
                    conn.commit()
                    
                    # Try to execute the provided SQL query (modified to use our test table)
                    try:
                        # Simple replacement - in production, you'd need more sophisticated SQL parsing
                        test_sql = sql_query.replace("source_table", table_name).replace("target_table", table_name)
                        cursor.execute(test_sql)
                        execution_results = [dict(zip([desc[0] for desc in cursor.description], row)) 
                                           for row in cursor.fetchall()]
                    except Exception as exec_error:
                        execution_errors.append(f"SQL execution error: {str(exec_error)}")
            
    except Exception as e:
        execution_errors.append(f"Database error: {str(e)}")
    
    # Use Azure OpenAI for validation analysis
    validation_prompt = f"""
Analyze this SQL query for correctness and best practices:

SQL Query:
{sql_query}

Test Data Sample:
{json.dumps(test_data[:2] if test_data else [], indent=2)}

Execution Errors (if any):
{json.dumps(execution_errors)}

Provide validation results in the following JSON format:
{{
    "isValid": boolean,
    "message": "Overall validation message",
    "errors": ["list of specific errors found"],
    "suggestions": ["list of improvement suggestions"]
}}

Return ONLY the JSON object, no explanations or markdown formatting.
"""

    messages = [
        {"role": "system", "content": "You are a SQL validation expert. Return only valid JSON objects."},
        {"role": "user", "content": validation_prompt}
    ]
    
    response = call_azure_openai(messages, max_tokens=1000)
    
    try:
        # Clean and parse the validation response
        cleaned_response = response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        validation_data = json.loads(cleaned_response)
        
        return ValidationResults(
            isValid=validation_data.get("isValid", len(execution_errors) == 0),
            message=validation_data.get("message", "SQL query validation completed"),
            executedResults=execution_results if execution_results else None,
            errors=validation_data.get("errors", execution_errors),
            suggestions=validation_data.get("suggestions", [])
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse validation JSON: {str(e)}")
        return ValidationResults(
            isValid=len(execution_errors) == 0,
            message="SQL query validation completed with limited analysis",
            executedResults=execution_results if execution_results else None,
            errors=execution_errors,
            suggestions=["Consider reviewing the SQL syntax and structure"]
        )

# API Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Data Mapping Backend API"}

@app.post("/api/openai/process-complete")
async def process_complete(request: SQLGenerationRequest) -> BackendApiResponse:
    """Complete processing pipeline: generate SQL, create test data, and validate"""
    try:
        logger.info(f"Starting complete processing for mapping: {request.mappingInfo.name}")
        
        # Step 1: Generate SQL
        sql_query = generate_sql_query(request.mappingInfo)
        logger.info("SQL query generated successfully")
        
        # Step 2: Generate test data
        test_data = generate_test_data(request.mappingInfo, sql_query)
        logger.info(f"Generated {len(test_data)} test records")
        
        # Step 3: Validate SQL
        validation_results = validate_sql_query(sql_query, test_data)
        logger.info("SQL validation completed")
        
        return BackendApiResponse(
            sqlQuery=sql_query,
            testData=test_data,
            validationResults=validation_results
        )
        
    except Exception as e:
        logger.error(f"Complete processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/api/openai/generate-sql")
async def generate_sql(request: SQLGenerationRequest):
    """Generate SQL query from mapping information"""
    try:
        sql_query = generate_sql_query(request.mappingInfo)
        return {"sqlQuery": sql_query}
    except Exception as e:
        logger.error(f"SQL generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

@app.post("/api/openai/generate-test-data")
async def generate_test_data_endpoint(request: TestDataGenerationRequest):
    """Generate test data for SQL query"""
    try:
        test_data = generate_test_data(request.mappingInfo, request.sqlQuery)
        return {"testData": test_data}
    except Exception as e:
        logger.error(f"Test data generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test data generation failed: {str(e)}")

@app.post("/api/openai/validate-sql")
async def validate_sql(request: SQLValidationRequest):
    """Validate SQL query with test data"""
    try:
        validation_results = validate_sql_query(request.sqlQuery, request.testData)
        return {"validationResults": validation_results}
    except Exception as e:
        logger.error(f"SQL validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL validation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
