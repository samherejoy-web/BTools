import threading
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
from database import engine
from models import Tool, Review, Blog
import logging

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