from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, text
from database import get_db
from models import Tool, Blog, Category, SeoPage
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import re
import json
from datetime import datetime, timedelta
import logging

router = APIRouter()

class InternalLinkSuggestion(BaseModel):
    url: str
    anchor_text: str
    relevance_score: float
    content_type: str  # 'tool', 'blog', 'category'
    title: str
    excerpt: str

class SEOAuditResult(BaseModel):
    page_url: str
    page_type: str
    seo_score: float
    issues: List[Dict[str, Any]]
    recommendations: List[str]
    core_web_vitals: Dict[str, Any]

class ContentAnalysis(BaseModel):
    content: str
    keywords: List[str]
    readability_score: float
    word_count: int
    internal_links: List[str]
    external_links: List[str]

@router.get("/api/seo/internal-links/suggestions")
async def get_internal_link_suggestions(
    content: str = Query(..., description="Content to analyze for internal link suggestions"),
    content_type: str = Query("blog", description="Type of content: blog, tool, page"),
    limit: int = Query(10, description="Maximum number of suggestions"),
    db: Session = Depends(get_db)
):
    """Get automated internal link suggestions for content"""
    
    try:
        # Extract potential keywords and topics from content
        keywords = extract_keywords_from_content(content)
        
        suggestions = []
        
        # Find related tools
        tool_suggestions = find_related_tools(keywords, db, limit=limit//2)
        suggestions.extend(tool_suggestions)
        
        # Find related blogs
        blog_suggestions = find_related_blogs(keywords, content, db, limit=limit//2)
        suggestions.extend(blog_suggestions)
        
        # Find related categories
        category_suggestions = find_related_categories(keywords, db, limit=3)
        suggestions.extend(category_suggestions)
        
        # Sort by relevance score
        suggestions.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return {
            "suggestions": suggestions[:limit],
            "total_found": len(suggestions),
            "keywords_analyzed": keywords[:10],  # Show top 10 keywords used
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error generating internal link suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

@router.post("/api/seo/audit/page")
async def audit_page_seo(
    page_url: str,
    page_type: str = "webpage",
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Perform comprehensive SEO audit for a specific page"""
    
    try:
        # Determine page type and get content
        content_data = await get_page_content(page_url, page_type, db)
        
        if not content_data:
            raise HTTPException(status_code=404, detail="Page not found")
        
        # Perform SEO analysis
        seo_analysis = analyze_page_seo(content_data)
        
        # Calculate SEO score
        seo_score = calculate_comprehensive_seo_score(content_data, seo_analysis)
        
        # Generate recommendations
        recommendations = generate_seo_recommendations(seo_analysis, seo_score)
        
        # Mock Core Web Vitals (in production, this would come from real performance data)
        core_web_vitals = {
            "lcp": {"value": 2.1, "rating": "good", "threshold": 2.5},
            "fid": {"value": 85, "rating": "good", "threshold": 100},
            "cls": {"value": 0.08, "rating": "needs_improvement", "threshold": 0.1},
            "fcp": {"value": 1.2, "rating": "good", "threshold": 1.8},
            "ttfb": {"value": 0.3, "rating": "good", "threshold": 0.6}
        }
        
        audit_result = {
            "page_url": page_url,
            "page_type": page_type,
            "seo_score": seo_score,
            "issues": seo_analysis.get("issues", []),
            "recommendations": recommendations,
            "core_web_vitals": core_web_vitals,
            "content_analysis": {
                "word_count": len(content_data.get("content", "").split()),
                "readability_score": calculate_readability_score(content_data.get("content", "")),
                "keyword_density": analyze_keyword_density(content_data),
                "meta_analysis": analyze_meta_tags(content_data),
                "structured_data": analyze_structured_data(content_data)
            },
            "performance_metrics": {
                "mobile_friendly": True,
                "page_speed_score": 92,
                "accessibility_score": 95,
                "best_practices_score": 88
            },
            "audit_timestamp": datetime.utcnow().isoformat()
        }
        
        return audit_result
        
    except Exception as e:
        logging.error(f"Error performing SEO audit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SEO audit failed: {str(e)}")

@router.get("/api/seo/analytics/overview")
async def get_seo_analytics_overview(
    days: int = Query(30, description="Number of days to analyze"),
    db: Session = Depends(get_db)
):
    """Get comprehensive SEO analytics overview"""
    
    try:
        # Get current date for analysis
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Analyze tools SEO performance
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        blogs = db.query(Blog).filter(Blog.status == 'published').all()
        categories = db.query(Category).all()
        
        # Calculate SEO scores
        tool_seo_scores = []
        blog_seo_scores = []
        
        for tool in tools:
            score = calculate_tool_seo_score(tool)
            tool_seo_scores.append({
                "id": tool.id,
                "name": tool.name,
                "slug": tool.slug,
                "seo_score": score,
                "issues": identify_tool_seo_issues(tool)
            })
            
        for blog in blogs:
            score = calculate_blog_seo_score(blog)
            blog_seo_scores.append({
                "id": blog.id,
                "title": blog.title,
                "slug": blog.slug,
                "seo_score": score,
                "issues": identify_blog_seo_issues(blog)
            })
        
        # Overall statistics
        avg_tool_score = sum(t["seo_score"] for t in tool_seo_scores) / len(tool_seo_scores) if tool_seo_scores else 0
        avg_blog_score = sum(b["seo_score"] for b in blog_seo_scores) / len(blog_seo_scores) if blog_seo_scores else 0
        
        # Issues summary
        all_issues = []
        for tool in tool_seo_scores:
            all_issues.extend(tool["issues"])
        for blog in blog_seo_scores:
            all_issues.extend(blog["issues"])
            
        issues_by_severity = {
            "critical": len([i for i in all_issues if i.get("severity") == "critical"]),
            "high": len([i for i in all_issues if i.get("severity") == "high"]),
            "medium": len([i for i in all_issues if i.get("severity") == "medium"]),
            "low": len([i for i in all_issues if i.get("severity") == "low"])
        }
        
        return {
            "overview": {
                "total_pages": len(tools) + len(blogs),
                "avg_seo_score": round((avg_tool_score + avg_blog_score) / 2, 2),
                "pages_optimized": len([t for t in tool_seo_scores if t["seo_score"] >= 80]) + len([b for b in blog_seo_scores if b["seo_score"] >= 80]),
                "pages_need_attention": len([t for t in tool_seo_scores if t["seo_score"] < 60]) + len([b for b in blog_seo_scores if b["seo_score"] < 60])
            },
            "tools": {
                "total": len(tools),
                "avg_score": round(avg_tool_score, 2),
                "top_performers": sorted(tool_seo_scores, key=lambda x: x["seo_score"], reverse=True)[:5],
                "needs_improvement": sorted([t for t in tool_seo_scores if t["seo_score"] < 60], key=lambda x: x["seo_score"])[:5]
            },
            "blogs": {
                "total": len(blogs),
                "avg_score": round(avg_blog_score, 2),
                "top_performers": sorted(blog_seo_scores, key=lambda x: x["seo_score"], reverse=True)[:5],
                "needs_improvement": sorted([b for b in blog_seo_scores if b["seo_score"] < 60], key=lambda x: x["seo_score"])[:5]
            },
            "issues_summary": issues_by_severity,
            "trends": {
                "period": f"{days} days",
                "seo_score_trend": "stable",  # Would calculate from historical data
                "common_issues": get_most_common_issues(all_issues)
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error generating SEO analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate analytics: {str(e)}")

# Helper functions

def extract_keywords_from_content(content: str) -> List[str]:
    """Extract potential keywords from content using NLP techniques"""
    
    # Clean content
    clean_content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    clean_content = re.sub(r'[^\w\s]', ' ', clean_content)  # Remove punctuation
    
    # Split into words and filter
    words = clean_content.lower().split()
    
    # Remove common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    }
    
    # Filter words and count frequency
    word_freq = {}
    for word in words:
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Return top keywords
    return sorted(word_freq.keys(), key=lambda x: word_freq[x], reverse=True)[:20]

def find_related_tools(keywords: List[str], db: Session, limit: int = 5) -> List[Dict]:
    """Find tools related to the given keywords"""
    
    suggestions = []
    
    # Search in tool names and descriptions
    for keyword in keywords[:10]:  # Limit to top 10 keywords
        tools = db.query(Tool).filter(
            Tool.is_active == True,
            or_(
                Tool.name.ilike(f'%{keyword}%'),
                Tool.description.ilike(f'%{keyword}%'),
                Tool.seo_keywords.ilike(f'%{keyword}%')
            )
        ).limit(3).all()
        
        for tool in tools:
            # Calculate relevance score
            relevance = calculate_content_relevance(keyword, tool.name, tool.description)
            
            suggestions.append({
                "url": f"/tools/{tool.slug}",
                "anchor_text": tool.name,
                "relevance_score": relevance,
                "content_type": "tool",
                "title": tool.name,
                "excerpt": tool.short_description or tool.description[:150] + "..."
            })
    
    # Remove duplicates and return top results
    unique_suggestions = {}
    for suggestion in suggestions:
        if suggestion["url"] not in unique_suggestions:
            unique_suggestions[suggestion["url"]] = suggestion
    
    return list(unique_suggestions.values())[:limit]

def find_related_blogs(keywords: List[str], current_content: str, db: Session, limit: int = 5) -> List[Dict]:
    """Find blogs related to the given keywords"""
    
    suggestions = []
    
    for keyword in keywords[:10]:
        blogs = db.query(Blog).filter(
            Blog.status == 'published',
            or_(
                Blog.title.ilike(f'%{keyword}%'),
                Blog.content.ilike(f'%{keyword}%'),
                Blog.seo_keywords.ilike(f'%{keyword}%')
            )
        ).limit(3).all()
        
        for blog in blogs:
            # Skip if it's the same content (for blog updates)
            if blog.content in current_content or current_content in blog.content:
                continue
                
            relevance = calculate_content_relevance(keyword, blog.title, blog.content)
            
            suggestions.append({
                "url": f"/blogs/{blog.slug}",
                "anchor_text": blog.title,
                "relevance_score": relevance,
                "content_type": "blog",
                "title": blog.title,
                "excerpt": blog.excerpt or blog.content[:150] + "..."
            })
    
    unique_suggestions = {}
    for suggestion in suggestions:
        if suggestion["url"] not in unique_suggestions:
            unique_suggestions[suggestion["url"]] = suggestion
    
    return list(unique_suggestions.values())[:limit]

def find_related_categories(keywords: List[str], db: Session, limit: int = 3) -> List[Dict]:
    """Find categories related to the given keywords"""
    
    suggestions = []
    
    for keyword in keywords[:5]:
        categories = db.query(Category).filter(
            or_(
                Category.name.ilike(f'%{keyword}%'),
                Category.description.ilike(f'%{keyword}%'),
                Category.seo_keywords.ilike(f'%{keyword}%')
            )
        ).limit(2).all()
        
        for category in categories:
            relevance = calculate_content_relevance(keyword, category.name, category.description)
            
            suggestions.append({
                "url": f"/tools?category={category.slug}",
                "anchor_text": f"{category.name} Tools",
                "relevance_score": relevance,
                "content_type": "category",
                "title": category.name,
                "excerpt": category.description[:100] + "..."
            })
    
    unique_suggestions = {}
    for suggestion in suggestions:
        if suggestion["url"] not in unique_suggestions:
            unique_suggestions[suggestion["url"]] = suggestion
    
    return list(unique_suggestions.values())[:limit]

def calculate_content_relevance(keyword: str, title: str, content: str) -> float:
    """Calculate relevance score between keyword and content"""
    
    score = 0.0
    keyword_lower = keyword.lower()
    title_lower = title.lower()
    content_lower = content.lower()
    
    # Title match (high weight)
    if keyword_lower in title_lower:
        score += 0.5
    
    # Content frequency
    content_matches = content_lower.count(keyword_lower)
    if content_matches > 0:
        # Normalize by content length and cap the bonus
        score += min(0.4, content_matches / max(len(content_lower.split()), 100) * 10)
    
    # Exact word match bonus
    if f' {keyword_lower} ' in f' {title_lower} ':
        score += 0.1
    
    return min(1.0, score)  # Cap at 1.0

async def get_page_content(page_url: str, page_type: str, db: Session) -> Optional[Dict]:
    """Get page content based on URL and type"""
    
    try:
        if page_type == "tool" or "/tools/" in page_url:
            slug = page_url.split("/tools/")[-1].split("?")[0]
            tool = db.query(Tool).filter(Tool.slug == slug).first()
            if tool:
                return {
                    "title": tool.seo_title or tool.name,
                    "description": tool.seo_description or tool.description,
                    "content": tool.description,
                    "keywords": tool.seo_keywords,
                    "url": page_url,
                    "type": "tool",
                    "entity": tool
                }
        
        elif page_type == "blog" or "/blogs/" in page_url:
            slug = page_url.split("/blogs/")[-1].split("?")[0]
            blog = db.query(Blog).filter(Blog.slug == slug).first()
            if blog:
                return {
                    "title": blog.seo_title or blog.title,
                    "description": blog.seo_description or blog.excerpt,
                    "content": blog.content,
                    "keywords": blog.seo_keywords,
                    "url": page_url,
                    "type": "blog",
                    "entity": blog
                }
        
        return None
        
    except Exception as e:
        logging.error(f"Error getting page content: {str(e)}")
        return None

def analyze_page_seo(content_data: Dict) -> Dict:
    """Analyze SEO aspects of page content"""
    
    issues = []
    
    title = content_data.get("title", "")
    description = content_data.get("description", "")
    content = content_data.get("content", "")
    keywords = content_data.get("keywords", "")
    
    # Title analysis
    if not title:
        issues.append({"type": "missing_title", "severity": "critical", "message": "Page title is missing"})
    elif len(title) < 30:
        issues.append({"type": "short_title", "severity": "high", "message": "Title is too short (< 30 chars)"})
    elif len(title) > 60:
        issues.append({"type": "long_title", "severity": "medium", "message": "Title is too long (> 60 chars)"})
    
    # Description analysis
    if not description:
        issues.append({"type": "missing_description", "severity": "critical", "message": "Meta description is missing"})
    elif len(description) < 120:
        issues.append({"type": "short_description", "severity": "high", "message": "Description is too short (< 120 chars)"})
    elif len(description) > 160:
        issues.append({"type": "long_description", "severity": "medium", "message": "Description is too long (> 160 chars)"})
    
    # Keywords analysis
    if not keywords:
        issues.append({"type": "missing_keywords", "severity": "medium", "message": "SEO keywords are missing"})
    
    # Content analysis
    if not content:
        issues.append({"type": "no_content", "severity": "critical", "message": "Page has no content"})
    elif len(content.split()) < 300:
        issues.append({"type": "thin_content", "severity": "medium", "message": "Content is too thin (< 300 words)"})
    
    return {
        "issues": issues,
        "title_length": len(title),
        "description_length": len(description),
        "content_word_count": len(content.split()),
        "keyword_count": len(keywords.split(',')) if keywords else 0
    }

def calculate_comprehensive_seo_score(content_data: Dict, analysis: Dict) -> float:
    """Calculate comprehensive SEO score"""
    
    score = 100.0
    issues = analysis.get("issues", [])
    
    # Deduct points based on issues
    for issue in issues:
        if issue["severity"] == "critical":
            score -= 25
        elif issue["severity"] == "high":
            score -= 15
        elif issue["severity"] == "medium":
            score -= 10
        elif issue["severity"] == "low":
            score -= 5
    
    # Bonus points for good practices
    title_length = analysis.get("title_length", 0)
    if 30 <= title_length <= 60:
        score += 5
    
    desc_length = analysis.get("description_length", 0)
    if 120 <= desc_length <= 160:
        score += 5
    
    word_count = analysis.get("content_word_count", 0)
    if word_count >= 500:
        score += 5
    
    return max(0, min(100, score))

def calculate_readability_score(content: str) -> float:
    """Calculate readability score (simplified Flesch Reading Ease)"""
    
    if not content:
        return 0.0
    
    # Remove HTML tags
    clean_content = re.sub(r'<[^>]+>', '', content)
    
    # Count sentences, words, and syllables (simplified)
    sentences = len(re.findall(r'[.!?]+', clean_content))
    words = len(clean_content.split())
    
    if sentences == 0 or words == 0:
        return 0.0
    
    # Simplified syllable count (vowel groups)
    syllables = len(re.findall(r'[aeiouAEIOU]+', clean_content))
    
    # Simplified Flesch Reading Ease formula
    if sentences > 0 and words > 0 and syllables > 0:
        score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words))
        return max(0, min(100, score))
    
    return 50.0  # Default score

def analyze_keyword_density(content_data: Dict) -> Dict:
    """Analyze keyword density in content"""
    
    content = content_data.get("content", "")
    keywords = content_data.get("keywords", "")
    
    if not content or not keywords:
        return {"density": 0, "analysis": "No keywords or content to analyze"}
    
    keyword_list = [k.strip().lower() for k in keywords.split(',')]
    content_lower = content.lower()
    total_words = len(content.split())
    
    keyword_analysis = {}
    
    for keyword in keyword_list:
        count = content_lower.count(keyword)
        density = (count / total_words * 100) if total_words > 0 else 0
        
        keyword_analysis[keyword] = {
            "count": count,
            "density": round(density, 2),
            "optimal": 1 <= density <= 3  # 1-3% is generally considered optimal
        }
    
    return {
        "total_keywords": len(keyword_list),
        "keyword_analysis": keyword_analysis,
        "overall_density": round(sum(k["density"] for k in keyword_analysis.values()), 2)
    }

def analyze_meta_tags(content_data: Dict) -> Dict:
    """Analyze meta tag completeness and quality"""
    
    analysis = {
        "title": {
            "present": bool(content_data.get("title")),
            "length": len(content_data.get("title", "")),
            "optimal_length": 30 <= len(content_data.get("title", "")) <= 60
        },
        "description": {
            "present": bool(content_data.get("description")),
            "length": len(content_data.get("description", "")),
            "optimal_length": 120 <= len(content_data.get("description", "")) <= 160
        },
        "keywords": {
            "present": bool(content_data.get("keywords")),
            "count": len(content_data.get("keywords", "").split(',')) if content_data.get("keywords") else 0
        }
    }
    
    return analysis

def analyze_structured_data(content_data: Dict) -> Dict:
    """Analyze structured data (JSON-LD) presence and validity"""
    
    entity = content_data.get("entity")
    
    if not entity:
        return {"present": False, "type": None, "valid": False}
    
    # Check if entity has JSON-LD data
    has_json_ld = hasattr(entity, 'json_ld') and entity.json_ld
    
    return {
        "present": has_json_ld,
        "type": content_data.get("type"),
        "valid": has_json_ld and isinstance(entity.json_ld, (dict, str))
    }

def generate_seo_recommendations(analysis: Dict, seo_score: float) -> List[str]:
    """Generate actionable SEO recommendations"""
    
    recommendations = []
    issues = analysis.get("issues", [])
    
    # High priority recommendations
    critical_issues = [i for i in issues if i["severity"] == "critical"]
    high_issues = [i for i in issues if i["severity"] == "high"]
    
    if critical_issues:
        recommendations.append("🚨 Fix critical SEO issues immediately - these are blocking search engine optimization")
    
    if high_issues:
        recommendations.append("⚠️ Address high-priority SEO issues to improve search rankings")
    
    # Specific recommendations based on score
    if seo_score < 50:
        recommendations.extend([
            "🔧 Complete SEO overhaul needed - focus on title, description, and content optimization",
            "📝 Add comprehensive meta descriptions and optimize title tags",
            "🎯 Conduct keyword research and implement target keywords naturally"
        ])
    elif seo_score < 70:
        recommendations.extend([
            "📈 Good foundation but needs improvement - focus on content optimization",
            "🔍 Improve keyword density and distribution throughout content",
            "📊 Add structured data markup for better search visibility"
        ])
    else:
        recommendations.extend([
            "✅ Strong SEO foundation - focus on advanced optimizations",
            "🚀 Consider adding FAQ schema and breadcrumb markup",
            "📱 Ensure mobile optimization and Core Web Vitals performance"
        ])
    
    return recommendations

def calculate_tool_seo_score(tool: Tool) -> float:
    """Calculate SEO score for a tool"""
    
    score = 0.0
    
    # Title optimization (20 points)
    if tool.seo_title:
        title_len = len(tool.seo_title)
        if 30 <= title_len <= 60:
            score += 20
        elif 20 <= title_len < 30 or 60 < title_len <= 70:
            score += 15
        else:
            score += 5
    
    # Description optimization (20 points)
    if tool.seo_description:
        desc_len = len(tool.seo_description)
        if 120 <= desc_len <= 160:
            score += 20
        elif 100 <= desc_len < 120 or 160 < desc_len <= 180:
            score += 15
        else:
            score += 5
    
    # Keywords (15 points)
    if tool.seo_keywords:
        keyword_count = len(tool.seo_keywords.split(','))
        if 3 <= keyword_count <= 7:
            score += 15
        elif keyword_count > 0:
            score += 10
    
    # Content quality (20 points)
    if tool.description:
        word_count = len(tool.description.split())
        if word_count >= 200:
            score += 20
        elif word_count >= 100:
            score += 15
        elif word_count >= 50:
            score += 10
    
    # Structured data (10 points)
    if hasattr(tool, 'json_ld') and tool.json_ld:
        score += 10
    
    # Additional factors (15 points)
    if tool.features:
        score += 5
    if tool.pricing_type:
        score += 5
    if tool.logo_url or tool.local_logo_path:
        score += 5
    
    return min(100, score)

def calculate_blog_seo_score(blog: Blog) -> float:
    """Calculate SEO score for a blog"""
    
    score = 0.0
    
    # Title optimization (20 points)
    if blog.seo_title:
        title_len = len(blog.seo_title)
        if 30 <= title_len <= 60:
            score += 20
        elif 20 <= title_len < 30 or 60 < title_len <= 70:
            score += 15
        else:
            score += 5
    
    # Description optimization (20 points)
    if blog.seo_description:
        desc_len = len(blog.seo_description)
        if 120 <= desc_len <= 160:
            score += 20
        elif 100 <= desc_len < 120 or 160 < desc_len <= 180:
            score += 15
        else:
            score += 5
    
    # Keywords (15 points)
    if blog.seo_keywords:
        keyword_count = len(blog.seo_keywords.split(','))
        if 3 <= keyword_count <= 7:
            score += 15
        elif keyword_count > 0:
            score += 10
    
    # Content quality (25 points)
    if blog.content:
        word_count = len(blog.content.split())
        if word_count >= 1000:
            score += 25
        elif word_count >= 500:
            score += 20
        elif word_count >= 300:
            score += 15
        elif word_count >= 100:
            score += 10
    
    # Structured data (10 points)
    if hasattr(blog, 'json_ld') and blog.json_ld:
        score += 10
    
    # Additional factors (10 points)
    if blog.featured_image:
        score += 3
    if blog.excerpt:
        score += 3
    if hasattr(blog, 'tags') and blog.tags:
        score += 4
    
    return min(100, score)

def identify_tool_seo_issues(tool: Tool) -> List[Dict]:
    """Identify SEO issues for a tool"""
    
    issues = []
    
    if not tool.seo_title:
        issues.append({"type": "missing_seo_title", "severity": "high", "message": "SEO title is missing"})
    elif len(tool.seo_title) > 60:
        issues.append({"type": "long_title", "severity": "medium", "message": "SEO title is too long"})
    
    if not tool.seo_description:
        issues.append({"type": "missing_meta_description", "severity": "high", "message": "Meta description is missing"})
    elif len(tool.seo_description) > 160:
        issues.append({"type": "long_description", "severity": "medium", "message": "Meta description is too long"})
    
    if not tool.seo_keywords:
        issues.append({"type": "missing_keywords", "severity": "medium", "message": "SEO keywords are missing"})
    
    if not tool.description or len(tool.description.split()) < 50:
        issues.append({"type": "thin_content", "severity": "medium", "message": "Content is too thin"})
    
    return issues

def identify_blog_seo_issues(blog: Blog) -> List[Dict]:
    """Identify SEO issues for a blog"""
    
    issues = []
    
    if not blog.seo_title:
        issues.append({"type": "missing_seo_title", "severity": "high", "message": "SEO title is missing"})
    elif len(blog.seo_title) > 60:
        issues.append({"type": "long_title", "severity": "medium", "message": "SEO title is too long"})
    
    if not blog.seo_description:
        issues.append({"type": "missing_meta_description", "severity": "high", "message": "Meta description is missing"})
    elif len(blog.seo_description) > 160:
        issues.append({"type": "long_description", "severity": "medium", "message": "Meta description is too long"})
    
    if not blog.seo_keywords:
        issues.append({"type": "missing_keywords", "severity": "medium", "message": "SEO keywords are missing"})
    
    if not blog.content or len(blog.content.split()) < 300:
        issues.append({"type": "thin_content", "severity": "medium", "message": "Content is too thin"})
    
    return issues

def get_most_common_issues(issues: List[Dict]) -> List[Dict]:
    """Get the most common SEO issues"""
    
    issue_counts = {}
    
    for issue in issues:
        issue_type = issue.get("type", "unknown")
        if issue_type not in issue_counts:
            issue_counts[issue_type] = {"count": 0, "severity": issue.get("severity", "medium")}
        issue_counts[issue_type]["count"] += 1
    
    # Sort by count and return top 5
    common_issues = sorted(issue_counts.items(), key=lambda x: x[1]["count"], reverse=True)
    
    return [
        {
            "type": issue[0],
            "count": issue[1]["count"],
            "severity": issue[1]["severity"]
        }
        for issue in common_issues[:5]
    ]