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
        json_ld=tool.json_ld,
        # New enhancement fields
        domain_website=tool.domain_website,
        linkedin_url=tool.linkedin_url,
        founded_year=tool.founded_year,
        about_section=tool.about_section,
        founders=tool.founders,
        latest_news=tool.latest_news,
        latest_feeds=tool.latest_feeds,
        job_openings=tool.job_openings,
        revenue=tool.revenue,
        locations=tool.locations,
        company_size=tool.company_size,
        funding_info=tool.funding_info,
        tech_stack=tool.tech_stack,
        integrations=tool.integrations,
        languages_supported=tool.languages_supported,
        target_audience=tool.target_audience,
        use_cases=tool.use_cases,
        alternatives=tool.alternatives,
        local_logo_path=tool.local_logo_path
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

@router.post("/api/superadmin/tools/upload-logo")
async def upload_tool_logo(
    file: UploadFile = File(...),
    tool_name: str = None,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Upload logo for a tool"""
    
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
        raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, JPEG, GIF, SVG)")
    
    if not tool_name:
        raise HTTPException(status_code=400, detail="Tool name is required")
    
    # Create safe filename based on tool name
    safe_filename = f"{tool_name.lower().replace(' ', '-').replace('/', '-')}.png"
    logo_path = f"/app/backend/uploads/logos/{safe_filename}"
    
    try:
        # Save the uploaded file
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "message": "Logo uploaded successfully",
            "filename": safe_filename,
            "path": logo_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save logo: {str(e)}")

@router.post("/api/superadmin/tools/bulk-upload-logos")
async def bulk_upload_logos(
    files: List[UploadFile] = File(...),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk upload logos for tools"""
    
    uploaded_files = []
    errors = []
    
    for file in files:
        try:
            if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                errors.append(f"{file.filename}: Invalid file type. Must be an image.")
                continue
            
            # Use the original filename or generate a safe one
            safe_filename = file.filename.lower().replace(' ', '-').replace('/', '-')
            logo_path = f"/app/backend/uploads/logos/{safe_filename}"
            
            # Save the uploaded file
            with open(logo_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            uploaded_files.append({
                "filename": safe_filename,
                "path": logo_path
            })
            
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    return {
        "message": f"Bulk logo upload completed. {len(uploaded_files)} files uploaded.",
        "uploaded_files": uploaded_files,
        "errors": errors
    }

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
                is_active=row.get('is_active', 'true').lower() == 'true',
                # New optional fields
                domain_website=row.get('domain_website', ''),
                linkedin_url=row.get('linkedin_url', ''),
                founded_year=int(row.get('founded_year', 0)) if row.get('founded_year') and row.get('founded_year').isdigit() else None,
                about_section=row.get('about_section', ''),
                founders=row.get('founders', '').split(';') if row.get('founders') else [],
                latest_news=row.get('latest_news', ''),
                latest_feeds=row.get('latest_feeds', '').split(';') if row.get('latest_feeds') else [],
                job_openings=row.get('job_openings', '').split(';') if row.get('job_openings') else [],
                revenue=row.get('revenue', ''),
                locations=row.get('locations', '').split(';') if row.get('locations') else [],
                company_size=row.get('company_size', ''),
                funding_info=row.get('funding_info', '').split(';') if row.get('funding_info') else [],
                tech_stack=row.get('tech_stack', '').split(';') if row.get('tech_stack') else [],
                integrations=row.get('integrations', '').split(';') if row.get('integrations') else [],
                languages_supported=row.get('languages_supported', '').split(';') if row.get('languages_supported') else [],
                target_audience=row.get('target_audience', '').split(';') if row.get('target_audience') else [],
                use_cases=row.get('use_cases', '').split(';') if row.get('use_cases') else [],
                alternatives=row.get('alternatives', '').split(';') if row.get('alternatives') else [],
                local_logo_path=row.get('local_logo_path', '')
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
            "domain_website": "example.com",
            "linkedin_url": "https://linkedin.com/company/example",
            "founded_year": "2020",
            "about_section": "Example company focused on innovative solutions",
            "founders": "John Doe;Jane Smith",
            "latest_news": "Company raises Series A funding",
            "latest_feeds": "New feature launch;Product update",
            "job_openings": "Software Engineer;Product Manager",
            "revenue": "$10M ARR",
            "locations": "San Francisco;New York;Remote",
            "company_size": "50-100 employees",
            "funding_info": "Series A $5M;Seed $1M",
            "tech_stack": "React;Node.js;Python;AWS",
            "integrations": "Slack;Google Workspace;Salesforce",
            "languages_supported": "English;Spanish;French",
            "target_audience": "Startups;SMBs;Enterprise",
            "use_cases": "Project Management;Team Collaboration;Workflow Automation",
            "alternatives": "Alternative Tool 1;Alternative Tool 2",
            "local_logo_path": "example-tool.png"
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