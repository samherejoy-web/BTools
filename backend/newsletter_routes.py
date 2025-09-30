from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from database import get_db
from models import User, Newsletter
from auth import get_current_superadmin
import uuid
from datetime import datetime
import secrets

router = APIRouter()

class NewsletterSubscribe(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    source: str = "website"

class NewsletterUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None

# Public newsletter subscription endpoint
@router.post("/api/newsletter/subscribe")
async def subscribe_to_newsletter(
    subscription_data: NewsletterSubscribe,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Subscribe to newsletter (public endpoint)"""
    
    try:
        # Check if email already exists
        existing_subscription = db.query(Newsletter).filter(Newsletter.email == subscription_data.email).first()
        
        if existing_subscription:
            if existing_subscription.is_active:
                return {"message": "Email is already subscribed to our newsletter"}
            else:
                # Reactivate existing subscription
                existing_subscription.is_active = True
                existing_subscription.subscribed_at = datetime.utcnow()
                existing_subscription.unsubscribed_at = None
                if subscription_data.name:
                    existing_subscription.name = subscription_data.name
                db.commit()
                return {"message": "Successfully resubscribed to newsletter"}
        
        # Create new subscription
        confirmation_token = secrets.token_urlsafe(32)
        
        subscription = Newsletter(
            id=str(uuid.uuid4()),
            email=subscription_data.email,
            name=subscription_data.name,
            confirmation_token=confirmation_token,
            source=subscription_data.source,
            is_active=True,
            is_confirmed=False  # Will be confirmed via email or can be auto-confirmed
        )
        
        db.add(subscription)
        db.commit()
        
        # TODO: In production, add background task to send confirmation email
        # background_tasks.add_task(send_confirmation_email, subscription.email, confirmation_token)
        
        return {
            "message": "Successfully subscribed to newsletter! Check your email for confirmation.",
            "subscription_id": subscription.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")

@router.post("/api/newsletter/unsubscribe")
async def unsubscribe_from_newsletter(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """Unsubscribe from newsletter"""
    
    subscription = db.query(Newsletter).filter(Newsletter.email == email).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Email not found in subscription list")
    
    subscription.is_active = False
    subscription.unsubscribed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Successfully unsubscribed from newsletter"}

@router.get("/api/newsletter/confirm/{token}")
async def confirm_newsletter_subscription(
    token: str,
    db: Session = Depends(get_db)
):
    """Confirm newsletter subscription via token"""
    
    subscription = db.query(Newsletter).filter(Newsletter.confirmation_token == token).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Invalid confirmation token")
    
    if subscription.is_confirmed:
        return {"message": "Email already confirmed"}
    
    subscription.is_confirmed = True
    subscription.confirmed_at = datetime.utcnow()
    subscription.confirmation_token = None  # Clear token after confirmation
    db.commit()
    
    return {"message": "Newsletter subscription confirmed successfully"}

# SuperAdmin endpoints for managing newsletter subscriptions
@router.get("/api/superadmin/newsletter/subscriptions")
async def get_all_subscriptions(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    search: Optional[str] = None,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all newsletter subscriptions"""
    
    query = db.query(Newsletter)
    
    if active_only:
        query = query.filter(Newsletter.is_active == True)
    
    if search:
        query = query.filter(
            Newsletter.email.contains(search) |
            Newsletter.name.contains(search)
        )
    
    subscriptions = query.order_by(Newsletter.subscribed_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": sub.id,
            "email": sub.email,
            "name": sub.name,
            "is_active": sub.is_active,
            "is_confirmed": sub.is_confirmed,
            "source": sub.source,
            "subscribed_at": sub.subscribed_at,
            "confirmed_at": sub.confirmed_at,
            "unsubscribed_at": sub.unsubscribed_at
        } for sub in subscriptions
    ]

@router.get("/api/superadmin/newsletter/stats")
async def get_newsletter_stats(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get newsletter subscription statistics"""
    
    total_subscriptions = db.query(Newsletter).count()
    active_subscriptions = db.query(Newsletter).filter(Newsletter.is_active == True).count()
    confirmed_subscriptions = db.query(Newsletter).filter(
        Newsletter.is_active == True,
        Newsletter.is_confirmed == True
    ).count()
    
    # Recent subscriptions (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_subscriptions = db.query(Newsletter).filter(
        Newsletter.subscribed_at >= thirty_days_ago
    ).count()
    
    # Subscription sources breakdown
    source_breakdown = db.query(
        Newsletter.source,
        db.func.count(Newsletter.id).label('count')
    ).filter(Newsletter.is_active == True).group_by(Newsletter.source).all()
    
    return {
        "total_subscriptions": total_subscriptions,
        "active_subscriptions": active_subscriptions,
        "confirmed_subscriptions": confirmed_subscriptions,
        "recent_subscriptions": recent_subscriptions,
        "confirmation_rate": round((confirmed_subscriptions / active_subscriptions * 100) if active_subscriptions > 0 else 0, 1),
        "source_breakdown": [
            {"source": source, "count": count}
            for source, count in source_breakdown
        ]
    }

@router.put("/api/superadmin/newsletter/subscriptions/{subscription_id}")
async def update_subscription(
    subscription_id: str,
    update_data: NewsletterUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update a newsletter subscription"""
    
    subscription = db.query(Newsletter).filter(Newsletter.id == subscription_id).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Update fields
    update_fields = update_data.dict(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(subscription, field, value)
    
    # Handle status changes
    if 'is_active' in update_fields:
        if update_fields['is_active'] and not subscription.is_active:
            subscription.subscribed_at = datetime.utcnow()
            subscription.unsubscribed_at = None
        elif not update_fields['is_active'] and subscription.is_active:
            subscription.unsubscribed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Subscription updated successfully"}

@router.delete("/api/superadmin/newsletter/subscriptions/{subscription_id}")
async def delete_subscription(
    subscription_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete a newsletter subscription"""
    
    subscription = db.query(Newsletter).filter(Newsletter.id == subscription_id).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(subscription)
    db.commit()
    
    return {"message": "Subscription deleted successfully"}

@router.post("/api/superadmin/newsletter/subscriptions")
async def add_subscription_manually(
    subscription_data: NewsletterSubscribe,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Manually add a newsletter subscription"""
    
    # Check if email already exists
    existing = db.query(Newsletter).filter(Newsletter.email == subscription_data.email).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription = Newsletter(
        id=str(uuid.uuid4()),
        email=subscription_data.email,
        name=subscription_data.name,
        source=subscription_data.source or "admin",
        is_active=True,
        is_confirmed=True,  # Admin-added subscriptions are auto-confirmed
        confirmed_at=datetime.utcnow()
    )
    
    db.add(subscription)
    db.commit()
    
    return {"message": "Subscription added successfully", "subscription_id": subscription.id}

# Bulk operations
@router.post("/api/superadmin/newsletter/bulk-subscribe")
async def bulk_subscribe(
    emails: List[EmailStr],
    source: str = "admin",
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk subscribe multiple emails"""
    
    created_count = 0
    skipped_count = 0
    errors = []
    
    for email in emails:
        try:
            existing = db.query(Newsletter).filter(Newsletter.email == email).first()
            if existing:
                skipped_count += 1
                continue
                
            subscription = Newsletter(
                id=str(uuid.uuid4()),
                email=email,
                source=source,
                is_active=True,
                is_confirmed=True,
                confirmed_at=datetime.utcnow()
            )
            
            db.add(subscription)
            created_count += 1
            
        except Exception as e:
            errors.append(f"Error with {email}: {str(e)}")
    
    try:
        db.commit()
        return {
            "message": f"Bulk subscription completed",
            "created": created_count,
            "skipped": skipped_count,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk subscription failed: {str(e)}")

@router.post("/api/superadmin/newsletter/export")
async def export_subscriptions(
    active_only: bool = True,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Export newsletter subscriptions"""
    
    query = db.query(Newsletter)
    if active_only:
        query = query.filter(Newsletter.is_active == True)
    
    subscriptions = query.all()
    
    export_data = [
        {
            "email": sub.email,
            "name": sub.name or "",
            "is_active": sub.is_active,
            "is_confirmed": sub.is_confirmed,
            "source": sub.source,
            "subscribed_at": sub.subscribed_at.isoformat() if sub.subscribed_at else None,
            "confirmed_at": sub.confirmed_at.isoformat() if sub.confirmed_at else None
        } for sub in subscriptions
    ]
    
    return {
        "data": export_data,
        "count": len(export_data),
        "exported_at": datetime.utcnow().isoformat()
    }