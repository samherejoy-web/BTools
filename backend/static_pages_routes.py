from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from database import get_db
from models import User, StaticPage
from auth import get_current_superadmin
import uuid
from datetime import datetime

router = APIRouter()

class StaticPageCreate(BaseModel):
    page_key: str
    title: str
    content: str
    meta_description: Optional[str] = None
    is_published: bool = True

class StaticPageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None

# Public endpoints for fetching static pages
@router.get("/api/pages/{page_key}")
async def get_static_page(
    page_key: str,
    db: Session = Depends(get_db)
):
    """Get a static page by its key (public endpoint)"""
    
    page = db.query(StaticPage).filter(
        StaticPage.page_key == page_key,
        StaticPage.is_published == True
    ).first()
    
    if not page:
        raise HTTPException(status_code=404, detail=f"Page '{page_key}' not found")
    
    return {
        "id": page.id,
        "page_key": page.page_key,
        "title": page.title,
        "content": page.content,
        "meta_description": page.meta_description,
        "updated_at": page.updated_at
    }

@router.get("/api/pages")
async def get_all_static_pages(
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all static pages (public endpoint)"""
    
    query = db.query(StaticPage)
    if published_only:
        query = query.filter(StaticPage.is_published == True)
    
    pages = query.all()
    
    return [
        {
            "id": page.id,
            "page_key": page.page_key,
            "title": page.title,
            "meta_description": page.meta_description,
            "updated_at": page.updated_at
        } for page in pages
    ]

# SuperAdmin endpoints for managing static pages
@router.get("/api/superadmin/static-pages")
async def get_all_static_pages_admin(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all static pages for admin management"""
    
    pages = db.query(StaticPage).order_by(StaticPage.page_key).all()
    
    return [
        {
            "id": page.id,
            "page_key": page.page_key,
            "title": page.title,
            "content": page.content,
            "meta_description": page.meta_description,
            "is_published": page.is_published,
            "created_at": page.created_at,
            "updated_at": page.updated_at
        } for page in pages
    ]

@router.get("/api/superadmin/static-pages/{page_key}")
async def get_static_page_admin(
    page_key: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get a specific static page for editing"""
    
    page = db.query(StaticPage).filter(StaticPage.page_key == page_key).first()
    
    if not page:
        raise HTTPException(status_code=404, detail=f"Page '{page_key}' not found")
    
    return {
        "id": page.id,
        "page_key": page.page_key,
        "title": page.title,
        "content": page.content,
        "meta_description": page.meta_description,
        "is_published": page.is_published,
        "created_at": page.created_at,
        "updated_at": page.updated_at
    }

@router.post("/api/superadmin/static-pages")
async def create_static_page(
    page_data: StaticPageCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create a new static page"""
    
    # Check if page key already exists
    existing_page = db.query(StaticPage).filter(StaticPage.page_key == page_data.page_key).first()
    if existing_page:
        raise HTTPException(status_code=400, detail=f"Page with key '{page_data.page_key}' already exists")
    
    page = StaticPage(
        id=str(uuid.uuid4()),
        page_key=page_data.page_key,
        title=page_data.title,
        content=page_data.content,
        meta_description=page_data.meta_description,
        is_published=page_data.is_published
    )
    
    db.add(page)
    db.commit()
    db.refresh(page)
    
    return {"message": "Static page created successfully", "page_id": page.id}

@router.put("/api/superadmin/static-pages/{page_key}")
async def update_static_page(
    page_key: str,
    page_update: StaticPageUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update an existing static page"""
    
    page = db.query(StaticPage).filter(StaticPage.page_key == page_key).first()
    if not page:
        raise HTTPException(status_code=404, detail=f"Page '{page_key}' not found")
    
    # Update fields
    update_data = page_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(page, field, value)
    
    page.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Static page updated successfully"}

@router.delete("/api/superadmin/static-pages/{page_key}")
async def delete_static_page(
    page_key: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete a static page"""
    
    page = db.query(StaticPage).filter(StaticPage.page_key == page_key).first()
    if not page:
        raise HTTPException(status_code=404, detail=f"Page '{page_key}' not found")
    
    db.delete(page)
    db.commit()
    
    return {"message": "Static page deleted successfully"}