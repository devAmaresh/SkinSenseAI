from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.database import Base, engine
from app.core.dbconnection import init_database, check_db_health, db_manager
from app.core.config import settings
from app.routers import auth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting up FastAPI application...")
    try:
        init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise e
    
    yield
    
    # Shutdown
    logger.info("Shutting down FastAPI application...")

# Create FastAPI app with lifespan events
app = FastAPI(
    title="SkinSenseAI Backend",
    description="FastAPI backend for SkinSenseAI application",
    version="1.0.0",
    lifespan=lifespan
)

# Enhanced CORS middleware for Expo development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:19006",  # Expo web
        "http://localhost:19000",  # Expo development server
        "exp://localhost:19000",   # Expo development server
        "exp://192.168.1.100:19000",  # Expo on your network IP
        "*",  # Allow all origins in development
    ] if settings.DEBUG else settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "SkinSenseAI FastAPI Backend is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_health = await check_db_health()
    return {
        "status": "healthy" if db_health["status"] == "healthy" else "unhealthy",
        "database": db_health,
        "version": "1.0.0",
        "timestamp": "2024-12-30T12:00:00Z"
    }

@app.get("/db-info")
async def database_info():
    """Database information endpoint (for debugging)."""
    if not settings.DEBUG:
        raise HTTPException(status_code=404, detail="Not found")
    
    return {
        "connection_info": db_manager.get_connection_info(),
        "tables": db_manager.get_table_info(),
        "health": await check_db_health()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Important: Bind to all interfaces for Expo access
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )