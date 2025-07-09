from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
import json
from app.core.database import Base, engine
from app.core.dbconnection import init_database, check_db_health, db_manager
from app.core.config import settings
from app.models import *
from app.routers import auth, skin, chat, skin_memory

# Firebase Admin SDK imports
import firebase_admin
from firebase_admin import credentials

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("Starting SkinSenseAI Backend...")

    try:
        # Initialize Firebase Admin SDK from environment
        if not firebase_admin._apps:
            firebase_json = os.getenv("FIREBASE_JSON")

            if firebase_json:
                try:
                    firebase_dict = json.loads(firebase_json)
                    cred = credentials.Certificate(firebase_dict)
                    firebase_admin.initialize_app(cred)
                    logger.info(
                        "Firebase Admin SDK initialized from environment variable"
                    )
                except json.JSONDecodeError as je:
                    logger.error(f"Invalid JSON in FIREBASE_CREDENTIAL: {je}")
                    raise
                except Exception as fe:
                    logger.error(f"Firebase initialization failed: {fe}")
                    raise
            else:
                logger.error("FIREBASE_CREDENTIAL environment variable not found")
                raise RuntimeError("Missing Firebase credentials")

        # Initialize database
        init_database()
        logger.info("Database initialized successfully")

        # Test database connection
        db_health = await check_db_health()
        logger.info(f"Database health: {db_health}")

        yield

    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise e
    finally:
        logger.info("Shutting down SkinSenseAI Backend...")


# Create FastAPI app with lifespan events
app = FastAPI(
    title="SkinSenseAI Backend",
    description="FastAPI backend for SkinSenseAI application with Gemini AI integration",
    version="1.0.0",
    lifespan=lifespan,
)

# Enhanced CORS middleware for Expo development
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        [
            "http://localhost:8000",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:19006",  # Expo web
            "http://localhost:19000",  # Expo development server
            "exp://localhost:19000",  # Expo development server
            "exp://192.168.1.100:19000",  # Expo on your network IP
            "*",  # Allow all origins in development
        ]
        if settings.DEBUG
        else settings.ALLOWED_ORIGINS
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(skin.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(skin_memory.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "SkinSenseAI Backend API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_health = await check_db_health()
    return {"status": "healthy", "database": db_health, "version": "1.0.0"}


@app.get("/db-info")
async def database_info():
    """Database information endpoint (for debugging)."""
    try:
        return db_manager.get_connection_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database info error: {str(e)}")
