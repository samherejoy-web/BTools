from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import EmailSubscription
from sqlalchemy.exc import IntegrityError
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

class EmailSubscriptionRequest(BaseModel):
    email: EmailStr
    company_name: str = None
    subscription_type: str = "newsletter"
    source: str = "website"

class EmailSubscriptionResponse(BaseModel):
    id: str
    email: str
    company_name: str = None
    subscription_type: str
    source: str
    created_at: str
    
    @classmethod
    def from_db_model(cls, db_model):
        return cls(
            id=db_model.id,
            email=db_model.email,
            company_name=db_model.company_name,
            subscription_type=db_model.subscription_type,
            source=db_model.source,
            created_at=db_model.created_at.isoformat() if db_model.created_at else ""
        )

@router.post("/api/subscribe", response_model=dict)
async def subscribe_email(
    subscription: EmailSubscriptionRequest, 
    db: Session = Depends(get_db)
):
    """Subscribe an email to newsletter"""
    try:
        # Check if email already exists
        existing = db.query(EmailSubscription).filter(
            EmailSubscription.email == subscription.email,
            EmailSubscription.subscription_type == subscription.subscription_type
        ).first()
        
        if existing:
            if existing.is_active:
                return {
                    "success": True,
                    "message": "Email is already subscribed to our newsletter",
                    "subscription_id": existing.id
                }
            else:
                # Reactivate existing subscription
                existing.is_active = True
                existing.company_name = subscription.company_name
                existing.source = subscription.source
                db.commit()
                return {
                    "success": True,
                    "message": "Newsletter subscription reactivated successfully",
                    "subscription_id": existing.id
                }
        
        # Create new subscription
        new_subscription = EmailSubscription(
            email=subscription.email,
            company_name=subscription.company_name,
            subscription_type=subscription.subscription_type,
            source=subscription.source
        )
        
        db.add(new_subscription)
        db.commit()
        db.refresh(new_subscription)
        
        logger.info(f"New email subscription: {subscription.email}")
        
        return {
            "success": True,
            "message": "Successfully subscribed to newsletter",
            "subscription_id": new_subscription.id
        }
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already subscribed"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe email"
        )

@router.post("/api/partnership-contact", response_model=dict)
async def partnership_contact(
    subscription: EmailSubscriptionRequest,
    db: Session = Depends(get_db)
):
    """Handle partnership contact form submission"""
    try:
        subscription.subscription_type = "partnership"
        subscription.source = "partnership_form"
        
        # Check if contact already exists for partnerships
        existing = db.query(EmailSubscription).filter(
            EmailSubscription.email == subscription.email,
            EmailSubscription.subscription_type == "partnership"
        ).first()
        
        if existing:
            # Update existing partnership contact
            existing.company_name = subscription.company_name
            existing.is_active = True
            db.commit()
            return {
                "success": True,
                "message": "Partnership inquiry updated successfully",
                "contact_id": existing.id
            }
        
        # Create new partnership contact
        partnership_contact = EmailSubscription(
            email=subscription.email,
            company_name=subscription.company_name,
            subscription_type="partnership",
            source="partnership_form"
        )
        
        db.add(partnership_contact)
        db.commit()
        db.refresh(partnership_contact)
        
        logger.info(f"New partnership inquiry: {subscription.email} from {subscription.company_name}")
        
        return {
            "success": True,
            "message": "Partnership inquiry submitted successfully. We'll contact you at hello@marketmindai.com",
            "contact_id": partnership_contact.id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Partnership contact error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit partnership inquiry"
        )

@router.get("/api/subscriptions")
async def get_subscriptions(
    subscription_type: str = None,
    db: Session = Depends(get_db)
):
    """Get email subscriptions (admin endpoint)"""
    query = db.query(EmailSubscription)
    
    if subscription_type:
        query = query.filter(EmailSubscription.subscription_type == subscription_type)
    
    subscriptions = query.filter(EmailSubscription.is_active == True).all()
    
    # Convert to response format
    return [EmailSubscriptionResponse.from_db_model(sub) for sub in subscriptions]