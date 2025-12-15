import threading
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
from database import engine
from models import Tool, Review, Blog
import logging
import os

logger = logging.getLogger(__name__)

def update_trending_scores():
    """Update trending scores for tools based on recent activity"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Calculate trending scores based on recent views, reviews, and ratings
        # This is a simplified algorithm - in production, you'd want more sophisticated scoring
        
        tools = db.query(Tool).all()
        for tool in tools:
            recent_reviews = db.query(Review).filter(
                Review.tool_id == tool.id,
                Review.created_at >= datetime.utcnow() - timedelta(days=7)
            ).count()
            
            # Simple trending score: (recent_reviews * 10) + (rating * 2) + (view_count * 0.1)
            trending_score = (recent_reviews * 10) + (tool.rating * 2) + (tool.view_count * 0.1)
            tool.trending_score = trending_score
            
        db.commit()
        logger.info("Trending scores updated successfully")
        
    except Exception as e:
        logger.error(f"Error updating trending scores: {e}")
        db.rollback()
    finally:
        db.close()

def regenerate_seo_pages():
    """Regenerate static pages for SEO (pre-rendering)"""
    try:
        from auto_page_generator import regenerate_all_pages
        logger.info("Starting SEO page regeneration...")
        result = regenerate_all_pages()
        logger.info(f"SEO pages regenerated: {result.get('tools', 0)} tools, {result.get('blogs', 0)} blogs")
        return result
    except Exception as e:
        logger.error(f"Error regenerating SEO pages: {e}")
        return {'tools': 0, 'blogs': 0}

def generate_sitemap():
    """Generate and save sitemap.xml file for SEO"""
    try:
        import requests
        base_url = os.getenv('FRONTEND_URL', 'https://marketmindai.com').rstrip('/')
        
        # Always use localhost for generating sitemap to avoid caching
        api_urls = [
            "http://localhost:8001/api/sitemap.xml"
        ]
        
        response = None
        for api_url in api_urls:
            try:
                # Add cache-busting parameter
                import time
                cache_buster = f"nocache={int(time.time())}"
                full_url = f"{api_url}?{cache_buster}"
                logger.info(f"Generating sitemap from {full_url}")
                response = requests.get(full_url, timeout=30, headers={'Cache-Control': 'no-cache'})
                if response.status_code == 200:
                    break
            except Exception as e:
                logger.warning(f"Failed to get sitemap from {api_url}: {e}")
                continue
        
        if not response or response.status_code != 200:
            logger.error("Failed to generate sitemap from all sources")
            return False
        
        # Detect build path
        from auto_page_generator import FRONTEND_BUILD_PATH
        
        # List of possible sitemap locations
        possible_paths = [
            "/var/www/marketmindai/sitemap.xml",
            "/var/www/marketmindai/build/sitemap.xml",
            "/var/www/html/sitemap.xml",
            os.path.join(FRONTEND_BUILD_PATH, "sitemap.xml")
        ]
        
        saved_count = 0
        # Save to all accessible locations
        for path in possible_paths:
            try:
                directory = os.path.dirname(path)
                if os.path.exists(directory) or directory == FRONTEND_BUILD_PATH:
                    os.makedirs(directory, exist_ok=True)
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(response.text)
                    logger.info(f"✅ Sitemap saved to {path}")
                    saved_count += 1
            except Exception as e:
                logger.debug(f"Could not save sitemap to {path}: {e}")
        
        if saved_count > 0:
            logger.info(f"Sitemap saved to {saved_count} location(s)")
            return True
        else:
            logger.warning("Sitemap generated but not saved to any location")
            return False
            
    except Exception as e:
        logger.error(f"Error generating sitemap: {e}")
        return False

def seo_updater_worker():
    """Background worker to update SEO content periodically"""
    # Wait 2 minutes before first run to ensure app is ready
    time.sleep(120)
    
    while True:
        try:
            # Run SEO updates every 6 hours
            logger.info("=== Starting scheduled SEO update ===")
            
            # 1. Regenerate static pages for crawlers
            page_result = regenerate_seo_pages()
            
            # 2. Generate sitemap.xml
            sitemap_result = generate_sitemap()
            
            logger.info(f"=== SEO update completed: {page_result.get('tools', 0)} tools, {page_result.get('blogs', 0)} blogs, sitemap: {'success' if sitemap_result else 'failed'} ===")
            
            # Update every 6 hours (21600 seconds)
            time.sleep(21600)
            
        except Exception as e:
            logger.error(f"SEO updater error: {e}")
            time.sleep(1800)  # Wait 30 minutes on error

def trending_updater_worker():
    """Background worker to update trending scores periodically"""
    while True:
        try:
            update_trending_scores()
            # Update every hour
            time.sleep(3600)
        except Exception as e:
            logger.error(f"Trending updater error: {e}")
            time.sleep(300)  # Wait 5 minutes on error

def start_trending_updater():
    """Start the trending updater in a background thread"""
    thread = threading.Thread(target=trending_updater_worker, daemon=True)
    thread.start()
    logger.info("Trending updater started")

def start_seo_updater():
    """Start the SEO updater in a background thread"""
    thread = threading.Thread(target=seo_updater_worker, daemon=True)
    thread.start()
    logger.info("SEO updater started (runs every 6 hours)")