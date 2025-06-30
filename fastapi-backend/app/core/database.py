from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging
from .config import settings

# Configure logging for database operations
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Create database engine with proper configuration
if settings.DATABASE_URL.startswith("postgresql://"):
    # For PostgreSQL
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections every 5 minutes
        pool_size=10,        # Connection pool size
        max_overflow=20,     # Maximum overflow connections
        echo=False           # Set to True for SQL query logging
    )
elif settings.DATABASE_URL.startswith("sqlite://"):
    # For SQLite (development/testing)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )
else:
    # Generic engine creation
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

# Database dependency
def get_db():
    """
    Database dependency for FastAPI routes.
    Creates a new database session for each request.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

# Database connection test function
async def test_db_connection():
    """Test database connection."""
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            return True
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        return False

# Create all tables
def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logging.info("Database tables created successfully")
    except Exception as e:
        logging.error(f"Error creating tables: {e}")
        raise e

# Database health check
def get_db_health():
    """Get database health status."""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
            return {
                "status": "healthy",
                "database": "connected"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }