
import json
import logging
from typing import List, Dict, Any
from fastapi import HTTPException

from config import get_openai_client, AZURE_OPENAI_DEPLOYMENT_NAME
from models import MappingInfo, ValidationResults

logger = logging.getLogger(__name__)

def call_azure_openai(messages: List[Dict[str, str]], max_tokens: int = 2000) -> str:
    """Call Azure OpenAI with the given messages"""
    client = get_openai_client()
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
