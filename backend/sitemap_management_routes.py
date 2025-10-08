from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Location, SitemapEntry, Tool, Blog, Category
from auth import get_current_superadmin, get_current_admin
import uuid
from datetime import datetime
import re

router = APIRouter()

class LocationCreate(BaseModel):
    name: str
    type: str  # "city" or "country"
    country_code: Optional[str] = None
    seo_title_template: Optional[str] = None
    seo_description_template: Optional[str] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    country_code: Optional[str] = None
    is_active: Optional[bool] = None
    seo_title_template: Optional[str] = None
    seo_description_template: Optional[str] = None

class SitemapEntryCreate(BaseModel):
    url_path: str
    page_type: str
    tool_id: Optional[str] = None
    location_id: Optional[str] = None
    priority: Optional[float] = 0.5
    change_frequency: Optional[str] = "weekly"

class SitemapEntryUpdate(BaseModel):
    priority: Optional[float] = None
    change_frequency: Optional[str] = None
    is_active: Optional[bool] = None

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

# Location Management
@router.get("/api/admin/locations")
async def get_locations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    location_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all locations with filtering"""
    
    query = db.query(Location)
    
    if location_type:
        query = query.filter(Location.type == location_type)
    
    if search:
        query = query.filter(Location.name.contains(search))
    
    locations = query.order_by(Location.name).offset(skip).limit(limit).all()
    
    return [
        {
            "id": loc.id,
            "name": loc.name,
            "slug": loc.slug,
            "type": loc.type,
            "country_code": loc.country_code,
            "is_active": loc.is_active,
            "seo_title_template": loc.seo_title_template,
            "seo_description_template": loc.seo_description_template,
            "created_at": loc.created_at,
            "updated_at": loc.updated_at
        } for loc in locations
    ]

@router.post("/api/admin/locations")
async def create_location(
    location: LocationCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new location"""
    
    # Generate slug
    slug = generate_slug(location.name)
    counter = 1
    while db.query(Location).filter(Location.slug == slug).first():
        slug = f"{generate_slug(location.name)}-{counter}"
        counter += 1
    
    # Set default SEO templates if not provided
    default_title_template = f"Best {{tool_name}} for {location.name} | MarketMindAI"
    default_desc_template = f"Discover the top {{tool_name}} tools and software for {location.name}. Compare features, pricing, and reviews."
    
    db_location = Location(
        id=str(uuid.uuid4()),
        name=location.name,
        slug=slug,
        type=location.type,
        country_code=location.country_code,
        seo_title_template=location.seo_title_template or default_title_template,
        seo_description_template=location.seo_description_template or default_desc_template
    )
    
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    return {"message": "Location created successfully", "location_id": db_location.id}

@router.put("/api/admin/locations/{location_id}")
async def update_location(
    location_id: str,
    location_update: LocationUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update location"""
    
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Update fields
    update_data = location_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "name" and value != location.name:
            # Update slug if name changed
            new_slug = generate_slug(value)
            counter = 1
            while db.query(Location).filter(Location.slug == new_slug, Location.id != location_id).first():
                new_slug = f"{generate_slug(value)}-{counter}"
                counter += 1
            location.slug = new_slug
        
        setattr(location, field, value)
    
    location.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Location updated successfully"}

@router.delete("/api/admin/locations/{location_id}")
async def delete_location(
    location_id: str,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete location"""
    
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Check if location is used in sitemap entries
    entries_count = db.query(SitemapEntry).filter(SitemapEntry.location_id == location_id).count()
    
    if entries_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete location. {entries_count} sitemap entries are using this location."
        )
    
    db.delete(location)
    db.commit()
    
    return {"message": "Location deleted successfully"}

# Sitemap Management
@router.get("/api/admin/sitemap-entries")
async def get_sitemap_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    page_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get sitemap entries with filtering"""
    
    query = db.query(SitemapEntry).options(
        joinedload(SitemapEntry.tool),
        joinedload(SitemapEntry.location)
    )
    
    if page_type:
        query = query.filter(SitemapEntry.page_type == page_type)
    
    if is_active is not None:
        query = query.filter(SitemapEntry.is_active == is_active)
    
    entries = query.order_by(desc(SitemapEntry.last_modified)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": entry.id,
            "url_path": entry.url_path,
            "page_type": entry.page_type,
            "tool_name": entry.tool.name if entry.tool else None,
            "location_name": entry.location.name if entry.location else None,
            "priority": entry.priority,
            "change_frequency": entry.change_frequency,
            "is_active": entry.is_active,
            "last_modified": entry.last_modified,
            "created_at": entry.created_at
        } for entry in entries
    ]

@router.post("/api/admin/sitemap/generate")
async def generate_sitemap_entries(
    regenerate: bool = Query(False, description="Regenerate all entries"),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Auto-generate sitemap entries for tools + locations"""
    
    try:
        if regenerate:
            # Delete existing auto-generated entries
            db.query(SitemapEntry).filter(
                SitemapEntry.page_type.in_(["tool_location", "category_location"])
            ).delete()
            db.commit()
        
        # Get active tools and locations
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        locations = db.query(Location).filter(Location.is_active == True).all()
        categories = db.query(Category).all()
        
        created_count = 0
        
        # Generate tool + location combinations
        for tool in tools:
            for location in locations:
                url_path = f"/tools/{tool.slug}/{location.slug}"
                
                # Check if entry already exists
                existing = db.query(SitemapEntry).filter(
                    SitemapEntry.url_path == url_path
                ).first()
                
                if not existing:
                    entry = SitemapEntry(
                        id=str(uuid.uuid4()),
                        url_path=url_path,
                        page_type="tool_location",
                        tool_id=tool.id,
                        location_id=location.id,
                        priority=0.7,
                        change_frequency="weekly"
                    )
                    db.add(entry)
                    created_count += 1
        
        # Generate category + location combinations
        for category in categories:
            for location in locations:
                url_path = f"/tools/{category.slug}/{location.slug}"
                
                # Check if entry already exists
                existing = db.query(SitemapEntry).filter(
                    SitemapEntry.url_path == url_path
                ).first()
                
                if not existing:
                    entry = SitemapEntry(
                        id=str(uuid.uuid4()),
                        url_path=url_path,
                        page_type="category_location",
                        location_id=location.id,
                        priority=0.6,
                        change_frequency="weekly"
                    )
                    db.add(entry)
                    created_count += 1
        
        db.commit()
        
        return {
            "message": f"Successfully generated {created_count} sitemap entries",
            "created_count": created_count,
            "total_tools": len(tools),
            "total_locations": len(locations),
            "total_categories": len(categories)
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate sitemap entries: {str(e)}")

@router.put("/api/admin/sitemap-entries/{entry_id}")
async def update_sitemap_entry(
    entry_id: str,
    entry_update: SitemapEntryUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update sitemap entry"""
    
    entry = db.query(SitemapEntry).filter(SitemapEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Sitemap entry not found")
    
    # Update fields
    update_data = entry_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    entry.last_modified = datetime.utcnow()
    entry.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Sitemap entry updated successfully"}

@router.delete("/api/admin/sitemap-entries/{entry_id}")
async def delete_sitemap_entry(
    entry_id: str,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete sitemap entry"""
    
    entry = db.query(SitemapEntry).filter(SitemapEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Sitemap entry not found")
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Sitemap entry deleted successfully"}

@router.post("/api/admin/sitemap-entries")
async def create_custom_sitemap_entry(
    entry: SitemapEntryCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create custom sitemap entry"""
    
    # Check if URL path already exists
    existing = db.query(SitemapEntry).filter(SitemapEntry.url_path == entry.url_path).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sitemap entry with this URL path already exists")
    
    db_entry = SitemapEntry(
        id=str(uuid.uuid4()),
        url_path=entry.url_path,
        page_type=entry.page_type,
        tool_id=entry.tool_id,
        location_id=entry.location_id,
        priority=entry.priority,
        change_frequency=entry.change_frequency
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return {"message": "Custom sitemap entry created successfully", "entry_id": db_entry.id}

# Bulk Operations
@router.post("/api/admin/locations/bulk-create")
async def bulk_create_locations(
    locations_data: List[LocationCreate],
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Bulk create locations"""
    
    created_locations = []
    errors = []
    
    for location_data in locations_data:
        try:
            # Generate slug
            slug = generate_slug(location_data.name)
            counter = 1
            while db.query(Location).filter(Location.slug == slug).first():
                slug = f"{generate_slug(location_data.name)}-{counter}"
                counter += 1
            
            # Set default SEO templates
            default_title_template = f"Best {{tool_name}} for {location_data.name} | MarketMindAI"
            default_desc_template = f"Discover the top {{tool_name}} tools and software for {location_data.name}. Compare features, pricing, and reviews."
            
            db_location = Location(
                id=str(uuid.uuid4()),
                name=location_data.name,
                slug=slug,
                type=location_data.type,
                country_code=location_data.country_code,
                seo_title_template=location_data.seo_title_template or default_title_template,
                seo_description_template=location_data.seo_description_template or default_desc_template
            )
            
            db.add(db_location)
            created_locations.append(location_data.name)
            
        except Exception as e:
            errors.append(f"{location_data.name}: {str(e)}")
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "message": f"Bulk creation completed. {len(created_locations)} locations created.",
        "created_locations": created_locations,
        "errors": errors
    }