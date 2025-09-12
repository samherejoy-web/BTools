"""
Migration script to add OTP fields to existing users table
"""
from sqlalchemy import create_engine, text
import os

def migrate_database():
    # Database URL (same as in database.py)
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./marketmind.db")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Add new OTP columns to users table
            print("Adding OTP columns to users table...")
            
            # Add email_otp_code column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_otp_code VARCHAR(255)"))
                print("✓ Added email_otp_code column")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("✓ email_otp_code column already exists")
                else:
                    raise e
            
            # Add email_otp_expires column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_otp_expires DATETIME"))
                print("✓ Added email_otp_expires column")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("✓ email_otp_expires column already exists")
                else:
                    raise e
            
            conn.commit()
            print("✅ OTP fields migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise e

if __name__ == "__main__":
    migrate_database()