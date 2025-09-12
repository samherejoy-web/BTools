#!/usr/bin/env python3
"""
Migration script to add new optional fields to the tools table
"""

import sqlite3
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def migrate_tools_table():
    """Add new optional fields to the tools table"""
    
    db_path = "/app/backend/marketmind.db"
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List of new columns to add
        new_columns = [
            ("domain_website", "TEXT"),
            ("linkedin_url", "TEXT"), 
            ("founded_year", "INTEGER"),
            ("about_section", "TEXT"),
            ("founders", "TEXT"),  # JSON stored as TEXT
            ("latest_news", "TEXT"),
            ("latest_feeds", "TEXT"),  # JSON stored as TEXT
            ("job_openings", "TEXT"),  # JSON stored as TEXT
            ("revenue", "TEXT"),
            ("locations", "TEXT"),  # JSON stored as TEXT
            ("company_size", "TEXT"),
            ("funding_info", "TEXT"),  # JSON stored as TEXT
            ("tech_stack", "TEXT"),  # JSON stored as TEXT
            ("integrations", "TEXT"),  # JSON stored as TEXT
            ("languages_supported", "TEXT"),  # JSON stored as TEXT
            ("target_audience", "TEXT"),  # JSON stored as TEXT
            ("use_cases", "TEXT"),  # JSON stored as TEXT
            ("alternatives", "TEXT"),  # JSON stored as TEXT
            ("local_logo_path", "TEXT")
        ]
        
        # Check which columns already exist
        cursor.execute("PRAGMA table_info(tools)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        
        # Add missing columns
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                alter_sql = f"ALTER TABLE tools ADD COLUMN {column_name} {column_type}"
                print(f"Adding column: {column_name}")
                cursor.execute(alter_sql)
            else:
                print(f"Column {column_name} already exists, skipping...")
        
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the migration
        cursor.execute("PRAGMA table_info(tools)")
        columns = cursor.fetchall()
        print(f"\nTools table now has {len(columns)} columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("Starting tools table migration...")
    success = migrate_tools_table()
    if success:
        print("Migration completed successfully!")
        sys.exit(0)
    else:
        print("Migration failed!")
        sys.exit(1)