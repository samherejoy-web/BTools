from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import User, Tool, Blog, Category, Review, SeoPage
from auth import get_current_admin, get_current_user
import uuid
from datetime import datetime
import os
import shutil
import re

router = APIRouter()

class SeoPageCreate(BaseModel):
    page_path: str
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None
    meta_tags: Optional[Dict[str, Any]] = None

class SeoPageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None
    meta_tags: Optional[Dict[str, Any]] = None

class AdminBlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    status: Optional[str] = None
    featured_image: Optional[str] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    json_ld: Optional[Dict[str, Any]] = None

class ToolAccessRequest(BaseModel):
    tool_ids: List[str]
    reason: Optional[str] = None

@router.get("/api/admin/dashboard")
async def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    # Basic statistics
    total_users = db.query(User).count()
    total_tools = db.query(Tool).count()
    total_blogs = db.query(Blog).count()
    published_blogs = db.query(Blog).filter(Blog.status == "published").count()
    pending_reviews = db.query(Review).filter(Review.is_verified == False).count()
    
    # Recent activity
    recent_blogs = db.query(Blog).options(joinedload(Blog.author)).order_by(
        desc(Blog.created_at)
    ).limit(10).all()
    
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(10).all()
    
    # Tools statistics
    active_tools = db.query(Tool).filter(Tool.is_active == True).count()
    featured_tools = db.query(Tool).filter(Tool.is_featured == True).count()
    
    return {
        "stats": {
            "total_users": total_users,
            "total_tools": total_tools,
            "active_tools": active_tools,
            "featured_tools": featured_tools,
            "total_blogs": total_blogs,
            "published_blogs": published_blogs,
            "pending_reviews": pending_reviews
        },
        "recent_activity": {
            "recent_blogs": [
                {
                    "id": blog.id,
                    "title": blog.title,
                    "author": blog.author.username,
                    "status": blog.status,
                    "created_at": blog.created_at
                } for blog in recent_blogs
            ],
            "recent_users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "created_at": user.created_at
                } for user in recent_users
            ]
        }
    }

@router.get("/api/admin/blogs")
async def get_all_blogs_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all blogs with admin privileges"""
    
    query = db.query(Blog).options(joinedload(Blog.author))
    
    if status:
        query = query.filter(Blog.status == status)
    
    if author_id:
        query = query.filter(Blog.author_id == author_id)
    
    blogs = query.order_by(desc(Blog.created_at)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": blog.id,
            "title": blog.title,
            "slug": blog.slug,
            "status": blog.status,
            "author": blog.author.username,
            "author_id": blog.author_id,
            "view_count": blog.view_count,
            "created_at": blog.created_at,
            "updated_at": blog.updated_at,
            "published_at": blog.published_at,
            "is_ai_generated": blog.is_ai_generated,
            "tags": blog.tags
        } for blog in blogs
    ]

@router.put("/api/admin/blogs/{blog_id}")
async def update_blog_admin(
    blog_id: str,
    blog_update: AdminBlogUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update any blog as admin"""
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Update fields
    update_data = blog_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title" and value != blog.title:
            # Update slug if title changed
            base_slug = re.sub(r'[^\w\s-]', '', value.lower())
            base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
            slug = base_slug
            counter = 1
            while db.query(Blog).filter(Blog.slug == slug, Blog.id != blog_id).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            blog.slug = slug
        
        setattr(blog, field, value)
    
    if blog_update.status == "published" and not blog.published_at:
        blog.published_at = datetime.utcnow()
    
    blog.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(blog)
    
    return {"message": "Blog updated successfully", "blog_id": blog.id}

@router.delete("/api/admin/blogs/{blog_id}")
async def delete_blog_admin(
    blog_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete any blog as admin"""
    
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db.delete(blog)
    db.commit()
    
    return {"message": "Blog deleted successfully"}

@router.get("/api/admin/reviews")
async def get_all_reviews_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    verified: Optional[bool] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all reviews with admin privileges"""
    
    query = db.query(Review).options(joinedload(Review.user), joinedload(Review.tool))
    
    if verified is not None:
        query = query.filter(Review.is_verified == verified)
    
    reviews = query.order_by(desc(Review.created_at)).offset(skip).limit(limit).all()
    
    return [
        {
            "id": review.id,
            "user": review.user.username,
            "tool": review.tool.name,
            "rating": review.rating,
            "title": review.title,
            "is_verified": review.is_verified,
            "created_at": review.created_at
        } for review in reviews
    ]

@router.put("/api/admin/reviews/{review_id}/verify")
async def verify_review(
    review_id: str,
    verified: bool,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Verify or unverify a review"""
    
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_verified = verified
    db.commit()
    
    return {"message": f"Review {'verified' if verified else 'unverified'} successfully"}

@router.get("/api/admin/seo-pages")
async def get_seo_pages(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all SEO pages"""
    
    seo_pages = db.query(SeoPage).order_by(SeoPage.created_at).all()
    
    return [
        {
            "id": page.id,
            "page_path": page.page_path,
            "title": page.title,
            "description": page.description,
            "keywords": page.keywords,
            "json_ld": page.json_ld,
            "meta_tags": page.meta_tags,
            "created_at": page.created_at,
            "updated_at": page.updated_at
        } for page in seo_pages
    ]

@router.post("/api/admin/seo-pages")
async def create_seo_page(
    seo_page: SeoPageCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new SEO page configuration"""
    
    # Check if page already exists
    existing_page = db.query(SeoPage).filter(SeoPage.page_path == seo_page.page_path).first()
    if existing_page:
        raise HTTPException(status_code=400, detail="SEO page already exists for this path")
    
    db_seo_page = SeoPage(
        id=str(uuid.uuid4()),
        page_path=seo_page.page_path,
        title=seo_page.title,
        description=seo_page.description,
        keywords=seo_page.keywords,
        json_ld=seo_page.json_ld,
        meta_tags=seo_page.meta_tags
    )
    
    db.add(db_seo_page)
    db.commit()
    db.refresh(db_seo_page)
    
    return {"message": "SEO page created successfully", "seo_page_id": db_seo_page.id}

@router.put("/api/admin/seo-pages/{page_id}")
async def update_seo_page(
    page_id: str,
    seo_update: SeoPageUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update SEO page configuration"""
    
    seo_page = db.query(SeoPage).filter(SeoPage.id == page_id).first()
    if not seo_page:
        raise HTTPException(status_code=404, detail="SEO page not found")
    
    # Update fields
    update_data = seo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(seo_page, field, value)
    
    seo_page.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "SEO page updated successfully"}

@router.post("/api/admin/request-tool-access")
async def request_tool_access(
    request: ToolAccessRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Request access to specific tools from super admin"""
    
    # In a real application, you would create a request record
    # For this MVP, we'll just return a success message
    
    tools = db.query(Tool).filter(Tool.id.in_(request.tool_ids)).all()
    if len(tools) != len(request.tool_ids):
        raise HTTPException(status_code=404, detail="One or more tools not found")
    
    tool_names = [tool.name for tool in tools]
    
    return {
        "message": "Tool access request submitted successfully",
        "requested_tools": tool_names,
        "reason": request.reason,
        "status": "pending"
    }

@router.get("/api/admin/analytics")
async def get_admin_analytics(
    days: int = Query(30, ge=1, le=365),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get analytics data for admin dashboard"""
    
    from datetime import timedelta
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Blog analytics
    blog_views = db.query(func.sum(Blog.view_count)).filter(
        Blog.created_at >= start_date
    ).scalar() or 0
    
    new_blogs = db.query(Blog).filter(Blog.created_at >= start_date).count()
    
    # Tool analytics
    tool_views = db.query(func.sum(Tool.view_count)).filter(
        Tool.created_at >= start_date
    ).scalar() or 0
    
    new_reviews = db.query(Review).filter(Review.created_at >= start_date).count()
    
    # User analytics  
    new_users = db.query(User).filter(User.created_at >= start_date).count()
    
    return {
        "period_days": days,
        "analytics": {
            "blog_views": blog_views,
            "new_blogs": new_blogs,
            "tool_views": tool_views,
            "new_reviews": new_reviews,
            "new_users": new_users
        }
    }