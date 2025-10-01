from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import logging
import re

from database import get_db
from models import NewsletterSubscription
from auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "website"
    
    @validator('email')
    def validate_email(cls, v):
        # Additional email validation beyond EmailStr
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format')
        return v.lower().strip()
    
    @validator('source')
    def validate_source(cls, v):
        valid_sources = ['website', 'footer', 'blog', 'contact_form', 'homepage']
        if v and v not in valid_sources:
            return 'website'  # Default to website if invalid source
        return v or 'website'

class NewsletterSubscriptionResponse(BaseModel):
    id: str
    email: str
    status: str
    source: str
    subscribed_at: datetime
    unsubscribed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Public endpoint - Subscribe to newsletter
@router.post("/api/newsletter/subscribe", response_model=dict, status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(
    subscription_data: NewsletterSubscriptionCreate,
    db: Session = Depends(get_db)
):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        existing_subscription = db.query(NewsletterSubscription).filter(
            NewsletterSubscription.email == subscription_data.email
        ).first()
        
        if existing_subscription:
            if existing_subscription.status == 'active':
                return {
                    "success": True,
                    "message": "You're already subscribed to our newsletter!",
                    "already_subscribed": True
                }
            else:
                # Reactivate subscription
                existing_subscription.status = 'active'
                existing_subscription.subscribed_at = datetime.utcnow()
                existing_subscription.unsubscribed_at = None
                existing_subscription.source = subscription_data.source
                db.commit()
                
                logger.info(f"Newsletter subscription reactivated for {subscription_data.email}")
                
                return {
                    "success": True,
                    "message": "Welcome back! You've been resubscribed to our newsletter.",
                    "subscription_id": existing_subscription.id
                }
        
        # Create new subscription
        db_subscription = NewsletterSubscription(
            email=subscription_data.email,
            source=subscription_data.source,
            status="active"
        )
        
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
        
        logger.info(f"New newsletter subscription: {subscription_data.email} from {subscription_data.source}")
        
        return {
            "success": True,
            "message": "Thank you for subscribing! You'll receive our latest updates and insights.",
            "subscription_id": db_subscription.id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing newsletter subscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error processing your subscription. Please try again."
        )

# Public endpoint - Unsubscribe from newsletter
@router.post("/api/newsletter/unsubscribe", response_model=dict)
async def unsubscribe_newsletter(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """Unsubscribe from newsletter"""
    try:
        subscription = db.query(NewsletterSubscription).filter(
            and_(
                NewsletterSubscription.email == email.lower(),
                NewsletterSubscription.status == 'active'
            )
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found or already unsubscribed"
            )
        
        subscription.status = 'unsubscribed'
        subscription.unsubscribed_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Newsletter unsubscription: {email}")
        
        return {
            "success": True,
            "message": "You have been successfully unsubscribed from our newsletter."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing newsletter unsubscription: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error processing your unsubscription. Please try again."
        )

# Admin endpoint - Get all newsletter subscriptions
@router.get("/api/admin/newsletter/subscriptions", response_model=List[NewsletterSubscriptionResponse])
async def get_newsletter_subscriptions(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all newsletter subscriptions (Admin only)"""
    # Check if user is admin or superadmin
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    try:
        query = db.query(NewsletterSubscription)
        
        if status_filter:
            query = query.filter(NewsletterSubscription.status == status_filter)
            
        subscriptions = query.order_by(NewsletterSubscription.subscribed_at.desc()).offset(skip).limit(limit).all()
        return subscriptions
        
    except Exception as e:
        logger.error(f"Error fetching newsletter subscriptions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching newsletter subscriptions"
        )

# Admin endpoint - Get subscription statistics
@router.get("/api/admin/newsletter/stats")
async def get_newsletter_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get newsletter subscription statistics (Admin only)"""
    # Check if user is admin or superadmin
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    try:
        total_subscriptions = db.query(NewsletterSubscription).count()
        active_subscriptions = db.query(NewsletterSubscription).filter(
            NewsletterSubscription.status == 'active'
        ).count()
        unsubscribed = db.query(NewsletterSubscription).filter(
            NewsletterSubscription.status == 'unsubscribed'
        ).count()
        
        # Get subscriptions by source
        from sqlalchemy import func
        subscriptions_by_source = db.query(
            NewsletterSubscription.source,
            func.count(NewsletterSubscription.id).label('count')
        ).group_by(NewsletterSubscription.source).all()
        
        source_stats = {source: count for source, count in subscriptions_by_source}
        
        return {
            "total_subscriptions": total_subscriptions,
            "active_subscriptions": active_subscriptions,
            "unsubscribed": unsubscribed,
            "subscriptions_by_source": source_stats,
            "subscription_rate": round((active_subscriptions / total_subscriptions * 100), 2) if total_subscriptions > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Error fetching newsletter stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching newsletter statistics"
        )