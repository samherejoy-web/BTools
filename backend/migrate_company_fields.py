#!/usr/bin/env python3
"""
Migration script to add new company-related fields to the tools table
"""

import sqlite3
import os

def migrate_database():
    """Add new company-related fields to tools table"""
    
    db_path = os.path.join(os.path.dirname(__file__), 'marketmind.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # List of new columns to add
        new_columns = [
            ("linkedin_url", "TEXT"),
            ("company_funding", "TEXT"),  # SQLite doesn't have JSON type, we'll store as TEXT
            ("company_news", "TEXT"),
            ("company_location", "TEXT"),
            ("company_founders", "TEXT"),  # SQLite doesn't have JSON type, we'll store as TEXT
            ("about", "TEXT"),
            ("started_on", "TEXT"),
            ("logo_thumbnail_url", "TEXT")
        ]
        
        print("Starting migration to add company-related fields...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(tools)")
        existing_columns = [column[1] for column in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add new columns
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE tools ADD COLUMN {column_name} {column_type}")
                    print(f"Added column: {column_name}")
                except sqlite3.Error as e:
                    print(f"Error adding column {column_name}: {e}")
            else:
                print(f"Column {column_name} already exists, skipping...")
        
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the new schema
        cursor.execute("PRAGMA table_info(tools)")
        updated_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {updated_columns}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate_database()