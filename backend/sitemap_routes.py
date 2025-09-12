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

@router.get("/sitemap.xml")
@router.get("/api/sitemap.xml")
async def get_sitemap(db: Session = Depends(get_db)):
    """Generate sitemap.xml for better SEO indexing"""
    
    # Get base URL from environment
    base_url = os.getenv('FRONTEND_URL', 'https://marketmind.com')
    
    # Get all published blogs
    blogs = db.query(Blog).filter(Blog.status == 'published').all()
    
    # Get all active tools
    tools = db.query(Tool).filter(Tool.is_active).all()
    
    # Get all categories
    categories = db.query(Category).all()
    
    # Get SEO pages
    seo_pages = db.query(SeoPage).all()
    
    # Build sitemap XML
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'''
    
    # Add homepage
    sitemap_content += f'''
    <url>
        <loc>{base_url}/</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>'''
    
    # Add main pages
    main_pages = [
        ('/tools', 'daily', '0.9'),
        ('/blogs', 'daily', '0.9'),
        ('/compare', 'weekly', '0.7'),
        ('/login', 'monthly', '0.5'),
        ('/register', 'monthly', '0.5')
    ]
    
    for page, changefreq, priority in main_pages:
        sitemap_content += f'''
    <url>
        <loc>{base_url}{page}</loc>
        <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
        <changefreq>{changefreq}</changefreq>
        <priority>{priority}</priority>
    </url>'''
    
    # Add blogs
    for blog in blogs:
        last_mod = (blog.updated_at.strftime('%Y-%m-%d') if blog.updated_at 
                   else blog.created_at.strftime('%Y-%m-%d'))
        sitemap_content += f'''
    <url>
        <loc>{base_url}/blogs/{blog.slug}</loc>
        <lastmod>{last_mod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>'''
    
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