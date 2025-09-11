from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, func
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Blog, User, BlogComment, BlogLike, BlogBookmark
from auth import get_current_user, get_current_admin
import uuid
from datetime import datetime
import os
import shutil
import re

router = APIRouter()

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    tags: Optional[List[str]] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    json_ld: Optional[dict] = None

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    blog_id: str
    user_id: str
    user_name: str
    parent_id: Optional[str]
    content: str
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    replies: Optional[List['CommentResponse']] = []

class LikeResponse(BaseModel):
    liked: bool
    like_count: int

class BookmarkResponse(BaseModel):
    bookmarked: bool

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    json_ld: Optional[dict] = None

class BlogResponse(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    featured_image: Optional[str]
    author_id: str
    author_name: str
    status: str
    view_count: int
    like_count: int
    reading_time: Optional[int]
    tags: Optional[List[str]]
    is_ai_generated: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    seo_title: Optional[str]
    seo_description: Optional[str]
    seo_keywords: Optional[str]
    json_ld: Optional[dict] = None

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def calculate_reading_time(content: str) -> int:
    """Calculate estimated reading time in minutes"""
    word_count = len(content.split())
    return max(1, word_count // 200)  # Assume 200 words per minute

@router.post("/api/blogs", response_model=BlogResponse)
async def create_blog(
    blog: BlogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate slug
    base_slug = generate_slug(blog.title)
    slug = base_slug
    counter = 1
    
    # Ensure slug is unique
    while db.query(Blog).filter(Blog.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Calculate reading time
    reading_time = calculate_reading_time(blog.content)
    
    # Create blog
    db_blog = Blog(
        id=str(uuid.uuid4()),
        title=blog.title,
        slug=slug,
        content=blog.content,
        excerpt=blog.excerpt or blog.content[:200] + "...",
        featured_image=blog.featured_image,
        author_id=current_user.id,
        reading_time=reading_time,
        tags=blog.tags,
        seo_title=blog.seo_title or blog.title,
        seo_description=blog.seo_description or blog.excerpt,
        seo_keywords=blog.seo_keywords,
        json_ld=blog.json_ld
    )
    
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    
    return BlogResponse(
        id=db_blog.id,
        title=db_blog.title,
        slug=db_blog.slug,
        content=db_blog.content,
        excerpt=db_blog.excerpt,
        featured_image=db_blog.featured_image,
        author_id=db_blog.author_id,
        author_name=current_user.full_name or current_user.username,
        status=db_blog.status,
        view_count=db_blog.view_count,
        like_count=db_blog.like_count,
        reading_time=db_blog.reading_time,
        tags=db_blog.tags,
        is_ai_generated=db_blog.is_ai_generated,
        created_at=db_blog.created_at,
        updated_at=db_blog.updated_at,
        published_at=db_blog.published_at,
        seo_title=db_blog.seo_title,
        seo_description=db_blog.seo_description,
        seo_keywords=db_blog.seo_keywords,
        json_ld=db_blog.json_ld
    )

@router.get("/api/blogs", response_model=List[BlogResponse])
async def get_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest", description="Sort by: newest, oldest, most_viewed, trending"),
    featured: Optional[bool] = Query(None, description="Filter AI generated blogs"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    query = db.query(Blog).options(joinedload(Blog.author))
    
    # Default to published blogs for public access
    if status:
        query = query.filter(Blog.status == status)
    else:
        query = query.filter(Blog.status == "published")
    
    if search:
        query = query.filter(
            or_(
                Blog.title.contains(search),
                Blog.content.contains(search),
                Blog.excerpt.contains(search)
            )
        )
    
    if tag:
        query = query.filter(Blog.tags.contains([tag]))
    
    if author_id:
        query = query.filter(Blog.author_id == author_id)
    
    # AI Generated filter (using featured parameter for now since UI uses it)
    if featured is not None:
        query = query.filter(Blog.is_ai_generated == featured)
    
    # Apply sorting
    if sort == "newest":
        query = query.order_by(desc(Blog.created_at))
    elif sort == "oldest":
        query = query.order_by(Blog.created_at)
    elif sort == "most_viewed":
        query = query.order_by(desc(Blog.view_count))
    elif sort == "trending":
        # Trending = combination of recent views and creation date
        # Use view_count as primary sort, then created_at as secondary
        query = query.order_by(desc(Blog.view_count), desc(Blog.created_at))
    else:
        query = query.order_by(desc(Blog.created_at))
    
    blogs = query.offset(skip).limit(limit).all()
    
    return [
        BlogResponse(
            id=blog.id,
            title=blog.title,
            slug=blog.slug,
            content=blog.content,
            excerpt=blog.excerpt,
            featured_image=blog.featured_image,
            author_id=blog.author_id,
            author_name=blog.author.full_name or blog.author.username,
            status=blog.status,
            view_count=blog.view_count,
            reading_time=blog.reading_time,
            tags=blog.tags,
            is_ai_generated=blog.is_ai_generated,
            created_at=blog.created_at,
            updated_at=blog.updated_at,
            published_at=blog.published_at,
            seo_title=blog.seo_title,
            seo_description=blog.seo_description,
            seo_keywords=blog.seo_keywords,
            json_ld=blog.json_ld
        ) for blog in blogs
    ]

@router.get("/api/blogs/{blog_id}", response_model=BlogResponse)
async def get_blog(blog_id: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).options(joinedload(Blog.author)).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    return BlogResponse(
        id=blog.id,
        title=blog.title,
        slug=blog.slug,
        content=blog.content,
        excerpt=blog.excerpt,
        featured_image=blog.featured_image,
        author_id=blog.author_id,
        author_name=blog.author.full_name or blog.author.username,
        status=blog.status,
        view_count=blog.view_count,
        reading_time=blog.reading_time,
        tags=blog.tags,
        is_ai_generated=blog.is_ai_generated,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
        published_at=blog.published_at,
        seo_title=blog.seo_title,
        seo_description=blog.seo_description,
        seo_keywords=blog.seo_keywords,
        json_ld=blog.json_ld
    )

@router.get("/api/blogs/by-slug/{blog_slug}", response_model=BlogResponse)
async def get_blog_by_slug(blog_slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).options(joinedload(Blog.author)).filter(
        Blog.slug == blog_slug,
        Blog.status == "published"
    ).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    return BlogResponse(
        id=blog.id,
        title=blog.title,
        slug=blog.slug,
        content=blog.content,
        excerpt=blog.excerpt,
        featured_image=blog.featured_image,
        author_id=blog.author_id,
        author_name=blog.author.full_name or blog.author.username,
        status=blog.status,
        view_count=blog.view_count,
        reading_time=blog.reading_time,
        tags=blog.tags,
        is_ai_generated=blog.is_ai_generated,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
        published_at=blog.published_at,
        seo_title=blog.seo_title,
        seo_description=blog.seo_description,
        seo_keywords=blog.seo_keywords,
        json_ld=blog.json_ld
    )

@router.post("/api/blogs/{blog_slug}/view")
async def increment_blog_view(blog_slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == blog_slug).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment view count
    blog.view_count += 1
    db.commit()
    
    return {"message": "View count incremented", "view_count": blog.view_count}

@router.put("/api/blogs/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    blog_update: BlogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if user owns the blog or is admin
    if blog.author_id != current_user.id and current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this blog")
    
    # Update fields
    update_data = blog_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title" and value != blog.title:
            # Update slug if title changed
            new_slug = generate_slug(value)
            counter = 1
            while db.query(Blog).filter(Blog.slug == new_slug, Blog.id != blog_id).first():
                new_slug = f"{generate_slug(value)}-{counter}"
                counter += 1
            blog.slug = new_slug
        
        if field == "content":
            # Recalculate reading time
            blog.reading_time = calculate_reading_time(value)
        
        setattr(blog, field, value)
    
    blog.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(blog)
    
    return BlogResponse(
        id=blog.id,
        title=blog.title,
        slug=blog.slug,
        content=blog.content,
        excerpt=blog.excerpt,
        featured_image=blog.featured_image,
        author_id=blog.author_id,
        author_name=current_user.full_name or current_user.username,
        status=blog.status,
        view_count=blog.view_count,
        reading_time=blog.reading_time,
        tags=blog.tags,
        is_ai_generated=blog.is_ai_generated,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
        published_at=blog.published_at,
        seo_title=blog.seo_title,
        seo_description=blog.seo_description,
        seo_keywords=blog.seo_keywords,
        json_ld=blog.json_ld
    )

@router.post("/api/blogs/{blog_id}/publish")
async def publish_blog(
    blog_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if blog.author_id != current_user.id and current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to publish this blog")
    
    blog.status = "published"
    blog.published_at = datetime.utcnow()
    blog.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Blog published successfully"}

@router.delete("/api/blogs/{blog_id}")
async def delete_blog(
    blog_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    if blog.author_id != current_user.id and current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this blog")
    
    db.delete(blog)
    db.commit()
    
    return {"message": "Blog deleted successfully"}

@router.post("/api/blogs/upload-image")
async def upload_blog_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads/blog-images", exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/blog-images/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "Image uploaded successfully", "image_url": f"/api/uploads/blog-images/{filename}"}

@router.get("/api/uploads/blog-images/{filename}")
async def serve_blog_image(filename: str):
    """Serve blog images through API to ensure proper routing"""
    from fastapi import HTTPException
    from fastapi.responses import FileResponse
    
    file_path = f"uploads/blog-images/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="Image not found")

# Comment endpoints
@router.post("/api/blogs/{blog_slug}/comments", response_model=CommentResponse)
async def create_comment(
    blog_slug: str,
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.slug == blog_slug, Blog.status == "published").first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db_comment = BlogComment(
        id=str(uuid.uuid4()),
        blog_id=blog.id,
        user_id=current_user.id,
        parent_id=comment.parent_id,
        content=comment.content
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return CommentResponse(
        id=db_comment.id,
        blog_id=db_comment.blog_id,
        user_id=db_comment.user_id,
        user_name=current_user.full_name or current_user.username,
        parent_id=db_comment.parent_id,
        content=db_comment.content,
        is_approved=db_comment.is_approved,
        created_at=db_comment.created_at,
        updated_at=db_comment.updated_at,
        replies=[]
    )

@router.get("/api/blogs/{blog_slug}/comments", response_model=List[CommentResponse])
async def get_comments(
    blog_slug: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.slug == blog_slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Get root comments (no parent)
    root_comments = db.query(BlogComment).options(joinedload(BlogComment.user)).filter(
        BlogComment.blog_id == blog.id,
        BlogComment.parent_id.is_(None),
        BlogComment.is_approved == True
    ).order_by(desc(BlogComment.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for comment in root_comments:
        # Get replies for each root comment
        replies = db.query(BlogComment).options(joinedload(BlogComment.user)).filter(
            BlogComment.parent_id == comment.id,
            BlogComment.is_approved == True
        ).order_by(BlogComment.created_at).all()
        
        reply_responses = [
            CommentResponse(
                id=reply.id,
                blog_id=reply.blog_id,
                user_id=reply.user_id,
                user_name=reply.user.full_name or reply.user.username,
                parent_id=reply.parent_id,
                content=reply.content,
                is_approved=reply.is_approved,
                created_at=reply.created_at,
                updated_at=reply.updated_at,
                replies=[]
            ) for reply in replies
        ]
        
        result.append(CommentResponse(
            id=comment.id,
            blog_id=comment.blog_id,
            user_id=comment.user_id,
            user_name=comment.user.full_name or comment.user.username,
            parent_id=comment.parent_id,
            content=comment.content,
            is_approved=comment.is_approved,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            replies=reply_responses
        ))
    
    return result

# Like endpoints
@router.post("/api/blogs/{blog_slug}/like", response_model=LikeResponse)
async def toggle_blog_like(
    blog_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.slug == blog_slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if already liked
    existing_like = db.query(BlogLike).filter(
        BlogLike.blog_id == blog.id,
        BlogLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Remove like
        db.delete(existing_like)
        blog.like_count = max(0, blog.like_count - 1)
        liked = False
    else:
        # Add like
        new_like = BlogLike(
            id=str(uuid.uuid4()),
            blog_id=blog.id,
            user_id=current_user.id
        )
        db.add(new_like)
        blog.like_count += 1
        liked = True
    
    db.commit()
    
    return LikeResponse(liked=liked, like_count=blog.like_count)

# Bookmark endpoints
@router.post("/api/blogs/{blog_slug}/bookmark", response_model=BookmarkResponse)
async def toggle_blog_bookmark(
    blog_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    blog = db.query(Blog).filter(Blog.slug == blog_slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Check if already bookmarked
    existing_bookmark = db.query(BlogBookmark).filter(
        BlogBookmark.blog_id == blog.id,
        BlogBookmark.user_id == current_user.id
    ).first()
    
    if existing_bookmark:
        # Remove bookmark
        db.delete(existing_bookmark)
        bookmarked = False
    else:
        # Add bookmark
        new_bookmark = BlogBookmark(
            id=str(uuid.uuid4()),
            blog_id=blog.id,
            user_id=current_user.id
        )
        db.add(new_bookmark)
        bookmarked = True
    
    db.commit()
    
    return BookmarkResponse(bookmarked=bookmarked)