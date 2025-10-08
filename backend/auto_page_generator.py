"""
Auto Page Generator for MarketMindAI
Automatically generates static HTML pages when new blogs/tools are created
"""
import os
import json
import requests
from pathlib import Path
from datetime import datetime
from models import Blog, Tool, Location, Category
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

def generate_meta_tags(content_type, data, location_data=None):
    """Generate meta tags for dynamic content"""
    base_url = BACKEND_URL
    
    if content_type == 'tool_location':
        # Generate meta tags for tool + location pages
        tool_name = data.get('name', 'Business Tool')
        location_name = location_data.get('name', 'Location')
        description = data.get('description', '')[:100]
        
        title_template = location_data.get('seo_title_template', 'Best {tool_name} for {location_name} | MarketMindAI')
        desc_template = location_data.get('seo_description_template', 'Discover the top {tool_name} tools for {location_name}. Compare features, pricing, and reviews.')
        
        title = title_template.format(tool_name=tool_name, location_name=location_name)
        meta_description = desc_template.format(tool_name=tool_name, location_name=location_name, description=description)
        keywords = f"{tool_name}, {location_name}, business tool, software, review"
        url = f"{base_url}/tools/{data.get('slug')}/{location_data.get('slug')}"
        image = data.get('logo_url') or f"{base_url}/api/images/tools/{data.get('slug')}.jpg"
        
        return {
            'title': title[:60],  # Limit to 60 chars
            'description': meta_description[:160],  # Limit to 160 chars
            'keywords': keywords,
            'url': url,
            'image': image,
            'type': 'article'
        }
    
    elif content_type == 'category_location':
        # Generate meta tags for category + location pages
        category_name = data.get('name', 'Business Tools')
        location_name = location_data.get('name', 'Location')
        
        title_template = location_data.get('seo_title_template', 'Best {tool_name} for {location_name} | MarketMindAI')
        desc_template = location_data.get('seo_description_template', 'Discover the top {tool_name} tools for {location_name}. Compare features, pricing, and reviews.')
        
        title = title_template.format(tool_name=category_name, location_name=location_name)
        meta_description = desc_template.format(tool_name=category_name, location_name=location_name, description=f"Browse {category_name.lower()} tools")
        keywords = f"{category_name}, {location_name}, business tools, software, comparison"
        url = f"{base_url}/tools/{data.get('slug')}/{location_data.get('slug')}"
        image = f"{base_url}/api/images/categories/{data.get('slug')}.jpg"
        
        return {
            'title': title[:60],
            'description': meta_description[:160],
            'keywords': keywords,
            'url': url,
            'image': image,
            'type': 'website'
        }
    
    elif content_type == 'tool':
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

def generate_page_for_content(content_type, content_id, location_id=None):
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
        
        location_dict = None
        if location_id:
            location = db.query(Location).filter(Location.id == location_id).first()
            if location:
                location_dict = {
                    'name': location.name,
                    'slug': location.slug,
                    'type': location.type,
                    'seo_title_template': location.seo_title_template,
                    'seo_description_template': location.seo_description_template
                }
        
        if content_type == 'tool' or content_type == 'tool_location':
            content = db.query(Tool).filter(Tool.id == content_id).first()
        elif content_type == 'blog' or content_type == 'blog_location':
            content = db.query(Blog).filter(Blog.id == content_id).first()
        elif content_type == 'category_location':
            content = db.query(Category).filter(Category.id == content_id).first()
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
        meta_data = generate_meta_tags(content_type, content_dict, location_dict)
        if not meta_data:
            return False
        
        # Create HTML with meta tags
        final_html = create_html_page(template_html, meta_data)
        
        # Create directory and save file
        if location_dict:
            # Location-specific page
            page_dir = os.path.join(FRONTEND_BUILD_PATH, f"{content_type.replace('_location', '')}s", content.slug, location_dict['slug'])
            page_url = f"/{content_type.replace('_location', '')}s/{content.slug}/{location_dict['slug']}"
        else:
            # Regular page
            page_dir = os.path.join(FRONTEND_BUILD_PATH, f"{content_type}s", content.slug)
            page_url = f"/{content_type}s/{content.slug}"
        
        os.makedirs(page_dir, exist_ok=True)
        
        page_path = os.path.join(page_dir, 'index.html')
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(final_html)
        
        print(f"✅ Generated page: {page_url}")
        
        # Log generation
        log_page_generation(content_type, page_url, meta_data['title'])
        
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

def generate_location_pages():
    """Generate location-based pages for all tools and categories"""
    try:
        db = SessionLocal()
        
        # Get active tools, categories, and locations
        tools = db.query(Tool).filter(Tool.is_active == True).all()
        categories = db.query(Category).all()
        locations = db.query(Location).filter(Location.is_active == True).all()
        
        tool_location_count = 0
        category_location_count = 0
        
        # Generate tool + location pages
        for tool in tools:
            for location in locations:
                if generate_page_for_content('tool_location', tool.id, location.id):
                    tool_location_count += 1
        
        # Generate category + location pages
        for category in categories:
            for location in locations:
                if generate_page_for_content('category_location', category.id, location.id):
                    category_location_count += 1
        
        db.close()
        
        print(f"✅ Generated {tool_location_count} tool-location pages and {category_location_count} category-location pages")
        return {
            'tool_locations': tool_location_count,
            'category_locations': category_location_count,
            'total_locations': len(locations)
        }
        
    except Exception as e:
        print(f"❌ Error generating location pages: {e}")
        return {'tool_locations': 0, 'category_locations': 0}

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
        
        # Regenerate location-based pages
        location_results = generate_location_pages()
        
        db.close()
        
        total_pages = tool_count + blog_count + location_results.get('tool_locations', 0) + location_results.get('category_locations', 0)
        print(f"✅ Regenerated {total_pages} total pages")
        
        return {
            'tools': tool_count, 
            'blogs': blog_count,
            'location_pages': location_results
        }
        
    except Exception as e:
        print(f"❌ Error regenerating pages: {e}")
        return {'tools': 0, 'blogs': 0, 'location_pages': {}}

if __name__ == "__main__":
    # Test the system
    print("🧪 Testing auto page generator...")
    result = regenerate_all_pages()
    print(f"Test completed: {result}")