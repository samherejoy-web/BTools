from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from database import get_db
from models import Tool, Blog, Category
from auth import get_current_user
import re
from collections import Counter
import uuid

router = APIRouter()

class InternalLinkSuggestion(BaseModel):
    target_url: str
    target_title: str
    target_type: str  # 'tool', 'blog', 'category'
    anchor_text: str
    context: str
    relevance_score: float
    position: int  # Character position in content where suggestion applies

class SEOScoreBreakdown(BaseModel):
    overall_score: float
    title_score: float
    description_score: float
    keywords_score: float
    content_score: float
    internal_links_score: float
    recommendations: List[str]

class ContentAnalysisRequest(BaseModel):
    content: str
    title: str
    content_type: str  # 'blog', 'tool_description'
    existing_links: Optional[List[str]] = []

# Utility functions for content analysis
def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """Extract potential keywords from text"""
    # Remove HTML tags and normalize text
    clean_text = re.sub(r'<[^>]*>', '', text.lower())
    
    # Extract words, filter out common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'this', 'that', 'these', 'those', 'is', 'are', 
        'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 
        'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
        'from', 'up', 'about', 'into', 'through', 'during', 'before', 
        'after', 'above', 'below', 'between', 'among', 'under', 'over'
    }
    
    # Extract words and phrases
    words = re.findall(r'\b[a-zA-Z]{3,}\b', clean_text)
    keywords = [word for word in words if word not in stop_words and len(word) >= min_length]
    
    # Extract 2-word phrases
    phrases = []
    for i in range(len(words) - 1):
        if words[i] not in stop_words and words[i+1] not in stop_words:
            phrase = f"{words[i]} {words[i+1]}"
            if len(phrase) >= 6:  # Minimum phrase length
                phrases.append(phrase)
    
    # Count frequency and return most common
    word_counts = Counter(keywords)
    phrase_counts = Counter(phrases)
    
    # Combine and return top keywords
    top_words = [word for word, count in word_counts.most_common(10) if count > 1]
    top_phrases = [phrase for phrase, count in phrase_counts.most_common(5) if count > 1]
    
    return top_words + top_phrases

def calculate_relevance_score(keyword: str, target_content: str, target_title: str) -> float:
    """Calculate relevance score between keyword and target content"""
    keyword_lower = keyword.lower()
    content_lower = target_content.lower()
    title_lower = target_title.lower()
    
    score = 0.0
    
    # Title match (highest weight)
    if keyword_lower in title_lower:
        score += 0.4
    
    # Content frequency
    content_matches = content_lower.count(keyword_lower)
    if content_matches > 0:
        score += min(0.3, content_matches * 0.1)
    
    # Keyword similarity (basic word matching)
    keyword_words = set(keyword_lower.split())
    title_words = set(title_lower.split())
    content_words = set(content_lower.split())
    
    title_overlap = len(keyword_words.intersection(title_words)) / len(keyword_words)
    content_overlap = len(keyword_words.intersection(content_words)) / len(keyword_words)
    
    score += title_overlap * 0.2
    score += content_overlap * 0.1
    
    return min(1.0, score)

def find_link_positions(content: str, keyword: str) -> List[int]:
    """Find positions in content where keyword appears"""
    positions = []
    keyword_lower = keyword.lower()
    content_lower = content.lower()
    
    start = 0
    while True:
        pos = content_lower.find(keyword_lower, start)
        if pos == -1:
            break
        positions.append(pos)
        start = pos + 1
    
    return positions

@router.post("/api/seo/internal-links/suggestions")
async def get_internal_link_suggestions(
    request: ContentAnalysisRequest,
    max_suggestions: int = Query(10, ge=1, le=20),
    min_relevance: float = Query(0.3, ge=0.1, le=1.0),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[InternalLinkSuggestion]:
    """Generate internal link suggestions for given content"""
    
    try:
        # Extract keywords from content
        keywords = extract_keywords(request.content + " " + request.title)
        
        if not keywords:
            return []
        
        suggestions = []
        existing_targets = set(request.existing_links or [])
        
        # Get all tools and blogs for matching
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        blogs = db.query(Blog).filter(Blog.status == 'published').all()
        categories = db.query(Category).all()
        
        # Find matching tools
        for tool in tools:
            target_url = f"/tools/{tool.slug}"
            if target_url in existing_targets:
                continue
                
            tool_content = f"{tool.name} {tool.description or ''} {tool.short_description or ''}"
            
            for keyword in keywords:
                relevance = calculate_relevance_score(keyword, tool_content, tool.name)
                
                if relevance >= min_relevance:
                    positions = find_link_positions(request.content, keyword)
                    
                    for position in positions[:2]:  # Limit positions per keyword
                        suggestions.append(InternalLinkSuggestion(
                            target_url=target_url,
                            target_title=tool.name,
                            target_type="tool",
                            anchor_text=keyword,
                            context=request.content[max(0, position-50):position+len(keyword)+50],
                            relevance_score=relevance,
                            position=position
                        ))
        
        # Find matching blogs
        for blog in blogs:
            target_url = f"/blogs/{blog.slug}"
            if target_url in existing_targets:
                continue
                
            blog_content = f"{blog.title} {blog.content or ''} {blog.excerpt or ''}"
            
            for keyword in keywords:
                relevance = calculate_relevance_score(keyword, blog_content, blog.title)
                
                if relevance >= min_relevance:
                    positions = find_link_positions(request.content, keyword)
                    
                    for position in positions[:1]:  # Limit positions per keyword for blogs
                        suggestions.append(InternalLinkSuggestion(
                            target_url=target_url,
                            target_title=blog.title,
                            target_type="blog",
                            anchor_text=keyword,
                            context=request.content[max(0, position-50):position+len(keyword)+50],
                            relevance_score=relevance,
                            position=position
                        ))
        
        # Find matching categories
        for category in categories:
            target_url = f"/tools?category={category.slug}"
            if target_url in existing_targets:
                continue
                
            category_content = f"{category.name} {category.description or ''}"
            
            for keyword in keywords:
                relevance = calculate_relevance_score(keyword, category_content, category.name)
                
                if relevance >= min_relevance:
                    positions = find_link_positions(request.content, keyword)
                    
                    for position in positions[:1]:  # Limit positions per keyword for categories
                        suggestions.append(InternalLinkSuggestion(
                            target_url=target_url,
                            target_title=f"{category.name} Tools",
                            target_type="category",
                            anchor_text=keyword,
                            context=request.content[max(0, position-50):position+len(keyword)+50],
                            relevance_score=relevance,
                            position=position
                        ))
        
        # Sort by relevance score and remove duplicates
        suggestions = sorted(suggestions, key=lambda x: x.relevance_score, reverse=True)
        
        # Remove duplicate positions and limit results
        seen_positions = set()
        unique_suggestions = []
        
        for suggestion in suggestions:
            position_key = (suggestion.position, suggestion.target_url)
            if position_key not in seen_positions and len(unique_suggestions) < max_suggestions:
                seen_positions.add(position_key)
                unique_suggestions.append(suggestion)
        
        return unique_suggestions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating internal link suggestions: {str(e)}")

@router.get("/api/seo/score/{content_type}/{content_id}")
async def get_seo_score(
    content_type: str,  # 'tool' or 'blog'
    content_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> SEOScoreBreakdown:
    """Get detailed SEO score breakdown for specific content"""
    
    try:
        if content_type == "tool":
            content = db.query(Tool).filter(Tool.id == content_id).first()
            if not content:
                raise HTTPException(status_code=404, detail="Tool not found")
                
        elif content_type == "blog":
            content = db.query(Blog).filter(Blog.id == content_id).first()
            if not content:
                raise HTTPException(status_code=404, detail="Blog not found")
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")
        
        # Calculate individual scores
        title_score = calculate_title_score(content)
        description_score = calculate_description_score(content)
        keywords_score = calculate_keywords_score(content)
        content_score = calculate_content_score(content, content_type)
        internal_links_score = calculate_internal_links_score(content, content_type)
        
        # Calculate overall score (weighted average)
        overall_score = (
            title_score * 0.25 +
            description_score * 0.25 +
            keywords_score * 0.15 +
            content_score * 0.20 +
            internal_links_score * 0.15
        )
        
        # Generate recommendations
        recommendations = generate_seo_recommendations(
            content, content_type, title_score, description_score, 
            keywords_score, content_score, internal_links_score
        )
        
        return SEOScoreBreakdown(
            overall_score=round(overall_score, 2),
            title_score=round(title_score, 2),
            description_score=round(description_score, 2),
            keywords_score=round(keywords_score, 2),
            content_score=round(content_score, 2),
            internal_links_score=round(internal_links_score, 2),
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating SEO score: {str(e)}")

def calculate_title_score(content) -> float:
    """Calculate SEO score for title"""
    if not hasattr(content, 'seo_title') or not content.seo_title:
        return 0.0
    
    title = content.seo_title
    score = 0.0
    
    # Length check (40-60 characters is optimal)
    if 40 <= len(title) <= 60:
        score += 40.0
    elif 30 <= len(title) < 40 or 60 < len(title) <= 70:
        score += 30.0
    elif len(title) > 0:
        score += 20.0
    
    # Contains target keywords
    if hasattr(content, 'seo_keywords') and content.seo_keywords:
        keywords = [k.strip().lower() for k in content.seo_keywords.split(',')]
        title_lower = title.lower()
        keyword_matches = sum(1 for keyword in keywords if keyword in title_lower)
        score += min(30.0, keyword_matches * 10.0)
    
    # Brand name included
    if 'marketmind' in title.lower():
        score += 10.0
    
    # No keyword stuffing (reasonable word count)
    word_count = len(title.split())
    if 5 <= word_count <= 12:
        score += 20.0
    elif word_count > 0:
        score += 10.0
    
    return min(100.0, score)

def calculate_description_score(content) -> float:
    """Calculate SEO score for meta description"""
    if not hasattr(content, 'seo_description') or not content.seo_description:
        return 0.0
    
    description = content.seo_description
    score = 0.0
    
    # Length check (120-160 characters is optimal)
    if 120 <= len(description) <= 160:
        score += 40.0
    elif 100 <= len(description) < 120 or 160 < len(description) <= 180:
        score += 30.0
    elif len(description) > 0:
        score += 20.0
    
    # Contains target keywords
    if hasattr(content, 'seo_keywords') and content.seo_keywords:
        keywords = [k.strip().lower() for k in content.seo_keywords.split(',')]
        description_lower = description.lower()
        keyword_matches = sum(1 for keyword in keywords if keyword in description_lower)
        score += min(30.0, keyword_matches * 10.0)
    
    # Call to action or compelling language
    cta_words = ['discover', 'learn', 'find', 'explore', 'get', 'try', 'read', 'compare']
    if any(word in description.lower() for word in cta_words):
        score += 15.0
    
    # Unique and descriptive
    if len(set(description.lower().split())) / len(description.split()) > 0.8:
        score += 15.0
    
    return min(100.0, score)

def calculate_keywords_score(content) -> float:
    """Calculate SEO score for keywords"""
    if not hasattr(content, 'seo_keywords') or not content.seo_keywords:
        return 0.0
    
    keywords = [k.strip() for k in content.seo_keywords.split(',') if k.strip()]
    score = 0.0
    
    # Number of keywords (3-7 is optimal)
    if 3 <= len(keywords) <= 7:
        score += 30.0
    elif 1 <= len(keywords) < 3 or 7 < len(keywords) <= 10:
        score += 20.0
    elif len(keywords) > 0:
        score += 10.0
    
    # Keyword length and quality
    good_keywords = 0
    for keyword in keywords:
        if 2 <= len(keyword.split()) <= 4 and len(keyword) >= 5:
            good_keywords += 1
    
    if good_keywords > 0:
        score += min(40.0, (good_keywords / len(keywords)) * 40.0)
    
    # No keyword stuffing
    if len(set(keywords)) == len(keywords):  # All unique
        score += 20.0
    
    # Relevance to content name/title
    content_name = getattr(content, 'name', '') or getattr(content, 'title', '')
    if content_name:
        content_words = set(content_name.lower().split())
        keyword_words = set(' '.join(keywords).lower().split())
        overlap = len(content_words.intersection(keyword_words))
        if overlap > 0:
            score += min(10.0, overlap * 3.0)
    
    return min(100.0, score)

def calculate_content_score(content, content_type) -> float:
    """Calculate SEO score for main content"""
    score = 0.0
    
    if content_type == "tool":
        # Check description length
        description = getattr(content, 'description', '') or ''
        if len(description) >= 150:
            score += 30.0
        elif len(description) >= 50:
            score += 20.0
        elif len(description) > 0:
            score += 10.0
        
        # Check features
        features = getattr(content, 'features', []) or []
        if len(features) >= 3:
            score += 25.0
        elif len(features) >= 1:
            score += 15.0
        
        # Check pros/cons
        pros = getattr(content, 'pros', []) or []
        cons = getattr(content, 'cons', []) or []
        if len(pros) >= 2 and len(cons) >= 1:
            score += 25.0
        elif len(pros) >= 1 or len(cons) >= 1:
            score += 15.0
        
        # Check URL
        if getattr(content, 'url', ''):
            score += 10.0
        
        # Check images
        if getattr(content, 'logo_url', '') or getattr(content, 'screenshot_url', ''):
            score += 10.0
    
    elif content_type == "blog":
        # Check content length
        blog_content = getattr(content, 'content', '') or ''
        word_count = len(blog_content.split())
        if word_count >= 800:
            score += 40.0
        elif word_count >= 400:
            score += 30.0
        elif word_count >= 200:
            score += 20.0
        elif word_count > 0:
            score += 10.0
        
        # Check headings (basic HTML structure)
        if '<h1>' in blog_content or '<h2>' in blog_content:
            score += 20.0
        
        # Check excerpt
        if getattr(content, 'excerpt', ''):
            score += 15.0
        
        # Check featured image
        if getattr(content, 'featured_image', ''):
            score += 15.0
        
        # Check reading time
        if getattr(content, 'reading_time', 0) > 0:
            score += 10.0
    
    return min(100.0, score)

def calculate_internal_links_score(content, content_type) -> float:
    """Calculate SEO score for internal linking"""
    score = 0.0
    
    if content_type == "blog":
        blog_content = getattr(content, 'content', '') or ''
        
        # Count internal links
        internal_links = len(re.findall(r'href="(?:/|#)', blog_content))
        if internal_links >= 3:
            score += 50.0
        elif internal_links >= 1:
            score += 30.0
        
        # Check for tool/blog cross-references
        if '/tools/' in blog_content:
            score += 25.0
        if '/blogs/' in blog_content:
            score += 25.0
    
    elif content_type == "tool":
        # Tools get some points for being linkable
        score += 50.0
        
        # Check if tool is in active categories
        categories = getattr(content, 'categories', []) or []
        if len(categories) > 0:
            score += 50.0
    
    return min(100.0, score)

def generate_seo_recommendations(content, content_type, title_score, description_score, 
                                keywords_score, content_score, internal_links_score) -> List[str]:
    """Generate SEO improvement recommendations"""
    recommendations = []
    
    # Title recommendations
    if title_score < 70:
        if not hasattr(content, 'seo_title') or not content.seo_title:
            recommendations.append("Add an SEO-optimized title (40-60 characters)")
        elif len(content.seo_title) < 40:
            recommendations.append("Lengthen your SEO title to 40-60 characters")
        elif len(content.seo_title) > 60:
            recommendations.append("Shorten your SEO title to under 60 characters")
        else:
            recommendations.append("Include target keywords in your title")
    
    # Description recommendations
    if description_score < 70:
        if not hasattr(content, 'seo_description') or not content.seo_description:
            recommendations.append("Add a compelling meta description (120-160 characters)")
        elif len(content.seo_description) < 120:
            recommendations.append("Expand your meta description to 120-160 characters")
        elif len(content.seo_description) > 160:
            recommendations.append("Shorten your meta description to under 160 characters")
        else:
            recommendations.append("Include keywords and call-to-action in description")
    
    # Keywords recommendations
    if keywords_score < 70:
        if not hasattr(content, 'seo_keywords') or not content.seo_keywords:
            recommendations.append("Add relevant SEO keywords (3-7 keywords recommended)")
        else:
            keywords = [k.strip() for k in content.seo_keywords.split(',') if k.strip()]
            if len(keywords) < 3:
                recommendations.append("Add more keywords (aim for 3-7 keywords)")
            elif len(keywords) > 7:
                recommendations.append("Reduce keywords to 3-7 most relevant ones")
            else:
                recommendations.append("Ensure keywords are relevant and specific")
    
    # Content recommendations
    if content_score < 70:
        if content_type == "tool":
            recommendations.append("Add more detailed description, features, pros and cons")
        elif content_type == "blog":
            recommendations.append("Increase content length to at least 400 words with proper headings")
    
    # Internal links recommendations
    if internal_links_score < 70:
        if content_type == "blog":
            recommendations.append("Add internal links to related tools and blog posts")
        elif content_type == "tool":
            recommendations.append("Ensure tool is properly categorized for better discoverability")
    
    # General recommendations
    overall_score = (title_score + description_score + keywords_score + content_score + internal_links_score) / 5
    if overall_score < 60:
        recommendations.append("Consider using SEO template generation for automated optimization")
    
    return recommendations[:5]  # Limit to 5 most important recommendations

@router.get("/api/seo/analyze-page")
async def analyze_page_seo(
    url: str = Query(..., description="Page URL to analyze"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a page's SEO performance (basic analysis)"""
    
    try:
        # Extract page type and identifier from URL
        if '/tools/' in url:
            slug = url.split('/tools/')[-1].split('?')[0].strip('/')
            tool = db.query(Tool).filter(Tool.slug == slug).first()
            if tool:
                return await get_seo_score("tool", tool.id, current_user, db)
        
        elif '/blogs/' in url:
            slug = url.split('/blogs/')[-1].split('?')[0].strip('/')
            blog = db.query(Blog).filter(Blog.slug == slug).first()
            if blog:
                return await get_seo_score("blog", blog.id, current_user, db)
        
        # For other pages, return basic analysis
        return {
            "message": "Page analysis not available for this URL type",
            "url": url,
            "supported_types": ["/tools/[slug]", "/blogs/[slug]"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing page: {str(e)}")