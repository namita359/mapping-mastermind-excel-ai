
# Data Mapping Backend API

FastAPI backend service for handling Azure SQL Database operations for the data mapping application.

## Features

- Azure SQL Database integration for persistent storage
- CRUD operations for mapping files and rows
- Status updates and comment management
- Azure OpenAI integration for AI-powered features
- Health check endpoints
- CORS support for frontend integration

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` and update with your configuration:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `AZURE_SQL_SERVER`: Your Azure SQL server hostname
   - `AZURE_SQL_DATABASE`: Database name
   - `AZURE_SQL_USERNAME`: Database username
   - `AZURE_SQL_PASSWORD`: Database password

   Optional variables:
   - `AZURE_OPENAI_ENDPOINT`: For AI features
   - `AZURE_OPENAI_KEY`: OpenAI API key
   - `AZURE_OPENAI_DEPLOYMENT_NAME`: Model deployment name

3. **Database Setup**
   Ensure your Azure SQL Database has the required tables:
   - `mapping_files`
   - `mapping_columns` 
   - `mapping_rows`

4. **Run the Service**
   ```bash
   python main.py
   ```
   
   Or with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 3000 --reload
   ```

## API Endpoints

### Database Operations
- `GET /api/mapping-files` - Get all mapping files
- `POST /api/mapping-files` - Create/update mapping file
- `PUT /api/mapping-rows/{row_id}/status` - Update row status
- `POST /api/mapping-rows/{row_id}/comments` - Add comment to row

### AI Features (if configured)
- `POST /api/openai/process-complete` - Complete analysis pipeline
- `POST /api/openai/generate-sql` - Generate SQL queries
- `POST /api/openai/generate-test-data` - Generate test data
- `POST /api/openai/validate-sql` - Validate SQL queries

### Health Check
- `GET /health` - Service and database health status

## Docker Support

Build and run with Docker:

```bash
docker build -t data-mapping-backend .
docker run -p 3000:3000 --env-file .env data-mapping-backend
```

## Development

The service includes comprehensive error handling and logging. Check the console output for debugging information.

For development, run with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3000
```
