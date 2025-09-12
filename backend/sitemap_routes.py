from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db
from models import Blog, Tool, Category, SeoPage
from datetime import datetime
import os

router = APIRouter()

def calculate_page_priority(page_type: str) -> str:
    """Calculate dynamic priority based on page type and engagement"""
    priority_map = {
        'tools_listing': '0.9',
        'blogs_listing': '0.9', 
        'compare': '0.7',
        'categories': '0.6',
        'default': '0.5'
    }
    return priority_map.get(page_type, priority_map['default'])

def calculate_content_priority(content_type: str, engagement_metrics: dict) -> str:
    """Calculate dynamic priority based on content engagement"""
    base_priority = 0.8
    
    # Adjust based on engagement metrics
    views = engagement_metrics.get('views', 0)
    likes = engagement_metrics.get('likes', 0) 
    reviews = engagement_metrics.get('reviews', 0)
    rating = engagement_metrics.get('rating', 0)
    
    # Calculate engagement score
    engagement_score = 0
    if views > 1000:
        engagement_score += 0.1
    if views > 5000:
        engagement_score += 0.05
    
    if likes > 50:
        engagement_score += 0.05
    if likes > 200:
        engagement_score += 0.05
        
    if reviews > 10:
        engagement_score += 0.05
    if reviews > 50:
        engagement_score += 0.05
        
    if rating >= 4.5:
        engagement_score += 0.1
    elif rating >= 4.0:
        engagement_score += 0.05
    
    # Content type multiplier
    if content_type == 'tool':
        base_priority += 0.05  # Tools are slightly more important
    
    final_priority = min(0.95, base_priority + engagement_score)  # Cap at 0.95
    return f"{final_priority:.2f}"

@router.get("/sitemap.xml")
@router.get("/api/sitemap.xml")
async def get_sitemap(db: Session = Depends(get_db)):
    """Generate advanced sitemap.xml with dynamic priority scoring"""
    
    # Get base URL from environment
    base_url = os.getenv('FRONTEND_URL', 'https://marketmind.com')
    
    # Get all published blogs with engagement metrics
    blogs = db.query(Blog).filter(Blog.status == 'published').all()
    
    # Get all active tools with engagement metrics
    tools = db.query(Tool).filter(Tool.is_active).all()
    
    # Get all categories
    categories = db.query(Category).all()
    
    # Get SEO pages
    seo_pages = db.query(SeoPage).all()
    
    # Build sitemap XML with schema
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'''
    
    # Add homepage with highest priority
    sitemap_content += f'''
    <url>
        <loc>{base_url}/</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>'''
    
    # Add main pages with calculated priorities
    main_pages = [
        ('/tools', 'daily', calculate_page_priority('tools_listing')),
        ('/blogs', 'daily', calculate_page_priority('blogs_listing')),
        ('/compare', 'weekly', calculate_page_priority('compare')),
        ('/categories', 'weekly', calculate_page_priority('categories')),
        ('/login', 'monthly', '0.3'),
        ('/register', 'monthly', '0.3'),
        ('/about', 'monthly', '0.4'),
        ('/contact', 'monthly', '0.4')
    ]
    
    for page, changefreq, priority in main_pages:
        sitemap_content += f'''
    <url>
        <loc>{base_url}{page}</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>{changefreq}</changefreq>
        <priority>{priority}</priority>
    </url>'''
    
    # Add blogs with dynamic priority and enhanced metadata
    for blog in blogs:
        last_mod = (blog.updated_at.strftime('%Y-%m-%d') if blog.updated_at 
                   else blog.created_at.strftime('%Y-%m-%d'))
        
        # Calculate dynamic priority based on engagement
        engagement_metrics = {
            'views': getattr(blog, 'view_count', 0),
            'likes': getattr(blog, 'like_count', 0),
            'rating': getattr(blog, 'rating', 0),
            'reviews': 0  # Blog comments/reviews if available
        }
        priority = calculate_content_priority('blog', engagement_metrics)
        
        # Determine change frequency based on recency
        created_date = blog.created_at
        days_old = (datetime.now() - created_date).days if created_date else 0
        
        if days_old < 7:
            changefreq = 'daily'
        elif days_old < 30:
            changefreq = 'weekly'
        else:
            changefreq = 'monthly'
        
        sitemap_entry = f'''
    <url>
        <loc>{base_url}/blogs/{blog.slug}</loc>
        <lastmod>{last_mod}</lastmod>
        <changefreq>{changefreq}</changefreq>
        <priority>{priority}</priority>'''
        
        # Add image if available
        if hasattr(blog, 'featured_image') and blog.featured_image:
            sitemap_entry += f'''
        <image:image>
            <image:loc>{blog.featured_image}</image:loc>
            <image:title>{blog.title[:100]}</image:title>
            <image:caption>{(blog.excerpt or blog.seo_description or "")[:200]}</image:caption>
        </image:image>'''
        
        sitemap_entry += '''
    </url>'''
        sitemap_content += sitemap_entry
    
    # Add tools
    for tool in tools:
        last_mod = (tool.updated_at.strftime('%Y-%m-%d') if tool.updated_at 
                   else tool.created_at.strftime('%Y-%m-%d'))
        sitemap_content += f'''
    <url>
        <loc>{base_url}/tools/{tool.slug}</loc>
        <lastmod>{last_mod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>'''
    
    # Add categories
    for category in categories:
        sitemap_content += f'''
    <url>
        <loc>{base_url}/tools?category={category.slug}</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>'''
    
    # Add SEO pages
    for seo_page in seo_pages:
        last_mod = (seo_page.updated_at.strftime('%Y-%m-%d') if seo_page.updated_at 
                   else seo_page.created_at.strftime('%Y-%m-%d'))
        sitemap_content += f'''
    <url>
        <loc>{base_url}{seo_page.page_path}</loc>
        <lastmod>{last_mod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>'''
    
    sitemap_content += '''
</urlset>'''
    
    return Response(
        content=sitemap_content,
        media_type="application/xml",
        headers={"Cache-Control": "max-age=3600"}  # Cache for 1 hour
    )

@router.get("/robots.txt")
@router.get("/api/robots.txt")
async def get_robots():
    """Generate robots.txt for SEO"""
    
    base_url = os.getenv('FRONTEND_URL', 'https://marketmind.com')
    
    robots_content = f"""User-agent: *
Allow: /

# Disallow admin and dashboard areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /superadmin/
Disallow: /api/

# Allow specific API endpoints that should be crawled
Allow: /api/blogs/
Allow: /api/tools/

# Sitemap location
Sitemap: {base_url}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1
"""
    
    return Response(
        content=robots_content,
        media_type="text/plain",
        headers={"Cache-Control": "max-age=86400"}  # Cache for 24 hours
    )

@router.get("/.well-known/security.txt")
async def get_security_txt():
    """Security.txt for responsible disclosure"""
    
    security_content = """Contact: security@marketmind.com
Expires: 2025-12-31T23:59:59.000Z
Acknowledgments: https://marketmind.com/security
Preferred-Languages: en
Canonical: https://marketmind.com/.well-known/security.txt
Policy: https://marketmind.com/security-policy
"""
    
    return Response(
        content=security_content,
        media_type="text/plain"
    )