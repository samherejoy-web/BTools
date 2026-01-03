#!/usr/bin/env python3
"""Create a test superadmin user for MarketMindAI"""

import sys
sys.path.append('/app/backend')

from database import SessionLocal
from models import User
from auth import get_password_hash
import uuid
from datetime import datetime

def create_superadmin():
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == "admin@marketmind.com").first()
        if existing:
            print("Superadmin user already exists!")
            return
        
        # Create superadmin
        superadmin = User(
            id=str(uuid.uuid4()),
            email="admin@marketmind.com",
            username="superadmin",
            hashed_password=get_password_hash("admin123"),
            full_name="Super Admin",
            role="superadmin",
            is_active=True,
            is_email_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(superadmin)
        db.commit()
        
        print("✅ Superadmin user created successfully!")
        print(f"Email: admin@marketmind.com")
        print(f"Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating superadmin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()
