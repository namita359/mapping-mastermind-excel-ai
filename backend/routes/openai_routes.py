
import logging
from fastapi import APIRouter, HTTPException

from config import get_openai_client
from openai_service import generate_sql_query, generate_test_data, validate_sql_query
from models import (
    OpenAIProcessRequest, OpenAISQLRequest, OpenAITestDataRequest, 
    OpenAIValidateRequest, BackendApiResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/openai", tags=["openai"])

@router.post("/process-complete")
async def process_complete_openai(request: OpenAIProcessRequest):
    """Complete OpenAI processing pipeline: SQL generation, test data creation, and validation"""
    client = get_openai_client()
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

@router.post("/generate-sql")
async def generate_sql_openai(request: OpenAISQLRequest):
    """Generate SQL query using Azure OpenAI"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        sql_query = generate_sql_query(request.mappingInfo)
        return {"sqlQuery": sql_query}
    except Exception as e:
        logger.error(f"SQL generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

@router.post("/generate-test-data")
async def generate_test_data_openai(request: OpenAITestDataRequest):
    """Generate test data using Azure OpenAI"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        test_data = generate_test_data(request.mappingInfo, request.sqlQuery)
        return {"testData": test_data}
    except Exception as e:
        logger.error(f"Test data generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test data generation failed: {str(e)}")

@router.post("/validate-sql")
async def validate_sql_openai(request: OpenAIValidateRequest):
    """Validate SQL query using Azure OpenAI"""
    client = get_openai_client()
    if not client:
        raise HTTPException(status_code=500, detail="Azure OpenAI is not configured")
    
    try:
        validation_results = validate_sql_query(request.sqlQuery, request.testData)
        return {"validationResults": validation_results}
    except Exception as e:
        logger.error(f"SQL validation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL validation failed: {str(e)}")
