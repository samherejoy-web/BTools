from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from database import get_db
from models import User, Blog, Review, Tool
from auth import get_password_hash, verify_password, create_access_token, get_current_user
import uuid
from datetime import datetime
import os
import shutil

security = HTTPBearer()

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime
    profile_image: Optional[str]
    bio: Optional[str]

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None

def get_user_routes():
    router = APIRouter()
    
    @router.post("/api/auth/register", response_model=dict)
    async def register(user: UserCreate, db: Session = Depends(get_db)):
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user.email) | (User.username == user.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            id=str(uuid.uuid4()),
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role="user"
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(data={"sub": db_user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=db_user.id,
                email=db_user.email,
                username=db_user.username,
                full_name=db_user.full_name,
                role=db_user.role,
                is_active=db_user.is_active,
                created_at=db_user.created_at,
                profile_image=db_user.profile_image,
                bio=db_user.bio
            )
        }
    
    @router.post("/api/auth/login", response_model=dict)
    async def login(user: UserLogin, db: Session = Depends(get_db)):
        db_user = db.query(User).filter(User.email == user.email).first()
        
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not db_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token = create_access_token(data={"sub": db_user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=db_user.id,
                email=db_user.email,
                username=db_user.username,
                full_name=db_user.full_name,
                role=db_user.role,
                is_active=db_user.is_active,
                created_at=db_user.created_at,
                profile_image=db_user.profile_image,
                bio=db_user.bio
            )
        }
    
    @router.get("/api/auth/me", response_model=UserResponse)
    async def get_current_user_info(current_user: User = Depends(get_current_user)):
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            full_name=current_user.full_name,
            role=current_user.role,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            profile_image=current_user.profile_image,
            bio=current_user.bio
        )
    
    @router.put("/api/user/profile", response_model=UserResponse)
    async def update_profile(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(current_user, field, value)
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            username=current_user.username,
            full_name=current_user.full_name,
            role=current_user.role,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            profile_image=current_user.profile_image,
            bio=current_user.bio
        )
    
    @router.post("/api/user/upload-avatar")
    async def upload_avatar(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads/avatars", exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/avatars/{filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update user profile
        current_user.profile_image = f"/uploads/avatars/{filename}"
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Avatar uploaded successfully", "avatar_url": current_user.profile_image}
    
    @router.get("/api/user/dashboard")
    async def get_user_dashboard(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Get user statistics
        blog_count = db.query(Blog).filter(Blog.author_id == current_user.id).count()
        published_blogs = db.query(Blog).filter(
            Blog.author_id == current_user.id,
            Blog.status == "published"
        ).count()
        draft_blogs = db.query(Blog).filter(
            Blog.author_id == current_user.id,
            Blog.status == "draft"
        ).count()
        review_count = db.query(Review).filter(Review.user_id == current_user.id).count()
        
        # Get recent blogs
        recent_blogs = db.query(Blog).filter(
            Blog.author_id == current_user.id
        ).order_by(Blog.updated_at.desc()).limit(5).all()
        
        # Get favorite tools count
        favorite_tools_count = len(current_user.favorite_tools)
        
        return {
            "user": UserResponse(
                id=current_user.id,
                email=current_user.email,
                username=current_user.username,
                full_name=current_user.full_name,
                role=current_user.role,
                is_active=current_user.is_active,
                created_at=current_user.created_at,
                profile_image=current_user.profile_image,
                bio=current_user.bio
            ),
            "stats": {
                "total_blogs": blog_count,
                "published_blogs": published_blogs,
                "draft_blogs": draft_blogs,
                "total_reviews": review_count,
                "favorite_tools": favorite_tools_count
            },
            "recent_blogs": [
                {
                    "id": blog.id,
                    "title": blog.title,
                    "status": blog.status,
                    "updated_at": blog.updated_at,
                    "view_count": blog.view_count
                } for blog in recent_blogs
            ]
        }
    
    return router