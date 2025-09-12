from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from database import get_db
from models import User
from email_service import (
    generate_verification_token, get_verification_expiry, send_verification_email,
    generate_otp_code, get_otp_expiry, send_otp_verification_email, send_verification_with_both_options
)
import uuid

class ResendVerificationRequest(BaseModel):
    email: EmailStr
    method: str = "both"  # "link", "otp", or "both"

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class VerifyEmailResponse(BaseModel):
    message: str
    user_id: str

class VerifyOTPResponse(BaseModel):
    message: str
    user_id: str

def get_email_verification_routes():
    router = APIRouter()
    
    @router.post("/api/auth/verify-email/{token}")
    async def verify_email(token: str, db: Session = Depends(get_db)):
        """Verify email using verification token"""
        # Find user with this verification token
        user = db.query(User).filter(
            User.email_verification_token == token,
            User.email_verification_expires > datetime.utcnow(),
            User.is_email_verified == False
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        # Verify the email
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        user.email_otp_code = None  # Clear OTP as well
        user.email_otp_expires = None
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        return VerifyEmailResponse(
            message="Email verified successfully! You can now log in to your account.",
            user_id=user.id
        )
    
    @router.post("/api/auth/verify-otp")
    async def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
        """Verify email using OTP code"""
        # Find user with this email and valid OTP
        user = db.query(User).filter(
            User.email == request.email,
            User.email_otp_code == request.otp_code,
            User.email_otp_expires > datetime.utcnow(),
            User.is_email_verified == False
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
        
        # Verify the email
        user.is_email_verified = True
        user.email_verification_token = None  # Clear token as well
        user.email_verification_expires = None
        user.email_otp_code = None
        user.email_otp_expires = None
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        
        return VerifyOTPResponse(
            message="Email verified successfully using OTP! You can now log in to your account.",
            user_id=user.id
        )
    
    @router.post("/api/auth/resend-verification")
    async def resend_verification_email(
        request: ResendVerificationRequest, 
        db: Session = Depends(get_db)
    ):
        """Resend verification email"""
        # Find user by email
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already verified"
            )
        
        # Generate new verification token
        verification_token = generate_verification_token()
        user.email_verification_token = verification_token
        user.email_verification_expires = get_verification_expiry()
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Send verification email
        email_sent = send_verification_email(
            user.email, 
            user.username or user.full_name or "User", 
            verification_token
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )
        
        return {
            "message": "Verification email sent successfully. Please check your inbox.",
            "email": user.email
        }
    
    @router.get("/api/auth/verification-status/{email}")
    async def get_verification_status(email: str, db: Session = Depends(get_db)):
        """Get email verification status"""
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "email": user.email,
            "is_verified": user.is_email_verified,
            "verification_expires": user.email_verification_expires.isoformat() if user.email_verification_expires else None
        }
    
    return router