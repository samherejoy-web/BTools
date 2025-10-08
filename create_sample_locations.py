#!/usr/bin/env python3
"""
Create sample locations for demonstration
"""
import sys
import os
sys.path.append('/app/backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Location, Base
from database import engine, get_db
from datetime import datetime
import uuid
import re

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def create_sample_locations():
    """Create sample locations"""
    # Create database session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Sample locations data
        locations_data = [
            # Major US Cities
            {"name": "New York", "type": "city", "country_code": "US"},
            {"name": "Los Angeles", "type": "city", "country_code": "US"},
            {"name": "Chicago", "type": "city", "country_code": "US"},
            {"name": "San Francisco", "type": "city", "country_code": "US"},
            {"name": "Austin", "type": "city", "country_code": "US"},
            
            # Major International Cities
            {"name": "London", "type": "city", "country_code": "UK"},
            {"name": "Toronto", "type": "city", "country_code": "CA"},
            {"name": "Sydney", "type": "city", "country_code": "AU"},
            {"name": "Berlin", "type": "city", "country_code": "DE"},
            {"name": "Tokyo", "type": "city", "country_code": "JP"},
            
            # Countries
            {"name": "United States", "type": "country", "country_code": "US"},
            {"name": "United Kingdom", "type": "country", "country_code": "UK"},
            {"name": "Canada", "type": "country", "country_code": "CA"},
            {"name": "Australia", "type": "country", "country_code": "AU"},
            {"name": "Germany", "type": "country", "country_code": "DE"},
        ]
        
        created_count = 0
        existing_count = 0
        
        for loc_data in locations_data:
            # Generate slug
            slug = generate_slug(loc_data["name"])
            
            # Check if location already exists
            existing = db.query(Location).filter(Location.slug == slug).first()
            if existing:
                existing_count += 1
                print(f"  ⏭️  {loc_data['name']} already exists")
                continue
            
            # Create SEO templates
            if loc_data["type"] == "city":
                title_template = f"Best {{tool_name}} for {loc_data['name']} | MarketMindAI"
                desc_template = f"Discover the top {{tool_name}} tools and software for businesses in {loc_data['name']}. Compare features, pricing, and user reviews."
            else:  # country
                title_template = f"Best {{tool_name}} in {loc_data['name']} | MarketMindAI" 
                desc_template = f"Find the best {{tool_name}} tools for businesses in {loc_data['name']}. Expert reviews, comparisons, and recommendations."
            
            # Create location
            location = Location(
                id=str(uuid.uuid4()),
                name=loc_data["name"],
                slug=slug,
                type=loc_data["type"],
                country_code=loc_data["country_code"],
                is_active=True,
                seo_title_template=title_template,
                seo_description_template=desc_template
            )
            
            db.add(location)
            created_count += 1
            print(f"  ✅ Created {loc_data['name']} ({loc_data['type']})")
        
        # Commit all changes
        db.commit()
        
        print(f"\n📊 Summary:")
        print(f"  • Created: {created_count} new locations")
        print(f"  • Existing: {existing_count} locations")
        print(f"  • Total: {created_count + existing_count} locations")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating locations: {e}")
        return False
    
    finally:
        db.close()

def main():
    """Main function"""
    print("🏙️ CREATING SAMPLE LOCATIONS")
    print("="*50)
    
    if create_sample_locations():
        print("\n🎉 Sample locations created successfully!")
        print("\n💡 Next steps:")
        print("  1. Go to SuperAdmin panel at /superadmin/sitemap")
        print("  2. Click 'Generate Sitemap' to create location-based URLs")
        print("  3. Check the sitemap.xml for new entries")
    else:
        print("\n❌ Failed to create sample locations")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)