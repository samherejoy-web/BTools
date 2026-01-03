from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from database import get_db
from models import User
from auth import get_password_hash
from email_service import (
    generate_password_reset_token,
    get_password_reset_expiry,
    send_password_reset_email,
    send_password_reset_success_email
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyResetTokenRequest(BaseModel):
    token: str

@router.post("/api/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset email"""
    try:
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        # Always return success to prevent email enumeration
        if not user:
            logger.warning(f"Password reset requested for non-existent email: {request.email}")
            return {
                "success": True,
                "message": "If an account with that email exists, a password reset link has been sent."
            }
        
        # Generate reset token
        reset_token = generate_password_reset_token()
        reset_expiry = get_password_reset_expiry()
        
        # Update user with reset token
        user.password_reset_token = reset_token
        user.password_reset_expires = reset_expiry
        db.commit()
        
        # Send reset email
        email_sent = send_password_reset_email(
            to_email=user.email,
            username=user.username,
            reset_token=reset_token
        )
        
        if not email_sent:
            logger.error(f"Failed to send password reset email to {user.email}")
            # Still return success to user for security
        
        logger.info(f"Password reset email sent to {user.email}")
        
        return {
            "success": True,
            "message": "If an account with that email exists, a password reset link has been sent."
        }
        
    except Exception as e:
        logger.error(f"Error in forgot_password: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred. Please try again later.")

@router.post("/api/auth/verify-reset-token")
async def verify_reset_token(request: VerifyResetTokenRequest, db: Session = Depends(get_db)):
    """Verify if reset token is valid"""
    try:
        user = db.query(User).filter(
            User.password_reset_token == request.token
        ).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if token is expired
        if user.password_reset_expires < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        return {
            "success": True,
            "email": user.email,
            "message": "Token is valid"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in verify_reset_token: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred. Please try again later.")

@router.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using valid token"""
    try:
        # Validate password strength
        if len(request.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # Find user by reset token
        user = db.query(User).filter(
            User.password_reset_token == request.token
        ).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if token is expired
        if user.password_reset_expires < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Update password
        user.hashed_password = get_password_hash(request.new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # Send confirmation email
        send_password_reset_success_email(
            to_email=user.email,
            username=user.username
        )
        
        logger.info(f"Password reset successful for user: {user.email}")
        
        return {
            "success": True,
            "message": "Password has been reset successfully. You can now login with your new password."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred. Please try again later.")
