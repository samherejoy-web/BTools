"""
Migration script to add email verification fields to existing users table
"""
from sqlalchemy import create_engine, text
import os

def migrate_database():
    # Database URL (same as in database.py)
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./marketmind.db")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Add new columns to users table
            print("Adding email verification columns to users table...")
            
            # Add is_email_verified column (default False for existing users)
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE"))
                print("✓ Added is_email_verified column")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("✓ is_email_verified column already exists")
                else:
                    raise e
            
            # Add email_verification_token column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255)"))
                print("✓ Added email_verification_token column")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("✓ email_verification_token column already exists")
                else:
                    raise e
            
            # Add email_verification_expires column
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN email_verification_expires DATETIME"))
                print("✓ Added email_verification_expires column")
            except Exception as e:
                if "duplicate column name" in str(e).lower():
                    print("✓ email_verification_expires column already exists")
                else:
                    raise e
            
            # For existing users, set email as verified (backward compatibility)
            # This way existing users can continue to login without verification
            result = conn.execute(text("UPDATE users SET is_email_verified = TRUE WHERE is_email_verified IS NULL"))
            print(f"✓ Verified {result.rowcount} existing users")
            
            conn.commit()
            print("✅ Database migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise e

if __name__ == "__main__":
    migrate_database()