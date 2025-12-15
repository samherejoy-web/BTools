from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import User, Tool, Blog, Category, Review, SeoPage, tool_categories, NewsletterSubscription, ContactSubmission, SiteSettings
from auth import get_current_superadmin, get_password_hash
import uuid
from datetime import datetime
import os
import shutil
import csv
import io
import re
from utils.json_ld_generator import JSONLDGenerator, auto_generate_json_ld_for_existing_content
from utils.url_normalizer import normalize_url, check_url_uniqueness, validate_url_format, add_protocol_if_missing

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
    # New company-related fields
    linkedin_url: Optional[str] = None
    company_funding: Optional[Dict[str, Any]] = None
    company_news: Optional[str] = None
    company_location: Optional[str] = None
    company_founders: Optional[List[Dict[str, str]]] = None
    about: Optional[str] = None
    started_on: Optional[str] = None
    logo_thumbnail_url: Optional[str] = None

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
    # New company-related fields
    linkedin_url: Optional[str] = None
    company_funding: Optional[Dict[str, Any]] = None
    company_news: Optional[str] = None
    company_location: Optional[str] = None
    company_founders: Optional[List[Dict[str, str]]] = None
    about: Optional[str] = None
    started_on: Optional[str] = None
    logo_thumbnail_url: Optional[str] = None

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
    
    # Validate URL format if provided
    if tool.url and not validate_url_format(tool.url):
        raise HTTPException(status_code=400, detail="Invalid URL format")
    
    # Check URL uniqueness if provided
    if tool.url and not check_url_uniqueness(db, tool.url):
        raise HTTPException(status_code=400, detail="A tool with this URL already exists")
    
    # Normalize and add protocol to URL if missing
    if tool.url:
        tool.url = add_protocol_if_missing(tool.url)
    
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
        json_ld=tool.json_ld,
        # New company-related fields
        linkedin_url=tool.linkedin_url,
        company_funding=tool.company_funding,
        company_news=tool.company_news,
        company_location=tool.company_location,
        company_founders=tool.company_founders,
        about=tool.about,
        started_on=tool.started_on,
        logo_thumbnail_url=tool.logo_thumbnail_url
    )
    
    db.add(db_tool)
    db.flush()  # Get the ID
    
    # Add categories
    if tool.category_ids:
        categories = db.query(Category).filter(Category.id.in_(tool.category_ids)).all()
        db_tool.categories = categories
    
    db.commit()
    db.refresh(db_tool)
    
    # Auto-generate static page for active tools
    if db_tool.is_active:
        try:
            from auto_page_generator import generate_page_for_content
            generate_page_for_content('tool', db_tool.id)
            print(f"✅ Auto-generated static page for tool: {db_tool.slug}")
        except Exception as e:
            print(f"⚠️ Failed to auto-generate page for tool {db_tool.slug}: {e}")
    
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
    
    # Validate URL format if provided and changed
    if tool_update.url is not None:
        if tool_update.url and not validate_url_format(tool_update.url):
            raise HTTPException(status_code=400, detail="Invalid URL format")
        
        # Check URL uniqueness if provided and changed
        if tool_update.url and not check_url_uniqueness(db, tool_update.url, exclude_tool_id=tool_id):
            raise HTTPException(status_code=400, detail="A tool with this URL already exists")
        
        # Normalize and add protocol to URL if missing
        if tool_update.url:
            tool_update.url = add_protocol_if_missing(tool_update.url)
    
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
    
    # Check if tool was activated
    was_active = tool.is_active
    
    tool.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tool)
    
    # Auto-generate static page when tool becomes active or is updated while active
    if tool.is_active and ('is_active' in update_data or was_active):
        try:
            from auto_page_generator import generate_page_for_content
            generate_page_for_content('tool', tool.id)
            print(f"✅ Auto-generated static page for tool: {tool.slug}")
        except Exception as e:
            print(f"⚠️ Failed to auto-generate page for tool {tool.slug}: {e}")
    
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
            
            # Helper function to parse JSON fields safely
            def parse_json_field(field_value):
                if not field_value:
                    return None
                try:
                    import json
                    return json.loads(field_value)
                except (json.JSONDecodeError, TypeError):
                    return None
            
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
                is_active=row.get('is_active', 'true').lower() == 'true',
                # New company-related fields
                linkedin_url=row.get('linkedin_url', ''),
                company_funding=parse_json_field(row.get('company_funding')),
                company_news=row.get('company_news', ''),
                company_location=row.get('company_location', ''),
                company_founders=parse_json_field(row.get('company_founders')),
                about=row.get('about', ''),
                started_on=row.get('started_on', ''),
                logo_thumbnail_url=row.get('logo_thumbnail_url', '')
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
            "is_active": "true",
            # New company-related fields
            "linkedin_url": "https://linkedin.com/company/example-tool",
            "company_funding": '{"amount": "10M", "round": "Series A", "date": "2023-01-01"}',
            "company_news": "Recent news about the company",
            "company_location": "San Francisco, CA",
            "company_founders": '[{"name": "John Doe", "role": "CEO"}, {"name": "Jane Smith", "role": "CTO"}]',
            "about": "Detailed information about the company",
            "started_on": "2020-01-01",
            "logo_thumbnail_url": "https://drive.google.com/uc?id=example-file-id"
        }
    ]
    
    return {
        "message": "CSV template",
        "template": template_data,
        "headers": list(template_data[0].keys())
    }

# Super Admin SEO Management Features
class SeoIssueAnalysis(BaseModel):
    page_id: str
    page_type: str  # 'tool', 'blog', 'page'
    page_path: str
    title: str
    issues: List[str]
    severity: str  # 'low', 'medium', 'high', 'critical'
    recommendations: List[str]

class BulkSeoUpdate(BaseModel):
    target_type: str  # 'tools', 'blogs', 'pages'
    target_ids: List[str]
    seo_data: Dict[str, Any]

@router.get("/api/superadmin/seo/overview")
async def get_seo_overview(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get comprehensive SEO overview for Super Admin"""
    
    # Get tools SEO status
    tools = db.query(Tool).all()
    tools_with_seo = sum(1 for tool in tools if tool.seo_title and tool.seo_description)
    tools_missing_seo = len(tools) - tools_with_seo
    
    # Get blogs SEO status
    blogs = db.query(Blog).all()
    blogs_with_seo = sum(1 for blog in blogs if blog.seo_title and blog.seo_description)
    blogs_missing_seo = len(blogs) - blogs_with_seo
    
    # Get SEO pages
    seo_pages = db.query(SeoPage).all()
    seo_pages_count = len(seo_pages)
    
    # Calculate SEO health score
    total_items = len(tools) + len(blogs) + seo_pages_count
    items_with_seo = tools_with_seo + blogs_with_seo + seo_pages_count
    seo_health_score = (items_with_seo / total_items * 100) if total_items > 0 else 0
    
    return {
        "overview": {
            "total_pages": total_items,
            "seo_optimized": items_with_seo,
            "seo_health_score": round(seo_health_score, 2),
            "critical_issues": tools_missing_seo + blogs_missing_seo
        },
        "tools": {
            "total": len(tools),
            "with_seo": tools_with_seo,
            "missing_seo": tools_missing_seo,
            "completion_rate": round((tools_with_seo / len(tools) * 100) if tools else 0, 2)
        },
        "blogs": {
            "total": len(blogs),
            "with_seo": blogs_with_seo,
            "missing_seo": blogs_missing_seo,
            "completion_rate": round((blogs_with_seo / len(blogs) * 100) if blogs else 0, 2)
        },
        "seo_pages": {
            "total": seo_pages_count,
            "with_json_ld": sum(1 for page in seo_pages if page.json_ld),
            "with_meta_tags": sum(1 for page in seo_pages if page.meta_tags)
        }
    }

@router.get("/api/superadmin/seo/issues")
async def analyze_seo_issues(
    page_type: Optional[str] = Query(None, description="Filter by page type: tools, blogs, pages"),
    severity: Optional[str] = Query(None, description="Filter by severity: low, medium, high, critical"),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Analyze and return SEO issues across the platform"""
    
    issues = []
    
    # Analyze Tools SEO issues
    if not page_type or page_type == "tools":
        tools = db.query(Tool).all()
        for tool in tools:
            tool_issues = []
            tool_recommendations = []
            issue_severity = "low"
            
            # Check for missing SEO title
            if not tool.seo_title:
                tool_issues.append("Missing SEO title")
                tool_recommendations.append("Add a compelling SEO title (50-60 characters)")
                issue_severity = "high"
            elif len(tool.seo_title) > 60:
                tool_issues.append("SEO title too long")
                tool_recommendations.append("Shorten SEO title to under 60 characters")
                issue_severity = "medium"
            
            # Check for missing SEO description
            if not tool.seo_description:
                tool_issues.append("Missing SEO description")
                tool_recommendations.append("Add SEO description (150-160 characters)")
                issue_severity = "high"
            elif len(tool.seo_description) > 160:
                tool_issues.append("SEO description too long")
                tool_recommendations.append("Shorten SEO description to under 160 characters")
                issue_severity = "medium"
            
            # Check for missing keywords
            if not tool.seo_keywords:
                tool_issues.append("Missing SEO keywords")
                tool_recommendations.append("Add relevant keywords for better search visibility")
                if issue_severity == "low":
                    issue_severity = "medium"
            
            # Check for missing JSON-LD
            if not tool.json_ld:
                tool_issues.append("Missing structured data (JSON-LD)")
                tool_recommendations.append("Add Product schema for better search appearance")
                if issue_severity == "low":
                    issue_severity = "medium"
            
            # Only add if there are issues
            if tool_issues:
                issues.append({
                    "page_id": tool.id,
                    "page_type": "tool",
                    "page_path": f"/tools/{tool.slug}",
                    "title": tool.name,
                    "issues": tool_issues,
                    "severity": issue_severity,
                    "recommendations": tool_recommendations
                })
    
    # Analyze Blogs SEO issues
    if not page_type or page_type == "blogs":
        blogs = db.query(Blog).all()
        for blog in blogs:
            blog_issues = []
            blog_recommendations = []
            issue_severity = "low"
            
            # Check for missing SEO title
            if not blog.seo_title:
                blog_issues.append("Missing SEO title")
                blog_recommendations.append("Add a compelling SEO title (50-60 characters)")
                issue_severity = "high"
            elif len(blog.seo_title) > 60:
                blog_issues.append("SEO title too long")
                blog_recommendations.append("Shorten SEO title to under 60 characters")
                issue_severity = "medium"
            
            # Check for missing SEO description
            if not blog.seo_description:
                blog_issues.append("Missing SEO description")
                blog_recommendations.append("Add SEO description (150-160 characters)")
                issue_severity = "high"
            elif len(blog.seo_description) > 160:
                blog_issues.append("SEO description too long")
                blog_recommendations.append("Shorten SEO description to under 160 characters")
                issue_severity = "medium"
            
            # Check for missing keywords
            if not blog.seo_keywords:
                blog_issues.append("Missing SEO keywords")
                blog_recommendations.append("Add relevant keywords for better search visibility")
                if issue_severity == "low":
                    issue_severity = "medium"
            
            # Check for missing JSON-LD
            if not blog.json_ld:
                blog_issues.append("Missing structured data (JSON-LD)")
                blog_recommendations.append("Add Article schema for better search appearance")
                if issue_severity == "low":
                    issue_severity = "medium"
            
            # Only add if there are issues
            if blog_issues:
                issues.append({
                    "page_id": blog.id,
                    "page_type": "blog",
                    "page_path": f"/blogs/{blog.slug}",
                    "title": blog.title,
                    "issues": blog_issues,
                    "severity": issue_severity,
                    "recommendations": blog_recommendations
                })
    
    # Filter by severity if specified
    if severity:
        issues = [issue for issue in issues if issue["severity"] == severity]
    
    # Sort by severity (critical -> high -> medium -> low)
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    issues.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    return {
        "total_issues": len(issues),
        "issues": issues,
        "summary": {
            "critical": len([i for i in issues if i["severity"] == "critical"]),
            "high": len([i for i in issues if i["severity"] == "high"]),
            "medium": len([i for i in issues if i["severity"] == "medium"]),
            "low": len([i for i in issues if i["severity"] == "low"])
        }
    }

@router.post("/api/superadmin/seo/bulk-update")
async def bulk_update_seo(
    bulk_update: BulkSeoUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk update SEO data for multiple items"""
    
    updated_count = 0
    errors = []
    
    try:
        if bulk_update.target_type == "tools":
            tools = db.query(Tool).filter(Tool.id.in_(bulk_update.target_ids)).all()
            for tool in tools:
                try:
                    for field, value in bulk_update.seo_data.items():
                        if hasattr(tool, field):
                            setattr(tool, field, value)
                    tool.updated_at = datetime.utcnow()
                    updated_count += 1
                except Exception as e:
                    errors.append(f"Tool {tool.id}: {str(e)}")
        
        elif bulk_update.target_type == "blogs":
            blogs = db.query(Blog).filter(Blog.id.in_(bulk_update.target_ids)).all()
            for blog in blogs:
                try:
                    for field, value in bulk_update.seo_data.items():
                        if hasattr(blog, field):
                            setattr(blog, field, value)
                    blog.updated_at = datetime.utcnow()
                    updated_count += 1
                except Exception as e:
                    errors.append(f"Blog {blog.id}: {str(e)}")
        
        elif bulk_update.target_type == "pages":
            seo_pages = db.query(SeoPage).filter(SeoPage.id.in_(bulk_update.target_ids)).all()
            for page in seo_pages:
                try:
                    for field, value in bulk_update.seo_data.items():
                        if hasattr(page, field):
                            setattr(page, field, value)
                    page.updated_at = datetime.utcnow()
                    updated_count += 1
                except Exception as e:
                    errors.append(f"Page {page.id}: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Successfully updated {updated_count} items",
            "updated_count": updated_count,
            "errors": errors
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk update failed: {str(e)}")

@router.get("/api/superadmin/seo/tools/{tool_id}")
async def get_tool_seo_details(
    tool_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get detailed SEO information for a specific tool"""
    
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Calculate SEO score
    seo_score = 0
    seo_checks = {
        "has_seo_title": bool(tool.seo_title),
        "has_seo_description": bool(tool.seo_description),
        "has_seo_keywords": bool(tool.seo_keywords),
        "has_json_ld": bool(tool.json_ld),
        "title_length_ok": bool(tool.seo_title and 40 <= len(tool.seo_title) <= 60),
        "description_length_ok": bool(tool.seo_description and 120 <= len(tool.seo_description) <= 160)
    }
    
    seo_score = sum(seo_checks.values()) / len(seo_checks) * 100
    
    return {
        "tool": {
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "url": tool.url,
            "view_count": tool.view_count,
            "rating": tool.rating,
            "review_count": tool.review_count
        },
        "seo": {
            "seo_title": tool.seo_title,
            "seo_description": tool.seo_description,
            "seo_keywords": tool.seo_keywords,
            "json_ld": tool.json_ld
        },
        "seo_analysis": {
            "score": round(seo_score, 2),
            "checks": seo_checks,
            "title_length": len(tool.seo_title) if tool.seo_title else 0,
            "description_length": len(tool.seo_description) if tool.seo_description else 0,
            "keywords_count": len(tool.seo_keywords.split(',')) if tool.seo_keywords else 0
        }
    }

@router.get("/api/superadmin/seo/blogs/{blog_id}")
async def get_blog_seo_details(
    blog_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get detailed SEO information for a specific blog"""
    
    blog = db.query(Blog).options(joinedload(Blog.author)).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Calculate SEO score
    seo_score = 0
    seo_checks = {
        "has_seo_title": bool(blog.seo_title),
        "has_seo_description": bool(blog.seo_description),
        "has_seo_keywords": bool(blog.seo_keywords),
        "has_json_ld": bool(blog.json_ld),
        "title_length_ok": bool(blog.seo_title and 40 <= len(blog.seo_title) <= 60),
        "description_length_ok": bool(blog.seo_description and 120 <= len(blog.seo_description) <= 160)
    }
    
    seo_score = sum(seo_checks.values()) / len(seo_checks) * 100
    
    return {
        "blog": {
            "id": blog.id,
            "title": blog.title,
            "slug": blog.slug,
            "status": blog.status,
            "view_count": blog.view_count,
            "like_count": blog.like_count,
            "author_name": blog.author.full_name or blog.author.username,
            "published_at": blog.published_at,
            "reading_time": blog.reading_time
        },
        "seo": {
            "seo_title": blog.seo_title,
            "seo_description": blog.seo_description,
            "seo_keywords": blog.seo_keywords,
            "json_ld": blog.json_ld
        },
        "seo_analysis": {
            "score": round(seo_score, 2),
            "checks": seo_checks,
            "title_length": len(blog.seo_title) if blog.seo_title else 0,
            "description_length": len(blog.seo_description) if blog.seo_description else 0,
            "keywords_count": len(blog.seo_keywords.split(',')) if blog.seo_keywords else 0
        }
    }

@router.put("/api/superadmin/seo/tools/{tool_id}")
async def update_tool_seo(
    tool_id: str,
    seo_data: Dict[str, Any],
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update SEO data for a specific tool"""
    
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Update SEO fields
    seo_fields = ['seo_title', 'seo_description', 'seo_keywords', 'json_ld']
    for field in seo_fields:
        if field in seo_data:
            setattr(tool, field, seo_data[field])
    
    tool.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Tool SEO updated successfully"}

@router.put("/api/superadmin/seo/blogs/{blog_id}")
async def update_blog_seo(
    blog_id: str,
    seo_data: Dict[str, Any],
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update SEO data for a specific blog"""
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Update SEO fields
    seo_fields = ['seo_title', 'seo_description', 'seo_keywords', 'json_ld']
    for field in seo_fields:
        if field in seo_data:
            setattr(blog, field, seo_data[field])
    
    blog.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Blog SEO updated successfully"}

@router.post("/api/superadmin/seo/generate-templates")
async def generate_seo_templates(
    page_type: str = Query(..., description="Type: tools, blogs"),
    count: int = Query(10, description="Number of items to generate templates for"),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Generate SEO templates for items missing SEO data"""
    
    updated_count = 0
    
    if page_type == "tools":
        tools = db.query(Tool).filter(
            or_(Tool.seo_title.is_(None), Tool.seo_description.is_(None))
        ).limit(count).all()
        
        for tool in tools:
            if not tool.seo_title:
                tool.seo_title = f"{tool.name} - {tool.short_description or 'Professional Tool'}"
                if len(tool.seo_title) > 60:
                    tool.seo_title = tool.seo_title[:57] + "..."
            
            if not tool.seo_description:
                tool.seo_description = f"Discover {tool.name}, a {tool.pricing_type} tool for productivity. {tool.short_description}. Read reviews and compare features."
                if len(tool.seo_description) > 160:
                    tool.seo_description = tool.seo_description[:157] + "..."
            
            if not tool.seo_keywords:
                categories = [cat.name.lower() for cat in tool.categories] if tool.categories else []
                tool.seo_keywords = f"{tool.name.lower()}, {tool.pricing_type} tool, {', '.join(categories)}, productivity, business tools"
            
            tool.updated_at = datetime.utcnow()
            updated_count += 1
    
    elif page_type == "blogs":
        blogs = db.query(Blog).filter(
            or_(Blog.seo_title.is_(None), Blog.seo_description.is_(None))
        ).limit(count).all()
        
        for blog in blogs:
            if not blog.seo_title:
                blog.seo_title = blog.title
                if len(blog.seo_title) > 60:
                    blog.seo_title = blog.seo_title[:57] + "..."
            
            if not blog.seo_description:
                blog.seo_description = blog.excerpt or f"Read our comprehensive guide about {blog.title}. Expert insights and practical tips for business productivity."
                if len(blog.seo_description) > 160:
                    blog.seo_description = blog.seo_description[:157] + "..."
            
            if not blog.seo_keywords:
                tags = blog.tags if blog.tags else []
                blog.seo_keywords = f"{blog.title.lower()}, {', '.join(tags)}, business guide, productivity tips"
            
            blog.updated_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Generated SEO templates for {updated_count} {page_type}",
        "updated_count": updated_count
    }

@router.post("/api/superadmin/seo/generate-json-ld")
async def generate_json_ld_data(
    content_type: str = Query(..., description="Type: tools, blogs, or all"),
    limit: int = Query(100, description="Maximum number of items to process"),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Auto-generate JSON-LD structured data for tools and blogs"""
    
    try:
        updated_count = {"tools": 0, "blogs": 0, "errors": []}
        
        if content_type in ["tools", "all"]:
            # Generate JSON-LD for tools
            tools = db.query(Tool).options(joinedload(Tool.categories)).filter(
                or_(Tool.json_ld.is_(None), Tool.json_ld == {})
            ).limit(limit).all()
            
            for tool in tools:
                try:
                    tool_data = {
                        'name': tool.name,
                        'description': tool.description,
                        'url': tool.url,
                        'pricing_type': tool.pricing_type,
                        'rating': tool.rating,
                        'review_count': tool.review_count,
                        'created_at': tool.created_at,
                        'updated_at': tool.updated_at,
                        'logo_url': tool.logo_url,
                        'screenshot_url': tool.screenshot_url,
                        'features': tool.features or [],
                        'categories': [{'name': cat.name} for cat in tool.categories] if tool.categories else []
                    }
                    
                    tool.json_ld = JSONLDGenerator.generate_tool_json_ld(tool_data)
                    tool.updated_at = datetime.utcnow()
                    updated_count["tools"] += 1
                    
                except Exception as e:
                    updated_count["errors"].append(f"Tool {tool.name}: {str(e)}")
        
        if content_type in ["blogs", "all"]:
            # Generate JSON-LD for blogs
            blogs = db.query(Blog).options(joinedload(Blog.author), joinedload(Blog.comments)).filter(
                or_(Blog.json_ld.is_(None), Blog.json_ld == {})
            ).limit(limit).all()
            
            for blog in blogs:
                try:
                    blog_data = {
                        'title': blog.title,
                        'slug': blog.slug,
                        'excerpt': blog.excerpt,
                        'content': blog.content,
                        'published_at': blog.published_at,
                        'created_at': blog.created_at,
                        'updated_at': blog.updated_at,
                        'featured_image': blog.featured_image,
                        'tags': blog.tags or [],
                        'like_count': blog.like_count,
                        'comment_count': len(blog.comments) if blog.comments else 0,
                        'author_name': blog.author.full_name if blog.author else 'MarketMindAI Team'
                    }
                    
                    blog.json_ld = JSONLDGenerator.generate_blog_json_ld(blog_data)
                    blog.updated_at = datetime.utcnow()
                    updated_count["blogs"] += 1
                    
                except Exception as e:
                    updated_count["errors"].append(f"Blog {blog.title}: {str(e)}")
        
        # Commit all changes
        db.commit()
        
        return {
            "message": "JSON-LD generation completed successfully",
            "results": {
                "tools_updated": updated_count["tools"],
                "blogs_updated": updated_count["blogs"],
                "total_updated": updated_count["tools"] + updated_count["blogs"],
                "errors": updated_count["errors"]
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate JSON-LD data: {str(e)}"
        )

# SuperAdmin Dashboard Analytics Endpoint
@router.get("/api/superadmin/dashboard/analytics")
async def get_dashboard_analytics(
    timeframe: int = Query(30, description="Timeframe in days for recent analytics"),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get comprehensive real-time analytics for SuperAdmin Dashboard"""
    
    try:
        from datetime import datetime, timedelta
        from sqlalchemy import func, and_
        
        # Calculate date range for recent activity
        cutoff_date = datetime.utcnow() - timedelta(days=timeframe)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Basic Counts
        total_users = db.query(User).count()
        total_tools = db.query(Tool).count()
        total_blogs = db.query(Blog).count()
        total_reviews = db.query(Review).count()
        total_categories = db.query(Category).count()
        
        # Recent Activity (Today)
        new_users_today = db.query(User).filter(User.created_at >= today_start).count()
        new_tools_today = db.query(Tool).filter(Tool.created_at >= today_start).count()
        new_blogs_today = db.query(Blog).filter(Blog.created_at >= today_start).count()
        new_reviews_today = db.query(Review).filter(Review.created_at >= today_start).count()
        
        # Calculate growth percentages (compare current period vs previous period)
        previous_period_start = cutoff_date - timedelta(days=timeframe)
        
        # Previous period counts
        users_prev_period = db.query(User).filter(
            User.created_at >= previous_period_start,
            User.created_at < cutoff_date
        ).count()
        tools_prev_period = db.query(Tool).filter(
            Tool.created_at >= previous_period_start,
            Tool.created_at < cutoff_date
        ).count()
        blogs_prev_period = db.query(Blog).filter(
            Blog.created_at >= previous_period_start,
            Blog.created_at < cutoff_date
        ).count()
        reviews_prev_period = db.query(Review).filter(
            Review.created_at >= previous_period_start,
            Review.created_at < cutoff_date
        ).count()
        
        # Current period counts
        users_current_period = db.query(User).filter(User.created_at >= cutoff_date).count()
        tools_current_period = db.query(Tool).filter(Tool.created_at >= cutoff_date).count()
        blogs_current_period = db.query(Blog).filter(Blog.created_at >= cutoff_date).count()
        reviews_current_period = db.query(Review).filter(Review.created_at >= cutoff_date).count()
        
        # Calculate growth percentages
        def calculate_growth(current, previous):
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            return ((current - previous) / previous) * 100
        
        users_growth = calculate_growth(users_current_period, users_prev_period)
        tools_growth = calculate_growth(tools_current_period, tools_prev_period)
        blogs_growth = calculate_growth(blogs_current_period, blogs_prev_period)
        reviews_growth = calculate_growth(reviews_current_period, reviews_prev_period)
        
        # Top Categories with Tool Counts and Growth
        categories_data = db.query(
            Category.name,
            func.count(tool_categories.c.tool_id).label('tool_count')
        ).outerjoin(tool_categories).group_by(Category.id, Category.name).order_by(
            func.count(tool_categories.c.tool_id).desc()
        ).limit(5).all()
        
        top_categories = []
        for cat_name, tool_count in categories_data:
            # Calculate growth for this category (simplified)
            recent_tools = db.query(Tool).join(tool_categories).join(Category).filter(
                Category.name == cat_name,
                Tool.created_at >= cutoff_date
            ).count()
            prev_tools = db.query(Tool).join(tool_categories).join(Category).filter(
                Category.name == cat_name,
                Tool.created_at >= previous_period_start,
                Tool.created_at < cutoff_date
            ).count()
            growth = calculate_growth(recent_tools, prev_tools)
            
            top_categories.append({
                "name": cat_name,
                "tools": tool_count,
                "growth": round(growth, 1)
            })
        
        # Performance Metrics
        total_views = db.query(func.sum(Tool.view_count + Blog.view_count)).scalar() or 0
        
        # Average ratings
        avg_tool_rating = db.query(func.avg(Tool.rating)).scalar() or 0.0
        
        # Content status breakdown
        published_blogs = db.query(Blog).filter(Blog.status == "published").count()
        draft_blogs = db.query(Blog).filter(Blog.status == "draft").count()
        featured_tools = db.query(Tool).filter(Tool.is_featured == True).count()
        active_tools = db.query(Tool).filter(Tool.is_active == True).count()
        
        # User role distribution
        user_roles = db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        role_distribution = {role: count for role, count in user_roles}
        
        # Most Viewed Content
        top_tools = db.query(Tool.name, Tool.view_count, Tool.rating).order_by(
            Tool.view_count.desc()
        ).limit(5).all()
        
        top_blogs = db.query(Blog.title, Blog.view_count, Blog.like_count).filter(
            Blog.status == "published"
        ).order_by(Blog.view_count.desc()).limit(5).all()
        
        # System Health Metrics
        verified_users = db.query(User).filter(User.is_email_verified == True).count()
        unverified_users = total_users - verified_users
        inactive_tools = total_tools - active_tools
        
        # Recent High-Value Activity
        recent_high_rated_reviews = db.query(Review).filter(
            Review.created_at >= cutoff_date,
            Review.rating >= 4
        ).count()
        
        return {
            "overview": {
                "total_users": total_users,
                "total_tools": total_tools,
                "total_blogs": total_blogs,
                "total_reviews": total_reviews,
                "total_categories": total_categories,
                "monthly_growth": {
                    "users": round(users_growth, 1),
                    "tools": round(tools_growth, 1),
                    "blogs": round(blogs_growth, 1),
                    "reviews": round(reviews_growth, 1)
                }
            },
            "recent_activity": {
                "new_users_today": new_users_today,
                "new_tools_today": new_tools_today,
                "new_blogs_today": new_blogs_today,
                "new_reviews_today": new_reviews_today,
                "top_categories": top_categories
            },
            "performance": {
                "total_views": total_views,
                "avg_rating": round(avg_tool_rating, 1),
                "featured_tools": featured_tools,
                "published_blogs": published_blogs,
                "recent_high_rated_reviews": recent_high_rated_reviews
            },
            "content_status": {
                "active_tools": active_tools,
                "inactive_tools": inactive_tools,
                "published_blogs": published_blogs,
                "draft_blogs": draft_blogs,
                "featured_tools": featured_tools
            },
            "user_insights": {
                "role_distribution": role_distribution,
                "verified_users": verified_users,
                "unverified_users": unverified_users,
                "verification_rate": round((verified_users / total_users * 100) if total_users > 0 else 0, 1)
            },
            "top_content": {
                "most_viewed_tools": [
                    {"name": name, "views": views, "rating": rating} 
                    for name, views, rating in top_tools
                ],
                "most_viewed_blogs": [
                    {"title": title, "views": views, "likes": likes} 
                    for title, views, likes in top_blogs
                ]
            },
            "system_health": {
                "total_content_items": total_tools + total_blogs,
                "active_content_percentage": round(
                    ((active_tools + published_blogs) / (total_tools + total_blogs) * 100) 
                    if (total_tools + total_blogs) > 0 else 0, 1
                ),
                "user_engagement_score": round(
                    (total_reviews + total_views/1000) / total_users if total_users > 0 else 0, 1
                ),
                "content_quality_score": round(avg_tool_rating * 20, 1)  # Convert to 100-point scale
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch dashboard analytics: {str(e)}"
        )

# Export Functionality for Newsletter Subscribers and Contact Submissions
@router.get("/api/superadmin/export/newsletter-subscribers")
async def export_newsletter_subscribers(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Export newsletter subscribers as CSV"""
    try:
        from fastapi.responses import Response
        
        # Get all newsletter subscribers
        subscribers = db.query(NewsletterSubscription).order_by(desc(NewsletterSubscription.subscribed_at)).all()
        
        # Create CSV content
        csv_content = "Email,Status,Source,Subscribed At,Unsubscribed At\n"
        
        for subscriber in subscribers:
            unsubscribed_date = subscriber.unsubscribed_at.isoformat() if subscriber.unsubscribed_at else ""
            csv_content += f'"{subscriber.email}","{subscriber.status}","{subscriber.source}","{subscriber.subscribed_at.isoformat()}","{unsubscribed_date}"\n'
        
        # Return CSV file
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=newsletter_subscribers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export newsletter subscribers: {str(e)}")

@router.get("/api/superadmin/export/contact-submissions")
async def export_contact_submissions(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Export contact form submissions as CSV"""
    try:
        from fastapi.responses import Response
        
        # Get all contact submissions
        submissions = db.query(ContactSubmission).order_by(desc(ContactSubmission.created_at)).all()
        
        # Create CSV content
        csv_content = "Name,Email,Company,Subject,Message,Inquiry Type,Status,Created At,Updated At\n"
        
        for submission in submissions:
            # Escape quotes and commas in content
            name = submission.name.replace('"', '""') if submission.name else ""
            email = submission.email.replace('"', '""') if submission.email else ""
            company = submission.company.replace('"', '""') if submission.company else ""
            subject = submission.subject.replace('"', '""') if submission.subject else ""
            message = submission.message.replace('"', '""').replace('\n', ' ').replace('\r', ' ') if submission.message else ""
            
            csv_content += f'"{name}","{email}","{company}","{subject}","{message}","{submission.inquiry_type}","{submission.status}","{submission.created_at.isoformat()}","{submission.updated_at.isoformat()}"\n'
        
        # Return CSV file
        return Response(
            content=csv_content,
            media_type="text/csv", 
            headers={
                "Content-Disposition": f"attachment; filename=contact_submissions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export contact submissions: {str(e)}")

# Site Settings Management
class SiteSettingCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SiteSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

@router.get("/api/superadmin/settings")
async def get_site_settings(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all site settings"""
    
    settings = db.query(SiteSettings).all()
    
    return [
        {
            "id": setting.id,
            "key": setting.key,
            "value": setting.value,
            "description": setting.description,
            "created_at": setting.created_at,
            "updated_at": setting.updated_at
        } for setting in settings
    ]

@router.post("/api/superadmin/settings")
async def create_site_setting(
    setting: SiteSettingCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create new site setting"""
    
    # Check if setting already exists
    existing_setting = db.query(SiteSettings).filter(SiteSettings.key == setting.key).first()
    if existing_setting:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    
    db_setting = SiteSettings(
        id=str(uuid.uuid4()),
        key=setting.key,
        value=setting.value,
        description=setting.description
    )
    
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    
    return {"message": "Setting created successfully", "setting_id": db_setting.id}

@router.put("/api/superadmin/settings/{setting_key}")
async def update_site_setting(
    setting_key: str,
    setting_update: SiteSettingUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update site setting by key"""
    
    setting = db.query(SiteSettings).filter(SiteSettings.key == setting_key).first()
    if not setting:
        # Create new setting if it doesn't exist
        setting = SiteSettings(
            id=str(uuid.uuid4()),
            key=setting_key,
            value=setting_update.value,
            description=setting_update.description
        )
        db.add(setting)
    else:
        # Update existing setting
        setting.value = setting_update.value
        if setting_update.description is not None:
            setting.description = setting_update.description
        setting.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Setting updated successfully"}

@router.delete("/api/superadmin/settings/{setting_key}")
async def delete_site_setting(
    setting_key: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete site setting"""
    
    setting = db.query(SiteSettings).filter(SiteSettings.key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    
    return {"message": "Setting deleted successfully"}

# Logo Management Classes
class LogoUploadResponse(BaseModel):
    message: str
    logo_url: str
    file_size: int
    file_type: str

@router.post("/api/superadmin/settings/upload-logo")
async def upload_logo(
    file: UploadFile = File(...),
    alt_text: str = Form(""),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Upload site logo with validation and optimization"""
    
    # Validate file type
    allowed_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Validate file size (2MB limit)
    max_size = 2 * 1024 * 1024  # 2MB in bytes
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size allowed is 2MB. Your file is {file_size / (1024*1024):.2f}MB"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Create logos directory if it doesn't exist
        logos_dir = "uploads/logos"
        os.makedirs(logos_dir, exist_ok=True)
        
        # Generate unique filename
        import time
        timestamp = int(time.time())
        file_extension = os.path.splitext(file.filename)[1].lower()
        new_filename = f"site_logo_{timestamp}{file_extension}"
        file_path = os.path.join(logos_dir, new_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create relative URL for the logo
        logo_url = f"/uploads/logos/{new_filename}"
        
        # Update site settings for logo
        logo_setting = db.query(SiteSettings).filter(SiteSettings.key == "site_logo_url").first()
        if not logo_setting:
            logo_setting = SiteSettings(
                id=str(uuid.uuid4()),
                key="site_logo_url",
                value=logo_url,
                description="Site logo image URL"
            )
            db.add(logo_setting)
        else:
            # Delete old logo file if it exists
            if logo_setting.value and logo_setting.value.startswith("/uploads/logos/"):
                old_file_path = logo_setting.value.lstrip("/")
                if os.path.exists(old_file_path):
                    try:
                        os.remove(old_file_path)
                    except:
                        pass  # Ignore if file doesn't exist or can't be deleted
            logo_setting.value = logo_url
            logo_setting.updated_at = datetime.utcnow()
        
        # Update alt text setting
        alt_setting = db.query(SiteSettings).filter(SiteSettings.key == "site_logo_alt_text").first()
        if not alt_setting:
            alt_setting = SiteSettings(
                id=str(uuid.uuid4()),
                key="site_logo_alt_text",
                value=alt_text or "MarketMindAI Logo",
                description="Alt text for site logo (SEO and accessibility)"
            )
            db.add(alt_setting)
        else:
            alt_setting.value = alt_text or "MarketMindAI Logo"
            alt_setting.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "message": "Logo uploaded successfully",
            "logo_url": logo_url,
            "file_size": file_size,
            "file_type": file.content_type
        }
        
    except Exception as e:
        # Clean up file if database operation fails
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to upload logo: {str(e)}")

@router.delete("/api/superadmin/settings/delete-logo")
async def delete_logo(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete current site logo and revert to default"""
    
    try:
        # Get current logo setting
        logo_setting = db.query(SiteSettings).filter(SiteSettings.key == "site_logo_url").first()
        
        if logo_setting and logo_setting.value:
            # Delete file if it's an uploaded logo
            if logo_setting.value.startswith("/uploads/logos/"):
                file_path = logo_setting.value.lstrip("/")
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except:
                        pass  # Ignore if file can't be deleted
            
            # Remove logo setting
            db.delete(logo_setting)
        
        # Also remove alt text setting
        alt_setting = db.query(SiteSettings).filter(SiteSettings.key == "site_logo_alt_text").first()
        if alt_setting:
            db.delete(alt_setting)
        
        db.commit()
        
        return {"message": "Logo deleted successfully. Site will use default logo."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete logo: {str(e)}")

@router.post("/api/superadmin/settings/initialize-social-urls") 
async def initialize_social_urls(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Initialize default social media URL settings"""
    
    default_settings = [
        {"key": "social_twitter_url", "value": "https://twitter.com/marketmindai", "description": "X (Twitter) profile URL"},
        {"key": "social_linkedin_url", "value": "https://linkedin.com/company/marketmind", "description": "LinkedIn company page URL"},
        {"key": "social_github_url", "value": "https://github.com/marketmind", "description": "GitHub organization URL"},
        {"key": "social_discord_url", "value": "https://discord.gg/marketmind", "description": "Discord community server URL"},
        {"key": "social_facebook_url", "value": "https://facebook.com/marketmindai", "description": "Facebook page URL"},
    ]
    
    created_count = 0
    
    for setting_data in default_settings:
        # Check if setting already exists
        existing = db.query(SiteSettings).filter(SiteSettings.key == setting_data["key"]).first()
        if not existing:
            db_setting = SiteSettings(
                id=str(uuid.uuid4()),
                key=setting_data["key"],
                value=setting_data["value"],
                description=setting_data["description"]
            )
            db.add(db_setting)
            created_count += 1
    
    db.commit()
    
    return {
        "message": f"Initialized {created_count} social media URL settings",
        "created_count": created_count
    }

# Public endpoint to get site settings (for frontend)
@router.get("/api/public/site-settings")
async def get_public_site_settings(db: Session = Depends(get_db)):
    """Get public site settings (non-sensitive settings only)"""
    
    # Only return social media URLs, logo settings, and other public settings
    public_keys = [
        "social_twitter_url",
        "social_linkedin_url", 
        "social_github_url",
        "social_discord_url",
        "social_facebook_url",
        "site_logo_url",
        "site_logo_alt_text"
    ]
    
    settings = db.query(SiteSettings).filter(SiteSettings.key.in_(public_keys)).all()
    settings_dict = {setting.key: setting.value for setting in settings}
    
    # Convert relative logo URL to API endpoint URL for better external access
    if settings_dict.get('site_logo_url') and settings_dict['site_logo_url'].startswith('/uploads/'):
        settings_dict['site_logo_url'] = "/api/public/logo"
    
    return settings_dict

@router.get("/api/public/logo")
async def get_public_logo(db: Session = Depends(get_db)):
    """Get the current site logo file"""
    from fastapi.responses import FileResponse
    
    try:
        # Get logo URL from settings
        logo_setting = db.query(SiteSettings).filter(SiteSettings.key == "site_logo_url").first()
        
        if not logo_setting or not logo_setting.value:
            raise HTTPException(status_code=404, detail="Logo not found")
        
        # Convert relative path to absolute file path
        logo_path = logo_setting.value
        if logo_path.startswith('/'):
            logo_path = logo_path[1:]  # Remove leading slash
        
        full_path = os.path.join(logo_path)
        
        # Check if file exists
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="Logo file not found")
        
        # Determine content type based on file extension
        import mimetypes
        content_type, _ = mimetypes.guess_type(full_path)
        if not content_type:
            content_type = "image/png"
        
        return FileResponse(
            full_path,
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception:
        raise HTTPException(status_code=404, detail="Logo not available")


@router.post("/api/superadmin/seo/trigger-update")
async def trigger_seo_update(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Manually trigger SEO page regeneration and sitemap update"""
    try:
        from scheduler import regenerate_seo_pages, generate_sitemap
        
        logger.info(f"Manual SEO update triggered by {current_superadmin.email}")
        
        # Regenerate static pages
        page_result = regenerate_seo_pages()
        
        # Generate sitemap
        sitemap_result = generate_sitemap()
        
        return {
            "message": "SEO update completed successfully",
            "pages_regenerated": {
                "tools": page_result.get('tools', 0),
                "blogs": page_result.get('blogs', 0)
            },
            "sitemap_generated": sitemap_result,
            "triggered_by": current_superadmin.email,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Manual SEO update failed: {e}")
        raise HTTPException(status_code=500, detail=f"SEO update failed: {str(e)}")
