from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import Tool, Category, Review, User, user_tool_favorites, ToolComment, ToolLike
from auth import get_current_user, get_current_admin
import uuid
from datetime import datetime
import os
import shutil

def get_tools_routes():
    router = APIRouter()
    
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
        seo_title: Optional[str] = None
        seo_description: Optional[str] = None
        seo_keywords: Optional[str] = None
    
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
    
    class ToolResponse(BaseModel):
        id: str
        name: str
        slug: str
        description: str
        short_description: Optional[str]
        url: Optional[str]
        logo_url: Optional[str]
        screenshot_url: Optional[str]
        pricing_type: str
        pricing_details: Dict[str, Any]
        features: List[str]
        pros: List[str]
        cons: List[str]
        rating: float
        review_count: int
        view_count: int
        like_count: int
        trending_score: float
        is_featured: bool
        is_active: bool
        created_at: datetime
        updated_at: datetime
        categories: List[Dict[str, str]]
        seo_title: Optional[str]
        seo_description: Optional[str]
        seo_keywords: Optional[str]
    
    class ToolCommentCreate(BaseModel):
        content: str
        parent_id: Optional[str] = None

    class ToolCommentResponse(BaseModel):
        id: str
        tool_id: str
        user_id: str
        user_name: str
        parent_id: Optional[str]
        content: str
        is_approved: bool
        created_at: datetime
        updated_at: datetime
        replies: Optional[List['ToolCommentResponse']] = []

    class ToolLikeResponse(BaseModel):
        liked: bool
        like_count: int
    
    class ReviewCreate(BaseModel):
        tool_id: str
        rating: int
        title: Optional[str] = None
        content: Optional[str] = None
        pros: Optional[List[str]] = []
        cons: Optional[List[str]] = []
    
    class ReviewResponse(BaseModel):
        id: str
        user_id: str
        user_name: str
        tool_id: str
        rating: int
        title: Optional[str]
        content: Optional[str]
        pros: List[str]
        cons: List[str]
        is_verified: bool
        created_at: datetime
        updated_at: datetime
    
    def generate_slug(name: str) -> str:
        """Generate URL-friendly slug from name"""
        import re
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    @router.get("/api/tools", response_model=List[ToolResponse])
    async def get_tools(
        skip: int = Query(0, ge=0),
        limit: int = Query(20, ge=1, le=100),
        category: Optional[str] = Query(None),
        pricing: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        sort: Optional[str] = Query("recent", description="recent, trending, rating, name"),
        featured: Optional[bool] = Query(None),
        db: Session = Depends(get_db)
    ):
        query = db.query(Tool).options(joinedload(Tool.categories)).filter(Tool.is_active == True)
        
        if category:
            query = query.join(Tool.categories).filter(Category.slug == category)
        
        if pricing:
            query = query.filter(Tool.pricing_type == pricing)
        
        if search:
            query = query.filter(
                or_(
                    Tool.name.contains(search),
                    Tool.description.contains(search),
                    Tool.short_description.contains(search)
                )
            )
        
        if featured is not None:
            query = query.filter(Tool.is_featured == featured)
        
        # Apply sorting
        if sort == "trending":
            query = query.order_by(desc(Tool.trending_score))
        elif sort == "rating":
            query = query.order_by(desc(Tool.rating))
        elif sort == "name":
            query = query.order_by(Tool.name)
        else:  # recent
            query = query.order_by(desc(Tool.created_at))
        
        tools = query.offset(skip).limit(limit).all()
        
        return [
            ToolResponse(
                id=tool.id,
                name=tool.name,
                slug=tool.slug,
                description=tool.description,
                short_description=tool.short_description,
                url=tool.url,
                logo_url=tool.logo_url,
                screenshot_url=tool.screenshot_url,
                pricing_type=tool.pricing_type,
                pricing_details=tool.pricing_details or {},
                features=tool.features or [],
                pros=tool.pros or [],
                cons=tool.cons or [],
                rating=tool.rating,
                review_count=tool.review_count,
                view_count=tool.view_count,
                like_count=tool.like_count,
                trending_score=tool.trending_score,
                is_featured=tool.is_featured,
                is_active=tool.is_active,
                created_at=tool.created_at,
                updated_at=tool.updated_at,
                categories=[{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in tool.categories],
                seo_title=tool.seo_title,
                seo_description=tool.seo_description,
                seo_keywords=tool.seo_keywords
            ) for tool in tools
        ]
    
    @router.get("/api/tools/compare", response_model=List[ToolResponse])
    async def compare_tools(
        tool_ids: str = Query(..., description="Comma-separated tool IDs or slugs"),
        db: Session = Depends(get_db)
    ):
        tool_id_list = [tid.strip() for tid in tool_ids.split(",")]
        if len(tool_id_list) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 tools can be compared")
        
        # Try to find tools by ID first, then by slug
        tools = db.query(Tool).options(joinedload(Tool.categories)).filter(
            or_(Tool.id.in_(tool_id_list), Tool.slug.in_(tool_id_list)),
            Tool.is_active == True
        ).all()
        
        if len(tools) == 0:
            raise HTTPException(status_code=404, detail="No tools found with the provided IDs or slugs")
        
        # If fewer tools found than requested, still return what we found
        found_count = len(tools)
        requested_count = len(tool_id_list)
        if found_count < requested_count:
            print(f"Warning: Found {found_count} tools out of {requested_count} requested")
        
        return [
            ToolResponse(
                id=tool.id,
                name=tool.name,
                slug=tool.slug,
                description=tool.description,
                short_description=tool.short_description,
                url=tool.url,
                logo_url=tool.logo_url,
                screenshot_url=tool.screenshot_url,
                pricing_type=tool.pricing_type,
                pricing_details=tool.pricing_details or {},
                features=tool.features or [],
                pros=tool.pros or [],
                cons=tool.cons or [],
                rating=tool.rating,
                review_count=tool.review_count,
                view_count=tool.view_count,
                like_count=tool.like_count,
                trending_score=tool.trending_score,
                is_featured=tool.is_featured,
                is_active=tool.is_active,
                created_at=tool.created_at,
                updated_at=tool.updated_at,
                categories=[{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in tool.categories],
                seo_title=tool.seo_title,
                seo_description=tool.seo_description,
                seo_keywords=tool.seo_keywords
            ) for tool in tools
        ]
    
    @router.get("/api/tools/{tool_id}", response_model=ToolResponse)
    async def get_tool(tool_id: str, db: Session = Depends(get_db)):
        tool = db.query(Tool).options(joinedload(Tool.categories)).filter(Tool.id == tool_id).first()
        
        if not tool or not tool.is_active:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        # Increment view count
        tool.view_count += 1
        db.commit()
        
        return ToolResponse(
            id=tool.id,
            name=tool.name,
            slug=tool.slug,
            description=tool.description,
            short_description=tool.short_description,
            url=tool.url,
            logo_url=tool.logo_url,
            screenshot_url=tool.screenshot_url,
            pricing_type=tool.pricing_type,
            pricing_details=tool.pricing_details or {},
            features=tool.features or [],
            pros=tool.pros or [],
            cons=tool.cons or [],
            rating=tool.rating,
            review_count=tool.review_count,
            view_count=tool.view_count,
            trending_score=tool.trending_score,
            is_featured=tool.is_featured,
            is_active=tool.is_active,
            created_at=tool.created_at,
            updated_at=tool.updated_at,
            categories=[{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in tool.categories],
            seo_title=tool.seo_title,
            seo_description=tool.seo_description,
            seo_keywords=tool.seo_keywords
        )
    
    @router.get("/api/tools/by-slug/{tool_slug}", response_model=ToolResponse)
    async def get_tool_by_slug(tool_slug: str, db: Session = Depends(get_db)):
        tool = db.query(Tool).options(joinedload(Tool.categories)).filter(
            Tool.slug == tool_slug,
            Tool.is_active == True
        ).first()
        
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        # Increment view count
        tool.view_count += 1
        db.commit()
        
        return ToolResponse(
            id=tool.id,
            name=tool.name,
            slug=tool.slug,
            description=tool.description,
            short_description=tool.short_description,
            url=tool.url,
            logo_url=tool.logo_url,
            screenshot_url=tool.screenshot_url,
            pricing_type=tool.pricing_type,
            pricing_details=tool.pricing_details or {},
            features=tool.features or [],
            pros=tool.pros or [],
            cons=tool.cons or [],
            rating=tool.rating,
            review_count=tool.review_count,
            view_count=tool.view_count,
            trending_score=tool.trending_score,
            is_featured=tool.is_featured,
            is_active=tool.is_active,
            created_at=tool.created_at,
            updated_at=tool.updated_at,
            categories=[{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in tool.categories],
            seo_title=tool.seo_title,
            seo_description=tool.seo_description,
            seo_keywords=tool.seo_keywords
        )
    
    @router.post("/api/tools/{tool_id}/reviews", response_model=ReviewResponse)
    async def create_review(
        review: ReviewCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Check if tool exists
        tool = db.query(Tool).filter(Tool.id == review.tool_id).first()
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        # Check if user already reviewed this tool
        existing_review = db.query(Review).filter(
            Review.user_id == current_user.id,
            Review.tool_id == review.tool_id
        ).first()
        
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this tool")
        
        # Create review
        db_review = Review(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            tool_id=review.tool_id,
            rating=review.rating,
            title=review.title,
            content=review.content,
            pros=review.pros,
            cons=review.cons
        )
        
        db.add(db_review)
        
        # Update tool rating and review count
        reviews = db.query(Review).filter(Review.tool_id == review.tool_id).all()
        reviews.append(db_review)  # Include the new review
        
        total_rating = sum(r.rating for r in reviews)
        tool.rating = total_rating / len(reviews)
        tool.review_count = len(reviews)
        
        db.commit()
        db.refresh(db_review)
        
        return ReviewResponse(
            id=db_review.id,
            user_id=db_review.user_id,
            user_name=current_user.full_name or current_user.username,
            tool_id=db_review.tool_id,
            rating=db_review.rating,
            title=db_review.title,
            content=db_review.content,
            pros=db_review.pros or [],
            cons=db_review.cons or [],
            is_verified=db_review.is_verified,
            created_at=db_review.created_at,
            updated_at=db_review.updated_at
        )
    
    @router.get("/api/tools/{tool_id}/reviews", response_model=List[ReviewResponse])
    async def get_tool_reviews(
        tool_id: str,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1, le=50),
        db: Session = Depends(get_db)
    ):
        reviews = db.query(Review).options(joinedload(Review.user)).filter(
            Review.tool_id == tool_id
        ).order_by(desc(Review.created_at)).offset(skip).limit(limit).all()
        
        return [
            ReviewResponse(
                id=review.id,
                user_id=review.user_id,
                user_name=review.user.full_name or review.user.username,
                tool_id=review.tool_id,
                rating=review.rating,
                title=review.title,
                content=review.content,
                pros=review.pros or [],
                cons=review.cons or [],
                is_verified=review.is_verified,
                created_at=review.created_at,
                updated_at=review.updated_at
            ) for review in reviews
        ]
    
    @router.post("/api/tools/{tool_id}/favorite")
    async def toggle_favorite(
        tool_id: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        tool = db.query(Tool).filter(Tool.id == tool_id).first()
        if not tool:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        # Check if already favorited
        is_favorited = db.query(user_tool_favorites).filter(
            user_tool_favorites.c.user_id == current_user.id,
            user_tool_favorites.c.tool_id == tool_id
        ).first()
        
        if is_favorited:
            # Remove from favorites
            db.execute(user_tool_favorites.delete().where(
                user_tool_favorites.c.user_id == current_user.id,
                user_tool_favorites.c.tool_id == tool_id
            ))
            message = "Tool removed from favorites"
            favorited = False
        else:
            # Add to favorites
            db.execute(user_tool_favorites.insert().values(
                user_id=current_user.id,
                tool_id=tool_id
            ))
            message = "Tool added to favorites"
            favorited = True
        
        db.commit()
        
        return {"message": message, "favorited": favorited}
    
    return router