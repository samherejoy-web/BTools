"""
Auto SEO Routes for MarketMindAI
API endpoints to trigger automatic static page generation
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from auto_page_generator import (
    generate_page_for_content, 
    cleanup_old_pages, 
    regenerate_all_pages,
    log_page_generation
)
from models import User, Blog, Tool
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/seo/generate-page/{content_type}/{content_id}")
async def generate_static_page(
    content_type: str,
    content_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate static HTML page for new content"""
    
    # Only allow admins and superadmins to trigger page generation
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    if content_type not in ['tool', 'blog']:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    try:
        # Verify content exists
        if content_type == 'tool':
            content = db.query(Tool).filter(Tool.id == content_id).first()
        else:
            content = db.query(Blog).filter(Blog.id == content_id).first()
        
        if not content:
            raise HTTPException(status_code=404, detail=f"{content_type.title()} not found")
        
        # Generate page in background
        background_tasks.add_task(generate_page_for_content, content_type, content_id)
        
        logger.info(f"Page generation requested for {content_type} {content_id} by {current_user.email}")
        
        return {
            "message": f"Static page generation started for {content_type}",
            "content_id": content_id,
            "slug": content.slug,
            "url": f"/{content_type}s/{content.slug}",
            "status": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating page for {content_type} {content_id}: {e}")
        raise HTTPException(status_code=500, detail="Page generation failed")

@router.post("/api/seo/regenerate-all")
async def regenerate_all_static_pages(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Regenerate all static pages (admin only)"""
    
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Superadmin access required")
    
    try:
        # Trigger regeneration in background
        background_tasks.add_task(regenerate_all_pages)
        
        logger.info(f"Full page regeneration requested by {current_user.email}")
        
        return {
            "message": "Full static page regeneration started",
            "status": "processing",
            "note": "This may take several minutes depending on content volume"
        }
        
    except Exception as e:
        logger.error(f"Error starting full regeneration: {e}")
        raise HTTPException(status_code=500, detail="Regeneration failed to start")

@router.post("/api/seo/cleanup-pages")
async def cleanup_outdated_pages(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Remove static pages for deleted content"""
    
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    try:
        # Run cleanup in background
        background_tasks.add_task(cleanup_old_pages)
        
        logger.info(f"Page cleanup requested by {current_user.email}")
        
        return {
            "message": "Page cleanup started",
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Error starting cleanup: {e}")
        raise HTTPException(status_code=500, detail="Cleanup failed to start")

@router.get("/api/seo/page-status/{content_type}/{slug}")
async def check_page_status(
    content_type: str,
    slug: str,
    db: Session = Depends(get_db)
):
    """Check if static page exists for content"""
    
    if content_type not in ['tool', 'blog']:
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    try:
        # Check if content exists in database
        if content_type == 'tool':
            content = db.query(Tool).filter(Tool.slug == slug).first()
        else:
            content = db.query(Blog).filter(Blog.slug == slug).first()
        
        if not content:
            return {
                "exists": False,
                "static_page": False,
                "message": "Content not found in database"
            }
        
        # Check if static page exists
        import os
        from auto_page_generator import FRONTEND_BUILD_PATH
        
        page_path = os.path.join(FRONTEND_BUILD_PATH, f"{content_type}s", slug, "index.html")
        static_page_exists = os.path.exists(page_path)
        
        return {
            "exists": True,
            "content_id": content.id,
            "slug": slug,
            "static_page": static_page_exists,
            "url": f"/{content_type}s/{slug}",
            "last_modified": None  # Could add file modification time if needed
        }
        
    except Exception as e:
        logger.error(f"Error checking page status: {e}")
        raise HTTPException(status_code=500, detail="Status check failed")

@router.get("/api/seo/generation-stats")
async def get_generation_stats(current_user: User = Depends(get_current_user)):
    """Get statistics about generated pages"""
    
    try:
        import os
        from auto_page_generator import FRONTEND_BUILD_PATH
        
        stats = {
            "tools": {"total": 0, "with_pages": 0},
            "blogs": {"total": 0, "with_pages": 0},
            "build_path": FRONTEND_BUILD_PATH,
            "last_updated": None
        }
        
        # Count tool pages
        tools_dir = os.path.join(FRONTEND_BUILD_PATH, "tools")
        if os.path.exists(tools_dir):
            tool_pages = [item for item in os.listdir(tools_dir) 
                         if os.path.isdir(os.path.join(tools_dir, item)) and item != "index.html"]
            stats["tools"]["with_pages"] = len(tool_pages)
        
        # Count blog pages
        blogs_dir = os.path.join(FRONTEND_BUILD_PATH, "blogs")
        if os.path.exists(blogs_dir):
            blog_pages = [item for item in os.listdir(blogs_dir) 
                         if os.path.isdir(os.path.join(blogs_dir, item)) and item != "index.html"]
            stats["blogs"]["with_pages"] = len(blog_pages)
        
        # Check log file for last update
        log_file = os.path.join(FRONTEND_BUILD_PATH, "auto-generated-pages.log")
        if os.path.exists(log_file):
            import time
            stats["last_updated"] = time.ctime(os.path.getmtime(log_file))
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting generation stats: {e}")
        raise HTTPException(status_code=500, detail="Stats retrieval failed")