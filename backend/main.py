
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health_routes import router as health_router
from routes.mapping_routes import router as mapping_router
from routes.openai_routes import router as openai_router
from routes.ddl_routes import router as ddl_router
from routes.metadata_routes import router as metadata_router

app = FastAPI(title="Data Mapping Backend API - Split Tables", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(mapping_router)
app.include_router(openai_router)
app.include_router(ddl_router)
app.include_router(metadata_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
