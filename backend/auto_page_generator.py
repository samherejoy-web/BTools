"""
Auto Page Generator for MarketMindAI
Automatically generates static HTML pages when new blogs/tools are created
"""
import os
import json
import requests
from pathlib import Path
from datetime import datetime
from models import Blog, Tool
from database import SessionLocal

# Configuration - Auto-detect production path
import os as os_mod

def get_build_path():
    """Auto-detect the frontend build path"""
    possible_paths = [
        "/var/www/marketmindai/build",
        "/var/www/marketmindai",
        "/var/www/html",
        "/app/marketmindai-production-optimized",
        "/app/frontend/build"
    ]
    
    for path in possible_paths:
        if os_mod.path.exists(path):
            # Check if index.html exists
            if os_mod.path.exists(os_mod.path.join(path, 'index.html')):
                return path
    
    # Default fallback
    return "/var/www/marketmindai/build"

FRONTEND_BUILD_PATH = get_build_path()
BACKEND_URL = os_mod.getenv('FRONTEND_URL', 'https://marketmindai.com').rstrip('/')

def generate_meta_tags(content_type, data):
    """Generate meta tags for dynamic content"""
    base_url = BACKEND_URL
    
    if content_type == 'tool':
        name = data.get('name', 'Business Tool')
        description = data.get('description', '')[:150]
        title = data.get('seo_title') or f"{name} Review - Features & Pricing | MarketMindAI"
        meta_description = data.get('seo_description') or f"{description}... Read our comprehensive review."
        keywords = data.get('seo_keywords') or f"{name}, business tool, software review"
        url = f"{base_url}/tools/{data.get('slug')}"
        image = data.get('logo_url') or f"{base_url}/api/images/tools/{data.get('slug')}.jpg"
        
        return {
            'title': title,
            'description': meta_description,
            'keywords': keywords,
            'url': url,
            'image': image,
            'type': 'article'
        }
    
    elif content_type == 'blog':
        title = data.get('title', 'Blog Post')
        content = data.get('content', '')[:150]
        seo_title = data.get('seo_title') or f"{title} | MarketMindAI Blog"
        meta_description = data.get('seo_description') or f"{content}... Read more insights."
        keywords = data.get('seo_keywords') or f"{title}, business tools, productivity"
        url = f"{base_url}/blogs/{data.get('slug')}"
        image = data.get('featured_image') or f"{base_url}/api/images/blogs/{data.get('slug')}.jpg"
        
        return {
            'title': seo_title,
            'description': meta_description,
            'keywords': keywords,
            'url': url,
            'image': image,
            'type': 'article'
        }
    
    return None

def create_html_page(template_html, meta_data):
    """Create HTML page with proper meta tags - Inject right after <head>"""
    
    # Escape quotes in meta content
    def escape_attr(text):
        if not text:
            return ""
        return str(text).replace('"', '&quot;').replace('\n', ' ').replace('\r', ' ')
    
    title = escape_attr(meta_data['title'])
    description = escape_attr(meta_data['description'])
    keywords = escape_attr(meta_data['keywords'])
    url = escape_attr(meta_data['url'])
    image = escape_attr(meta_data['image'])
    page_type = escape_attr(meta_data['type'])
    
    # SEO meta tags to inject - these will override React Helmet for crawlers
    seo_injection = f'''
    <!-- Page-specific SEO Meta Tags (for crawlers) -->
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <meta name="keywords" content="{keywords}" />
    <link rel="canonical" href="{url}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="{page_type}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:url" content="{url}" />
    <meta property="og:image" content="{image}" />
    <meta property="og:site_name" content="MarketMindAI" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{image}" />
    '''
    
    # Inject right after <head> tag for better crawler visibility
    updated_html = template_html.replace('<head>', f'<head>{seo_injection}', 1)
    
    return updated_html

def generate_page_for_content(content_type, content_id):
    """Generate static page for new content"""
    try:
        # Get template HTML
        template_path = os.path.join(FRONTEND_BUILD_PATH, 'index.html')
        if not os.path.exists(template_path):
            print(f"Template not found: {template_path}")
            return False
        
        with open(template_path, 'r', encoding='utf-8') as f:
            template_html = f.read()
        
        # Get content data from database
        db = SessionLocal()
        
        if content_type == 'tool':
            content = db.query(Tool).filter(Tool.id == content_id).first()
        elif content_type == 'blog':
            content = db.query(Blog).filter(Blog.id == content_id).first()
        else:
            return False
        
        if not content:
            print(f"Content not found: {content_type} with id {content_id}")
            return False
        
        # Convert to dict for meta generation
        content_dict = {
            'name': getattr(content, 'name', None),
            'title': getattr(content, 'title', None),
            'description': getattr(content, 'description', None),
            'content': getattr(content, 'content', None),
            'slug': content.slug,
            'seo_title': getattr(content, 'seo_title', None),
            'seo_description': getattr(content, 'seo_description', None),
            'seo_keywords': getattr(content, 'seo_keywords', None),
            'logo_url': getattr(content, 'logo_url', None),
            'featured_image': getattr(content, 'featured_image', None)
        }
        
        # Generate meta data
        meta_data = generate_meta_tags(content_type, content_dict)
        if not meta_data:
            return False
        
        # Create HTML with meta tags
        final_html = create_html_page(template_html, meta_data)
        
        # Create directory and save file
        page_dir = os.path.join(FRONTEND_BUILD_PATH, f"{content_type}s", content.slug)
        os.makedirs(page_dir, exist_ok=True)
        
        page_path = os.path.join(page_dir, 'index.html')
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(final_html)
        
        print(f"✅ Generated page: /{content_type}s/{content.slug}")
        
        # Log generation
        log_page_generation(content_type, content.slug, meta_data['title'])
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error generating page for {content_type} {content_id}: {e}")
        return False

def log_page_generation(content_type, slug, title):
    """Log page generation for tracking"""
    log_file = os.path.join(FRONTEND_BUILD_PATH, 'auto-generated-pages.log')
    
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'type': content_type,
        'slug': slug,
        'title': title,
        'url': f"{BACKEND_URL}/{content_type}s/{slug}"
    }
    
    # Append to log file
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(log_entry) + '\n')

def cleanup_old_pages():
    """Remove pages for deleted content (optional cleanup)"""
    try:
        db = SessionLocal()
        
        # Get current slugs from database
        tool_slugs = {tool.slug for tool in db.query(Tool).filter(Tool.is_active == True).all()}
        blog_slugs = {blog.slug for blog in db.query(Blog).filter(Blog.status == 'published').all()}
        
        # Check existing directories
        tools_dir = os.path.join(FRONTEND_BUILD_PATH, 'tools')
        blogs_dir = os.path.join(FRONTEND_BUILD_PATH, 'blogs')
        
        removed_count = 0
        
        # Cleanup tool pages
        if os.path.exists(tools_dir):
            for item in os.listdir(tools_dir):
                if item != 'index.html' and item not in tool_slugs:
                    page_path = os.path.join(tools_dir, item)
                    if os.path.isdir(page_path):
                        import shutil
                        shutil.rmtree(page_path)
                        print(f"🗑️ Removed outdated tool page: {item}")
                        removed_count += 1
        
        # Cleanup blog pages
        if os.path.exists(blogs_dir):
            for item in os.listdir(blogs_dir):
                if item != 'index.html' and item not in blog_slugs:
                    page_path = os.path.join(blogs_dir, item)
                    if os.path.isdir(page_path):
                        import shutil
                        shutil.rmtree(page_path)
                        print(f"🗑️ Removed outdated blog page: {item}")
                        removed_count += 1
        
        db.close()
        print(f"✅ Cleanup completed. Removed {removed_count} outdated pages.")
        return removed_count
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        return 0

# API endpoint functions (to be called from your admin routes)
def on_tool_created(tool_id):
    """Call this when a new tool is created"""
    return generate_page_for_content('tool', tool_id)

def on_blog_published(blog_id):
    """Call this when a blog is published"""
    return generate_page_for_content('blog', blog_id)

def regenerate_all_pages():
    """Regenerate all pages (useful for bulk updates)"""
    try:
        db = SessionLocal()
        
        # Regenerate tool pages
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        tool_count = 0
        for tool in tools:
            if generate_page_for_content('tool', tool.id):
                tool_count += 1
        
        # Regenerate blog pages
        blogs = db.query(Blog).filter(Blog.status == 'published').all()
        blog_count = 0
        for blog in blogs:
            if generate_page_for_content('blog', blog.id):
                blog_count += 1
        
        db.close()
        
        print(f"✅ Regenerated {tool_count} tool pages and {blog_count} blog pages")
        return {'tools': tool_count, 'blogs': blog_count}
        
    except Exception as e:
        print(f"❌ Error regenerating pages: {e}")
        return {'tools': 0, 'blogs': 0}

if __name__ == "__main__":
    # Test the system
    print("🧪 Testing auto page generator...")
    result = regenerate_all_pages()
    print(f"Test completed: {result}")