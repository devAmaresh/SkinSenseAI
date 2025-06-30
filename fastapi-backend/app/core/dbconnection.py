import asyncio
import logging
from contextlib import contextmanager
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from .database import engine, SessionLocal, Base
from .config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Database connection and management utilities."""
    
    def __init__(self):
        self.engine = engine
        self.SessionLocal = SessionLocal
    
    @contextmanager
    def get_db_session(self):
        """Context manager for database sessions."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    def test_connection(self):
        """Test database connection."""
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                return result.fetchone() is not None
        except OperationalError as e:
            logger.error(f"Database connection failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected database error: {e}")
            return False
    
    def check_database_exists(self):
        """Check if database exists and is accessible."""
        try:
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()
            return True
        except Exception as e:
            logger.error(f"Database check failed: {e}")
            return False
    
    def create_all_tables(self):
        """Create all tables defined in models."""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("All tables created successfully")
            return True
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            return False
    
    def drop_all_tables(self):
        """Drop all tables (use with caution!)."""
        try:
            Base.metadata.drop_all(bind=self.engine)
            logger.info("All tables dropped successfully")
            return True
        except Exception as e:
            logger.error(f"Error dropping tables: {e}")
            return False
    
    def get_table_info(self):
        """Get information about existing tables."""
        try:
            inspector = inspect(self.engine)
            tables = []
            for table_name in inspector.get_table_names():
                columns = inspector.get_columns(table_name)
                tables.append({
                    "name": table_name,
                    "columns": [col["name"] for col in columns]
                })
            return tables
        except Exception as e:
            logger.error(f"Error getting table info: {e}")
            return []
    
    def execute_raw_sql(self, sql_query):
        """Execute raw SQL query (use with caution!)."""
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(sql_query))
                return result.fetchall()
        except Exception as e:
            logger.error(f"Error executing SQL: {e}")
            raise
    
    def get_connection_info(self):
        """Get database connection information."""
        return {
            "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "Hidden",
            "engine": str(self.engine.url),
            "pool_size": getattr(self.engine.pool, 'size', None),
            "pool_checked_out": getattr(self.engine.pool, 'checkedout', None),
            "pool_overflow": getattr(self.engine.pool, 'overflow', None),
        }

# Create global database manager instance
db_manager = DatabaseManager()

# Database initialization function
def init_database():
    """Initialize database with tables."""
    logger.info("Initializing database...")
    
    # Test connection
    if not db_manager.test_connection():
        logger.error("Failed to connect to database")
        raise ConnectionError("Database connection failed")
    
    # Create tables
    if not db_manager.create_all_tables():
        logger.error("Failed to create database tables")
        raise RuntimeError("Table creation failed")
    
    logger.info("Database initialized successfully")

# Async database health check
async def check_db_health():
    """Async database health check."""
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, db_manager.test_connection)
        return {
            "status": "healthy" if result else "unhealthy",
            "database": "connected" if result else "disconnected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# Database connection decorator
def with_db_session(func):
    """Decorator for functions that need database session."""
    def wrapper(*args, **kwargs):
        with db_manager.get_db_session() as session:
            return func(session, *args, **kwargs)
    return wrapper