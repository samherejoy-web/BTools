from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import User, Tool, Blog, Category, Review, SeoPage, tool_categories
from auth import get_current_superadmin, get_password_hash
import uuid
from datetime import datetime
import os
import shutil
import csv
import io
import re

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    role: str = "user"

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class ToolCreate(BaseModel):
    name: str
    description: str
    short_description: Optional[str] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    screenshot_url: Optional[str] = None
    pricing_type: str = "free"
    pricing_details: Optional[Dict[str, Any]] = {}
    features: Optional[List[str]] = []
    pros: Optional[List[str]] = []
    cons: Optional[List[str]] = []
    category_ids: Optional[List[str]] = []
    is_featured: Optional[bool] = False
    is_active: Optional[bool] = True
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    screenshot_url: Optional[str] = None
    pricing_type: Optional[str] = None
    pricing_details: Optional[Dict[str, Any]] = None
    features: Optional[List[str]] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    category_ids: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

# User Management
@router.get("/api/superadmin/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all users with filtering options"""
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if search:
        query = query.filter(
            or_(
                User.username.contains(search),
                User.email.contains(search),
                User.full_name.contains(search)
            )
        )
    
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        } for user in users
    ]

@router.post("/api/superadmin/users")
async def create_user(
    user: UserCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User created successfully", "user_id": db_user.id}

@router.put("/api/superadmin/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "User updated successfully"}

@router.delete("/api/superadmin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == "superadmin":
        raise HTTPException(status_code=400, detail="Cannot delete superadmin user")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

# Category Management
@router.get("/api/superadmin/categories")
async def get_all_categories(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all categories with hierarchy"""
    
    categories = db.query(Category).order_by(Category.name).all()
    
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "parent_id": cat.parent_id,
            "seo_title": cat.seo_title,
            "seo_description": cat.seo_description,
            "seo_keywords": cat.seo_keywords,
            "created_at": cat.created_at
        } for cat in categories
    ]

@router.post("/api/superadmin/categories")
async def create_category(
    category: CategoryCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create new category"""
    
    # Generate slug
    slug = generate_slug(category.name)
    counter = 1
    while db.query(Category).filter(Category.slug == slug).first():
        slug = f"{generate_slug(category.name)}-{counter}"
        counter += 1
    
    db_category = Category(
        id=str(uuid.uuid4()),
        name=category.name,
        slug=slug,
        description=category.description,
        parent_id=category.parent_id,
        seo_title=category.seo_title or category.name,
        seo_description=category.seo_description,
        seo_keywords=category.seo_keywords
    )
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return {"message": "Category created successfully", "category_id": db_category.id}

@router.put("/api/superadmin/categories/{category_id}")
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update category"""
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields
    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "name" and value != category.name:
            # Update slug if name changed
            new_slug = generate_slug(value)
            counter = 1
            while db.query(Category).filter(Category.slug == new_slug, Category.id != category_id).first():
                new_slug = f"{generate_slug(value)}-{counter}"
                counter += 1
            category.slug = new_slug
        
        setattr(category, field, value)
    
    db.commit()
    
    return {"message": "Category updated successfully"}

@router.delete("/api/superadmin/categories/{category_id}")
async def delete_category(
    category_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete category"""
    
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has tools
    tools_count = db.query(Tool).join(tool_categories).filter(
        tool_categories.c.category_id == category_id
    ).count()
    
    if tools_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category. {tools_count} tools are using this category."
        )
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}

# Tool Management
@router.get("/api/superadmin/tools")
async def get_all_tools_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all tools with admin privileges"""
    
    query = db.query(Tool).options(joinedload(Tool.categories))
    
    if category:
        query = query.join(Tool.categories).filter(Category.slug == category)
    
    if status == "active":
        query = query.filter(Tool.is_active == True)
    elif status == "inactive":
        query = query.filter(Tool.is_active == False)
    
    if search:
        query = query.filter(
            or_(
                Tool.name.contains(search),
                Tool.description.contains(search)
            )
        )
    
    tools = query.order_by(desc(Tool.created_at)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "short_description": tool.short_description,
            "pricing_type": tool.pricing_type,
            "rating": tool.rating,
            "review_count": tool.review_count,
            "view_count": tool.view_count,
            "is_featured": tool.is_featured,
            "is_active": tool.is_active,
            "created_at": tool.created_at,
            "categories": [{"id": cat.id, "name": cat.name} for cat in tool.categories]
        } for tool in tools
    ]

@router.post("/api/superadmin/tools")
async def create_tool(
    tool: ToolCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create new tool"""
    
    # Generate slug
    slug = generate_slug(tool.name)
    counter = 1
    while db.query(Tool).filter(Tool.slug == slug).first():
        slug = f"{generate_slug(tool.name)}-{counter}"
        counter += 1
    
    db_tool = Tool(
        id=str(uuid.uuid4()),
        name=tool.name,
        slug=slug,
        description=tool.description,
        short_description=tool.short_description,
        url=tool.url,
        logo_url=tool.logo_url,
        screenshot_url=tool.screenshot_url,
        pricing_type=tool.pricing_type,
        pricing_details=tool.pricing_details,
        features=tool.features,
        pros=tool.pros,
        cons=tool.cons,
        is_featured=tool.is_featured,
        is_active=tool.is_active,
        seo_title=tool.seo_title or tool.name,
        seo_description=tool.seo_description,
        seo_keywords=tool.seo_keywords,
        json_ld=tool.json_ld
    )
    
    db.add(db_tool)
    db.flush()  # Get the ID
    
    # Add categories
    if tool.category_ids:
        categories = db.query(Category).filter(Category.id.in_(tool.category_ids)).all()
        db_tool.categories = categories
    
    db.commit()
    db.refresh(db_tool)
    
    return {"message": "Tool created successfully", "tool_id": db_tool.id}

@router.put("/api/superadmin/tools/{tool_id}")
async def update_tool(
    tool_id: str,
    tool_update: ToolUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update tool"""
    
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Update fields
    update_data = tool_update.dict(exclude_unset=True)
    
    if "category_ids" in update_data:
        category_ids = update_data.pop("category_ids")
        if category_ids:
            categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
            tool.categories = categories
        else:
            tool.categories = []
    
    for field, value in update_data.items():
        if field == "name" and value != tool.name:
            # Update slug if name changed
            new_slug = generate_slug(value)
            counter = 1
            while db.query(Tool).filter(Tool.slug == new_slug, Tool.id != tool_id).first():
                new_slug = f"{generate_slug(value)}-{counter}"
                counter += 1
            tool.slug = new_slug
        
        setattr(tool, field, value)
    
    tool.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Tool updated successfully"}

@router.delete("/api/superadmin/tools/{tool_id}")
async def delete_tool(
    tool_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete tool"""
    
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    db.delete(tool)
    db.commit()
    
    return {"message": "Tool deleted successfully"}

# Bulk Operations
@router.post("/api/superadmin/tools/bulk-upload")
async def bulk_upload_tools(
    file: UploadFile = File(...),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk upload tools from CSV"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    content = await file.read()
    csv_data = io.StringIO(content.decode('utf-8'))
    
    reader = csv.DictReader(csv_data)
    created_tools = []
    errors = []
    
    for row_num, row in enumerate(reader, start=2):
        try:
            # Generate slug
            slug = generate_slug(row['name'])
            counter = 1
            while db.query(Tool).filter(Tool.slug == slug).first():
                slug = f"{generate_slug(row['name'])}-{counter}"
                counter += 1
            
            db_tool = Tool(
                id=str(uuid.uuid4()),
                name=row['name'],
                slug=slug,
                description=row.get('description', ''),
                short_description=row.get('short_description', ''),
                url=row.get('url', ''),
                logo_url=row.get('logo_url', ''),
                pricing_type=row.get('pricing_type', 'free'),
                features=row.get('features', '').split(';') if row.get('features') else [],
                pros=row.get('pros', '').split(';') if row.get('pros') else [],
                cons=row.get('cons', '').split(';') if row.get('cons') else [],
                is_active=row.get('is_active', 'true').lower() == 'true'
            )
            
            db.add(db_tool)
            created_tools.append(row['name'])
            
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "message": f"Bulk upload completed. {len(created_tools)} tools created.",
        "created_tools": created_tools,
        "errors": errors
    }

@router.get("/api/superadmin/tools/csv-template")
async def download_csv_template(
    current_superadmin: User = Depends(get_current_superadmin)
):
    """Download CSV template for bulk upload"""
    
    template_data = [
        {
            "name": "Example Tool",
            "description": "This is an example tool description",
            "short_description": "Example tool for demonstration",
            "url": "https://example.com",
            "logo_url": "https://example.com/logo.png",
            "pricing_type": "free",
            "features": "Feature 1;Feature 2;Feature 3",
            "pros": "Pro 1;Pro 2",
            "cons": "Con 1;Con 2",
            "is_active": "true"
        }
    ]
    
    return {
        "message": "CSV template",
        "template": template_data,
        "headers": list(template_data[0].keys())
    }