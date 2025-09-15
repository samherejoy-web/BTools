#!/usr/bin/env python3
"""
Production Migration Script: SQLite to PostgreSQL
This script migrates data from SQLite to PostgreSQL for production deployment
"""

import os
import sys
import sqlite3
import logging
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

class DatabaseMigrator:
    def __init__(self):
        self.sqlite_db = "marketmind.db"
        self.postgres_url = os.getenv("PRODUCTION_DATABASE_URL")
        
        if not self.postgres_url:
            raise ValueError("PRODUCTION_DATABASE_URL environment variable not set")
        
        logger.info(f"Migrating from SQLite: {self.sqlite_db}")
        logger.info(f"Migrating to PostgreSQL: {self.postgres_url}")
        
        # Create PostgreSQL engine
        self.postgres_engine = create_engine(
            self.postgres_url,
            poolclass=NullPool,
            echo=False
        )
        
        # Create SQLite connection
        if not os.path.exists(self.sqlite_db):
            raise FileNotFoundError(f"SQLite database not found: {self.sqlite_db}")
        
        self.sqlite_conn = sqlite3.connect(self.sqlite_db)
        self.sqlite_conn.row_factory = sqlite3.Row

    def create_postgres_database(self):
        """Create PostgreSQL database if it doesn't exist"""
        try:
            # Parse database URL to get database name
            import urllib.parse as urlparse
            parsed = urlparse.urlparse(self.postgres_url)
            db_name = parsed.path[1:]  # Remove leading slash
            
            # Connect to postgres default database to create our database
            admin_url = self.postgres_url.replace(f"/{db_name}", "/postgres")
            
            logger.info(f"Creating database '{db_name}' if not exists...")
            
            conn = psycopg2.connect(admin_url)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            # Check if database exists
            cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
            exists = cursor.fetchone()
            
            if not exists:
                cursor.execute(f'CREATE DATABASE "{db_name}"')
                logger.info(f"Database '{db_name}' created successfully")
            else:
                logger.info(f"Database '{db_name}' already exists")
                
            cursor.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error creating database: {e}")
            raise

    def create_postgres_tables(self):
        """Create tables in PostgreSQL"""
        logger.info("Creating PostgreSQL tables...")
        
        try:
            from models import Base
            Base.metadata.create_all(bind=self.postgres_engine)
            logger.info("PostgreSQL tables created successfully")
        except Exception as e:
            logger.error(f"Error creating PostgreSQL tables: {e}")
            raise

    def get_table_data(self, table_name):
        """Get all data from SQLite table"""
        cursor = self.sqlite_conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name}")
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        data = []
        for row in rows:
            data.append(dict(zip(columns, row)))
        
        logger.info(f"Retrieved {len(data)} rows from {table_name}")
        return data, columns

    def migrate_table(self, table_name, postgres_table_name=None):
        """Migrate data from SQLite table to PostgreSQL"""
        if postgres_table_name is None:
            postgres_table_name = table_name
            
        logger.info(f"Migrating table: {table_name} -> {postgres_table_name}")
        
        try:
            # Get data from SQLite
            data, columns = self.get_table_data(table_name)
            
            if not data:
                logger.warning(f"No data found in table {table_name}")
                return True
            
            # Insert data into PostgreSQL
            with self.postgres_engine.connect() as conn:
                # Clear existing data
                conn.execute(text(f"TRUNCATE TABLE {postgres_table_name} CASCADE"))
                
                # Prepare column names for insertion
                column_names = ', '.join(columns)
                placeholders = ', '.join([f":{col}" for col in columns])
                
                insert_sql = f"""
                INSERT INTO {postgres_table_name} ({column_names}) 
                VALUES ({placeholders})
                """
                
                # Insert data in batches
                batch_size = 100
                for i in range(0, len(data), batch_size):
                    batch = data[i:i + batch_size]
                    conn.execute(text(insert_sql), batch)
                    
                conn.commit()
                logger.info(f"Successfully migrated {len(data)} rows to {postgres_table_name}")
                
        except Exception as e:
            logger.error(f"Error migrating table {table_name}: {e}")
            raise

    def migrate_all_tables(self):
        """Migrate all tables from SQLite to PostgreSQL"""
        # Define table migration order (respecting foreign key constraints)
        tables_order = [
            'users',
            'categories', 
            'tools',
            'blogs',
            'reviews',
            'seo_pages',
            'user_tool_favorites',
            'tool_categories',
            'blog_comments',
            'blog_likes', 
            'blog_bookmarks',
            'tool_comments',
            'tool_likes'
        ]
        
        migrated_count = 0
        for table in tables_order:
            try:
                # Check if table exists in SQLite
                cursor = self.sqlite_conn.cursor()
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if cursor.fetchone():
                    self.migrate_table(table)
                    migrated_count += 1
                else:
                    logger.warning(f"Table {table} not found in SQLite database")
            except Exception as e:
                logger.error(f"Failed to migrate table {table}: {e}")
                # Continue with other tables
                continue
        
        logger.info(f"Migration completed. {migrated_count} tables migrated successfully.")

    def verify_migration(self):
        """Verify that data was migrated correctly"""
        logger.info("Verifying migration...")
        
        verification_results = {}
        
        try:
            with self.postgres_engine.connect() as postgres_conn:
                # Check record counts for key tables
                key_tables = ['users', 'tools', 'blogs', 'reviews', 'categories']
                
                for table in key_tables:
                    try:
                        # SQLite count
                        sqlite_cursor = self.sqlite_conn.cursor()
                        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table}")
                        sqlite_count = sqlite_cursor.fetchone()[0]
                        
                        # PostgreSQL count
                        result = postgres_conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        postgres_count = result.fetchone()[0]
                        
                        verification_results[table] = {
                            'sqlite_count': sqlite_count,
                            'postgres_count': postgres_count,
                            'match': sqlite_count == postgres_count
                        }
                        
                        if sqlite_count == postgres_count:
                            logger.info(f"✓ {table}: {postgres_count} records migrated successfully")
                        else:
                            logger.warning(f"✗ {table}: SQLite={sqlite_count}, PostgreSQL={postgres_count}")
                            
                    except Exception as e:
                        logger.error(f"Error verifying table {table}: {e}")
                        verification_results[table] = {'error': str(e)}
        
        except Exception as e:
            logger.error(f"Error during verification: {e}")
            return False
        
        # Overall verification
        all_match = all(
            result.get('match', False) 
            for result in verification_results.values() 
            if 'error' not in result
        )
        
        if all_match:
            logger.info("✓ Migration verification successful!")
        else:
            logger.warning("⚠ Migration verification found discrepancies")
        
        return verification_results

    def close_connections(self):
        """Close database connections"""
        if hasattr(self, 'sqlite_conn'):
            self.sqlite_conn.close()
        if hasattr(self, 'postgres_engine'):
            self.postgres_engine.dispose()

def main():
    """Main migration function"""
    logger.info("Starting SQLite to PostgreSQL migration...")
    
    migrator = None
    try:
        migrator = DatabaseMigrator()
        
        # Step 1: Create PostgreSQL database if needed
        migrator.create_postgres_database()
        
        # Step 2: Create tables in PostgreSQL
        migrator.create_postgres_tables()
        
        # Step 3: Migrate all data
        migrator.migrate_all_tables()
        
        # Step 4: Verify migration
        verification_results = migrator.verify_migration()
        
        logger.info("Migration completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False
    
    finally:
        if migrator:
            migrator.close_connections()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)