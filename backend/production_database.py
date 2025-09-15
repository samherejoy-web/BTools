#!/usr/bin/env python3
"""
Production Database Configuration
Updated database configuration for PostgreSQL production deployment
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base  
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConfig:
    """Database configuration for production"""
    
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.database_url = self._get_database_url()
        
    def _get_database_url(self):
        """Get database URL based on environment"""
        if self.environment == "production":
            # Production PostgreSQL
            return os.getenv("PRODUCTION_DATABASE_URL", 
                           "postgresql://marketmind:secure_password@localhost/marketmind_prod")
        else:
            # Development SQLite
            return os.getenv("DATABASE_URL", "sqlite:///./marketmind.db")
    
    def create_engine_config(self):
        """Create SQLAlchemy engine with appropriate configuration"""
        if "postgresql://" in self.database_url:
            # PostgreSQL configuration
            return create_engine(
                self.database_url,
                poolclass=QueuePool,
                pool_size=20,
                max_overflow=0,
                pool_pre_ping=True,
                pool_recycle=3600,
                echo=False,
                # PostgreSQL specific options
                connect_args={
                    "application_name": "MarketMindAI",
                    "options": "-c timezone=UTC"
                }
            )
        else:
            # SQLite configuration (development)
            return create_engine(
                self.database_url,
                connect_args={"check_same_thread": False} if "sqlite" in self.database_url else {},
                echo=False
            )

# Initialize database configuration
db_config = DatabaseConfig()
engine = db_config.create_engine_config()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_database_info():
    """Get current database configuration info"""
    return {
        "environment": db_config.environment,
        "database_type": "PostgreSQL" if "postgresql://" in db_config.database_url else "SQLite",
        "database_url": db_config.database_url.split("@")[-1] if "@" in db_config.database_url else db_config.database_url,
        "engine_pool_size": getattr(engine.pool, 'size', lambda: 'N/A')(),
        "engine_pool_checked_in": getattr(engine.pool, 'checkedin', lambda: 'N/A')(),
        "engine_pool_checked_out": getattr(engine.pool, 'checkedout', lambda: 'N/A')()
    }