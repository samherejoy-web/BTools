"""
Auto SEO Routes for MarketMindAI
API endpoints to trigger automatic static page generation
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
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
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any

router = APIRouter()
logger = logging.getLogger(__name__)

# Global progress tracking
progress_store: Dict[str, Dict[str, Any]] = {}

class ProgressTracker:
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.progress = {
            "task_id": task_id,
            "status": "starting",
            "current_step": "",
            "total_steps": 0,
            "completed_steps": 0,
            "percentage": 0,
            "tools_processed": 0,
            "blogs_processed": 0,
            "pages_generated": 0,
            "errors": [],
            "warnings": [],
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "duration": None
        }
        progress_store[task_id] = self.progress
    
    def update_status(self, status: str, step: str = None, percentage: int = None):
        self.progress["status"] = status
        if step:
            self.progress["current_step"] = step
        if percentage is not None:
            self.progress["percentage"] = min(100, max(0, percentage))
        progress_store[self.task_id] = self.progress
    
    def increment_progress(self, tools: int = 0, blogs: int = 0, pages: int = 0):
        self.progress["tools_processed"] += tools
        self.progress["blogs_processed"] += blogs  
        self.progress["pages_generated"] += pages
        self.progress["completed_steps"] += 1
        
        if self.progress["total_steps"] > 0:
            self.progress["percentage"] = int((self.progress["completed_steps"] / self.progress["total_steps"]) * 100)
        
        progress_store[self.task_id] = self.progress
    
    def add_error(self, error_msg: str):
        self.progress["errors"].append({"message": error_msg, "timestamp": datetime.now().isoformat()})
        progress_store[self.task_id] = self.progress
    
    def add_warning(self, warning_msg: str):
        self.progress["warnings"].append({"message": warning_msg, "timestamp": datetime.now().isoformat()})
        progress_store[self.task_id] = self.progress
    
    def complete(self, status: str = "completed"):
        self.progress["status"] = status
        self.progress["end_time"] = datetime.now().isoformat()
        self.progress["percentage"] = 100
        
        # Calculate duration
        start = datetime.fromisoformat(self.progress["start_time"])
        end = datetime.fromisoformat(self.progress["end_time"])
        duration = end - start
        self.progress["duration"] = str(duration).split('.')[0]  # Remove microseconds
        
        progress_store[self.task_id] = self.progress

def regenerate_all_pages_with_progress(task_id: str, db: Session):
    """Enhanced page regeneration with progress tracking"""
    tracker = ProgressTracker(task_id)
    
    try:
        # Get all active tools and published blogs
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        blogs = db.query(Blog).filter(Blog.status == 'published').all()
        
        total_items = len(tools) + len(blogs)
        tracker.progress["total_steps"] = total_items
        tracker.update_status("processing", f"Found {len(tools)} tools and {len(blogs)} blogs to process", 0)
        
        # Process tools
        tracker.update_status("processing", "Processing tools...", 5)
        for i, tool in enumerate(tools):
            try:
                tracker.update_status("processing", f"Generating page for tool: {tool.name}")
                generate_page_for_content('tool', tool.id)
                tracker.increment_progress(tools=1, pages=1)
                
                # Small delay to make progress visible
                import time
                time.sleep(0.1)
                
            except Exception as e:
                tracker.add_error(f"Failed to generate page for tool {tool.name}: {str(e)}")
                tracker.increment_progress(tools=1)
        
        # Process blogs  
        tracker.update_status("processing", "Processing blogs...", 50)
        for i, blog in enumerate(blogs):
            try:
                tracker.update_status("processing", f"Generating page for blog: {blog.title}")
                generate_page_for_content('blog', blog.id)
                tracker.increment_progress(blogs=1, pages=1)
                
                # Small delay to make progress visible
                import time
                time.sleep(0.1)
                
            except Exception as e:
                tracker.add_error(f"Failed to generate page for blog {blog.title}: {str(e)}")
                tracker.increment_progress(blogs=1)
        
        # Cleanup phase
        tracker.update_status("processing", "Cleaning up outdated pages...", 95)
        try:
            cleanup_old_pages()
        except Exception as e:
            tracker.add_warning(f"Cleanup completed with warnings: {str(e)}")
        
        # Complete
        tracker.complete("completed")
        
    except Exception as e:
        logger.error(f"Fatal error during regeneration: {e}")
        tracker.add_error(f"Fatal error: {str(e)}")
        tracker.complete("failed")

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate all static pages with progress tracking (superadmin only)"""
    
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Superadmin access required")
    
    try:
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Trigger regeneration in background with progress tracking
        background_tasks.add_task(regenerate_all_pages_with_progress, task_id, db)
        
        logger.info(f"Full page regeneration requested by {current_user.email} - Task ID: {task_id}")
        
        return {
            "message": "Full static page regeneration started with progress tracking",
            "task_id": task_id,
            "status": "processing",
            "progress_url": f"/api/seo/regenerate-progress/{task_id}"
        }
        
    except Exception as e:
        logger.error(f"Error starting full regeneration: {e}")
        raise HTTPException(status_code=500, detail="Regeneration failed to start")

@router.get("/api/seo/regenerate-progress/{task_id}")
async def get_regeneration_progress(task_id: str):
    """Get current progress of regeneration task"""
    
    if task_id not in progress_store:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return progress_store[task_id]

@router.get("/api/seo/regenerate-stream/{task_id}")
async def stream_regeneration_progress(task_id: str, request: Request):
    """Stream regeneration progress via Server-Sent Events"""
    
    async def event_stream():
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    break
                
                # Get current progress
                if task_id in progress_store:
                    progress = progress_store[task_id]
                    
                    # Send progress update
                    yield f"data: {json.dumps(progress)}\n\n"
                    
                    # If task completed, send final update and close
                    if progress["status"] in ["completed", "failed"]:
                        await asyncio.sleep(1)  # Give client time to process final update
                        break
                else:
                    # Task not found
                    yield f"data: {json.dumps({'error': 'Task not found'})}\n\n"
                    break
                
                # Wait before next update
                await asyncio.sleep(0.5)
                
        except asyncio.CancelledError:
            # Client disconnected
            pass
        except Exception as e:
            logger.error(f"Error in SSE stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

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