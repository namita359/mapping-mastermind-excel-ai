
# Data Mapping Backend API

A FastAPI backend service that provides AI-powered SQL generation, test data creation, and validation using Azure OpenAI.

## Features

- **SQL Generation**: Generate SQL queries from data mapping specifications
- **Test Data Creation**: Create realistic test data for generated SQL queries  
- **SQL Validation**: Validate SQL queries using both execution testing and AI analysis
- **Complete Pipeline**: Process all steps in a single API call for efficiency

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Azure OpenAI**
   
   Copy `.env.example` to `.env` and fill in your Azure OpenAI credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   - `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
   - `AZURE_OPENAI_KEY`: Your Azure OpenAI API key
   - `AZURE_OPENAI_API_VERSION`: API version (default: 2024-02-01)
   - `AZURE_OPENAI_DEPLOYMENT_NAME`: Your GPT model deployment name

3. **Run the Server**
   ```bash
   python main.py
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 3000 --reload
   ```

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### Complete Processing Pipeline
- `POST /api/openai/process-complete` - Run the complete analysis pipeline
  - Generates SQL query
  - Creates test data
  - Validates the query
  - Returns all results in one response

### Individual Operations
- `POST /api/openai/generate-sql` - Generate SQL query only
- `POST /api/openai/generate-test-data` - Generate test data for a SQL query
- `POST /api/openai/validate-sql` - Validate a SQL query with test data

## Request/Response Format

### Mapping Info Structure
```json
{
  "name": "Customer Data Mapping",
  "rows": [
    {
      "sourceColumn": {
        "malcode": "SRC",
        "table": "customers",
        "column": "customer_id"
      },
      "targetColumn": {
        "malcode": "TGT", 
        "table": "customer_master",
        "column": "id"
      },
      "dataType": "integer",
      "transformationLogic": "Direct mapping"
    }
  ]
}
```

### Complete Response Structure
```json
{
  "sqlQuery": "SELECT ...",
  "testData": [...],
  "validationResults": {
    "isValid": true,
    "message": "SQL query is valid",
    "executedResults": [...],
    "errors": [],
    "suggestions": []
  }
}
```

## Configuration for Frontend

Point your frontend to this backend by setting the Backend API URL to:
```
http://localhost:3000
```

Or your deployed backend URL in production.

## Deployment

For production deployment, consider:

1. **Environment Variables**: Set all required Azure OpenAI credentials
2. **CORS**: Update CORS origins to match your frontend domain
3. **Security**: Add authentication/authorization as needed
4. **Logging**: Configure appropriate log levels
5. **Rate Limiting**: Add rate limiting for API endpoints
6. **Health Monitoring**: Set up monitoring for the `/health` endpoint

## Error Handling

The API includes comprehensive error handling:
- Azure OpenAI API failures
- JSON parsing errors
- SQL execution errors
- Database connection issues

All errors are logged and return appropriate HTTP status codes with descriptive messages.
