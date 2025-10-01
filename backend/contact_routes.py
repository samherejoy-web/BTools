from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import logging

from database import get_db
from models import ContactSubmission
from auth import get_current_user

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class ContactSubmissionCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    subject: str
    message: str
    inquiry_type: str = "general"
    
    @validator('name')
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()
    
    @validator('subject')
    def validate_subject(cls, v):
        if not v or len(v.strip()) < 3:
            raise ValueError('Subject must be at least 3 characters long')
        return v.strip()
    
    @validator('message')
    def validate_message(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Message must be at least 10 characters long')
        return v.strip()
    
    @validator('inquiry_type')
    def validate_inquiry_type(cls, v):
        valid_types = ['general', 'support', 'partnership', 'billing', 'feature', 'press']
        if v not in valid_types:
            raise ValueError(f'Inquiry type must be one of: {", ".join(valid_types)}')
        return v

class ContactSubmissionResponse(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str]
    subject: str
    message: str
    inquiry_type: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Public endpoint - Submit contact form
@router.post("/api/contact", response_model=dict, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    contact_data: ContactSubmissionCreate,
    db: Session = Depends(get_db)
):
    """Submit a contact form"""
    try:
        # Create new contact submission
        db_contact = ContactSubmission(
            name=contact_data.name,
            email=contact_data.email,
            company=contact_data.company,
            subject=contact_data.subject,
            message=contact_data.message,
            inquiry_type=contact_data.inquiry_type,
            status="new"
        )
        
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        
        logger.info(f"Contact form submitted by {contact_data.email} - ID: {db_contact.id}")
        
        return {
            "success": True,
            "message": "Thank you for your message! We'll get back to you within 24 hours.",
            "contact_id": db_contact.id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error processing your request. Please try again."
        )

# Admin endpoint - Get all contact submissions
@router.get("/api/admin/contacts", response_model=List[ContactSubmissionResponse])
async def get_contact_submissions(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all contact submissions (Admin only)"""
    # Check if user is admin or superadmin
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    try:
        query = db.query(ContactSubmission)
        
        if status_filter:
            query = query.filter(ContactSubmission.status == status_filter)
            
        contacts = query.order_by(ContactSubmission.created_at.desc()).offset(skip).limit(limit).all()
        return contacts
        
    except Exception as e:
        logger.error(f"Error fetching contact submissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching contact submissions"
        )

# Admin endpoint - Update contact submission status
@router.put("/api/admin/contacts/{contact_id}/status")
async def update_contact_status(
    contact_id: str,
    new_status: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update contact submission status (Admin only)"""
    # Check if user is admin or superadmin
    if current_user.role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    valid_statuses = ['new', 'in_progress', 'resolved', 'closed']
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        contact = db.query(ContactSubmission).filter(ContactSubmission.id == contact_id).first()
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact submission not found"
            )
        
        contact.status = new_status
        contact.updated_at = datetime.utcnow()
        db.commit()
        
        return {"success": True, "message": f"Status updated to {new_status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating contact status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating contact status"
        )