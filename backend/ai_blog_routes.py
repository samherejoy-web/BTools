from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import Blog, User, Tool
from auth import get_current_user
from ai_service import ai_service
import uuid
from datetime import datetime
import re

router = APIRouter()

class AIBlogRequest(BaseModel):
    topic: str
    keywords: Optional[List[str]] = []
    target_length: Optional[str] = "medium"  # short, medium, long
    auto_publish: Optional[bool] = False

class AIToolComparisonRequest(BaseModel):
    tool_ids: List[str]
    comparison_criteria: Optional[List[str]] = []
    create_blog: Optional[bool] = True
    auto_publish: Optional[bool] = False

class AIBlogResponse(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: str
    status: str
    is_ai_generated: bool
    created_at: datetime
    seo_title: Optional[str]
    seo_description: Optional[str]
    seo_keywords: Optional[str]
    tags: Optional[List[str]]
    reading_time: Optional[int]

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

@router.post("/api/ai/generate-blog", response_model=AIBlogResponse)
async def generate_blog_with_ai(
    request: AIBlogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Generate blog content using AI
        ai_content = ai_service.generate_blog_content(
            topic=request.topic,
            keywords=request.keywords,
            target_length=request.target_length
        )
        
        # Generate slug
        base_slug = generate_slug(ai_content.get("title", request.topic))
        slug = base_slug
        counter = 1
        
        # Ensure slug is unique
        while db.query(Blog).filter(Blog.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create blog
        db_blog = Blog(
            id=str(uuid.uuid4()),
            title=ai_content.get("title", request.topic),
            slug=slug,
            content=ai_content.get("content", ""),
            excerpt=ai_content.get("excerpt", ""),
            author_id=current_user.id,
            status="published" if request.auto_publish else "draft",
            is_ai_generated=True,
            reading_time=ai_content.get("reading_time", 5),
            tags=ai_content.get("tags", []),
            seo_title=ai_content.get("seo_title"),
            seo_description=ai_content.get("seo_description"),
            seo_keywords=ai_content.get("seo_keywords"),
            published_at=datetime.utcnow() if request.auto_publish else None
        )
        
        db.add(db_blog)
        db.commit()
        db.refresh(db_blog)
        
        return AIBlogResponse(
            id=db_blog.id,
            title=db_blog.title,
            slug=db_blog.slug,
            content=db_blog.content,
            excerpt=db_blog.excerpt,
            status=db_blog.status,
            is_ai_generated=db_blog.is_ai_generated,
            created_at=db_blog.created_at,
            seo_title=db_blog.seo_title,
            seo_description=db_blog.seo_description,
            seo_keywords=db_blog.seo_keywords,
            tags=db_blog.tags,
            reading_time=db_blog.reading_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI blog generation failed: {str(e)}"
        )

@router.post("/api/ai/compare-tools", response_model=Dict[str, Any])
async def ai_compare_tools(
    request: AIToolComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate tool IDs
        if len(request.tool_ids) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 2 tools are required for comparison"
            )
        
        if len(request.tool_ids) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 tools can be compared"
            )
        
        # Get tools from database
        tools = db.query(Tool).filter(Tool.id.in_(request.tool_ids)).all()
        
        if len(tools) != len(request.tool_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more tools not found"
            )
        
        tool_names = [tool.name for tool in tools]
        
        # Generate AI comparison
        comparison_result = ai_service.compare_tools(
            tool_names=tool_names,
            comparison_criteria=request.comparison_criteria
        )
        
        if request.create_blog:
            # Create a blog post from the comparison
            blog_title = f"Tool Comparison: {' vs '.join(tool_names)}"
            
            # Create structured blog content
            blog_content = f"""
            <h1>{blog_title}</h1>
            
            <div class="comparison-summary">
                <h2>Comparison Summary</h2>
                <p>{comparison_result.get('summary', 'AI-generated tool comparison analysis.')}</p>
            </div>
            
            <div class="detailed-comparison">
                <h2>Detailed Analysis</h2>
            """
            
            # Add detailed comparison for each tool
            for tool_data in comparison_result.get('detailed_comparison', []):
                blog_content += f"""
                <div class="tool-analysis">
                    <h3>{tool_data.get('tool_name', 'Tool')}</h3>
                    <div class="pros-cons">
                        <div class="pros">
                            <h4>Pros:</h4>
                            <ul>
                                {''.join([f'<li>{pro}</li>' for pro in tool_data.get('pros', [])])}
                            </ul>
                        </div>
                        <div class="cons">
                            <h4>Cons:</h4>
                            <ul>
                                {''.join([f'<li>{con}</li>' for con in tool_data.get('cons', [])])}
                            </ul>
                        </div>
                    </div>
                    <p><strong>Best for:</strong> {tool_data.get('best_for', 'Various use cases')}</p>
                    <p><strong>Rating:</strong> {tool_data.get('rating', 0)}/5</p>
                </div>
                """
            
            blog_content += f"""
            </div>
            
            <div class="final-verdict">
                <h2>Final Verdict</h2>
                <p><strong>Overall Winner:</strong> {comparison_result.get('overall_winner', 'Depends on use case')}</p>
            </div>
            """
            
            # Generate slug
            base_slug = generate_slug(blog_title)
            slug = base_slug
            counter = 1
            
            while db.query(Blog).filter(Blog.slug == slug).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Create blog
            db_blog = Blog(
                id=str(uuid.uuid4()),
                title=blog_title,
                slug=slug,
                content=blog_content,
                excerpt=f"AI-powered comparison of {', '.join(tool_names)} to help you choose the best tool for your needs.",
                author_id=current_user.id,
                status="published" if request.auto_publish else "draft",
                is_ai_generated=True,
                reading_time=max(5, len(blog_content.split()) // 200),
                tags=tool_names + ["comparison", "tools", "ai-generated"],
                seo_title=f"{blog_title} - AI Comparison Guide",
                seo_description=f"Compare {', '.join(tool_names)} with our AI-powered analysis. Find the best tool for your needs.",
                seo_keywords=", ".join(tool_names + ["comparison", "review", "tools"]),
                published_at=datetime.utcnow() if request.auto_publish else None
            )
            
            db.add(db_blog)
            db.commit()
            db.refresh(db_blog)
            
            comparison_result["blog_created"] = True
            comparison_result["blog_id"] = db_blog.id
            comparison_result["blog_slug"] = db_blog.slug
        
        return comparison_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI tool comparison failed: {str(e)}"
        )

@router.get("/api/ai/blog-topics")
async def get_suggested_blog_topics(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get AI-suggested blog topics based on trending tools and categories"""
    
    # Get trending tools
    trending_tools = db.query(Tool).filter(Tool.is_active == True).order_by(
        Tool.trending_score.desc()
    ).limit(10).all()
    
    # Get recent tool names for topic suggestions
    tool_names = [tool.name for tool in trending_tools]
    
    suggested_topics = [
        f"Complete Guide to {tool_names[0] if tool_names else 'Popular Tools'}",
        f"Top 10 {category or 'Productivity'} Tools in 2024",
        f"How to Choose the Right {category or 'Business'} Tool",
        f"{tool_names[0] if tool_names else 'Popular Tool'} vs Alternatives: Which is Best?",
        f"Getting Started with {tool_names[1] if len(tool_names) > 1 else 'Modern Tools'}",
        "AI Tools That Will Transform Your Workflow",
        "Free vs Paid Tools: Making the Right Choice",
        "Tool Integration Strategies for Maximum Productivity",
        "Future of Digital Tools: Trends and Predictions",
        "Building Your Perfect Tool Stack"
    ]
    
    return {
        "suggested_topics": suggested_topics,
        "trending_tools": [
            {
                "id": tool.id,
                "name": tool.name,
                "category": tool.categories[0].name if tool.categories else "General"
            } for tool in trending_tools[:5]
        ]
    }