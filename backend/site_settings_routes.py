from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from database import get_db
from models import User, SiteSettings
from auth import get_current_superadmin
import uuid
from datetime import datetime

router = APIRouter()

class SiteSettingCreate(BaseModel):
    setting_key: str
    setting_value: str
    setting_type: str = "text"
    description: Optional[str] = None
    is_public: bool = True

class SiteSettingUpdate(BaseModel):
    setting_value: Optional[str] = None
    setting_type: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class BulkSettingsUpdate(BaseModel):
    settings: Dict[str, str]  # key-value pairs

# Public endpoint for getting public site settings
@router.get("/api/site-settings")
async def get_public_site_settings(
    db: Session = Depends(get_db)
):
    """Get public site settings (for frontend display)"""
    
    settings = db.query(SiteSettings).filter(
        SiteSettings.is_public == True
    ).all()
    
    return {
        setting.setting_key: setting.setting_value 
        for setting in settings
    }

@router.get("/api/site-settings/{setting_key}")
async def get_site_setting(
    setting_key: str,
    db: Session = Depends(get_db)
):
    """Get a specific public site setting"""
    
    setting = db.query(SiteSettings).filter(
        SiteSettings.setting_key == setting_key,
        SiteSettings.is_public == True
    ).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")
    
    return {
        "key": setting.setting_key,
        "value": setting.setting_value,
        "type": setting.setting_type
    }

# SuperAdmin endpoints for managing site settings
@router.get("/api/superadmin/site-settings")
async def get_all_site_settings(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all site settings for admin management"""
    
    settings = db.query(SiteSettings).order_by(SiteSettings.setting_key).all()
    
    return [
        {
            "id": setting.id,
            "setting_key": setting.setting_key,
            "setting_value": setting.setting_value,
            "setting_type": setting.setting_type,
            "description": setting.description,
            "is_public": setting.is_public,
            "created_at": setting.created_at,
            "updated_at": setting.updated_at
        } for setting in settings
    ]

@router.get("/api/superadmin/site-settings/{setting_key}")
async def get_site_setting_admin(
    setting_key: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get a specific site setting for editing"""
    
    setting = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_key).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")
    
    return {
        "id": setting.id,
        "setting_key": setting.setting_key,
        "setting_value": setting.setting_value,
        "setting_type": setting.setting_type,
        "description": setting.description,
        "is_public": setting.is_public,
        "created_at": setting.created_at,
        "updated_at": setting.updated_at
    }

@router.post("/api/superadmin/site-settings")
async def create_site_setting(
    setting_data: SiteSettingCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create a new site setting"""
    
    # Check if setting key already exists
    existing_setting = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_data.setting_key).first()
    if existing_setting:
        raise HTTPException(status_code=400, detail=f"Setting '{setting_data.setting_key}' already exists")
    
    setting = SiteSettings(
        id=str(uuid.uuid4()),
        setting_key=setting_data.setting_key,
        setting_value=setting_data.setting_value,
        setting_type=setting_data.setting_type,
        description=setting_data.description,
        is_public=setting_data.is_public
    )
    
    db.add(setting)
    db.commit()
    db.refresh(setting)
    
    return {"message": "Site setting created successfully", "setting_id": setting.id}

@router.put("/api/superadmin/site-settings/{setting_key}")
async def update_site_setting(
    setting_key: str,
    setting_update: SiteSettingUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update an existing site setting"""
    
    setting = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")
    
    # Update fields
    update_data = setting_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    
    setting.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Site setting updated successfully"}

@router.put("/api/superadmin/site-settings/bulk")
async def bulk_update_site_settings(
    bulk_update: BulkSettingsUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk update multiple site settings"""
    
    updated_count = 0
    errors = []
    
    for setting_key, setting_value in bulk_update.settings.items():
        try:
            setting = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_key).first()
            
            if setting:
                setting.setting_value = setting_value
                setting.updated_at = datetime.utcnow()
                updated_count += 1
            else:
                # Create new setting if it doesn't exist
                new_setting = SiteSettings(
                    id=str(uuid.uuid4()),
                    setting_key=setting_key,
                    setting_value=setting_value,
                    setting_type="text",
                    is_public=True
                )
                db.add(new_setting)
                updated_count += 1
        except Exception as e:
            errors.append(f"Error updating {setting_key}: {str(e)}")
    
    try:
        db.commit()
        return {
            "message": f"Successfully updated {updated_count} settings",
            "updated_count": updated_count,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@router.delete("/api/superadmin/site-settings/{setting_key}")
async def delete_site_setting(
    setting_key: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete a site setting"""
    
    setting = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{setting_key}' not found")
    
    db.delete(setting)
    db.commit()
    
    return {"message": "Site setting deleted successfully"}

# Predefined settings initialization endpoint
@router.post("/api/superadmin/site-settings/initialize")
async def initialize_default_settings(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Initialize default site settings"""
    
    default_settings = [
        {
            "setting_key": "company_name",
            "setting_value": "MarketMind AI",
            "setting_type": "text",
            "description": "Company name displayed on the site",
            "is_public": True
        },
        {
            "setting_key": "contact_email",
            "setting_value": "hello@marketmind.ai",
            "setting_type": "email",
            "description": "Main contact email address",
            "is_public": True
        },
        {
            "setting_key": "contact_address",
            "setting_value": "San Francisco, CA, United States",
            "setting_type": "text",
            "description": "Company address",
            "is_public": True
        },
        {
            "setting_key": "github_url",
            "setting_value": "https://github.com/marketmind",
            "setting_type": "url",
            "description": "GitHub profile URL",
            "is_public": True
        },
        {
            "setting_key": "linkedin_url",
            "setting_value": "https://linkedin.com/company/marketmind",
            "setting_type": "url",
            "description": "LinkedIn company page URL",
            "is_public": True
        },
        {
            "setting_key": "twitter_url",
            "setting_value": "https://twitter.com/marketmindai",
            "setting_type": "url",
            "description": "Twitter/X profile URL",
            "is_public": True
        },
        {
            "setting_key": "discord_url",
            "setting_value": "https://discord.gg/marketmind",
            "setting_type": "url",
            "description": "Discord server invitation URL",
            "is_public": True
        },
        {
            "setting_key": "phone_number",
            "setting_value": "+1 (555) 123-4567",
            "setting_type": "text",
            "description": "Contact phone number",
            "is_public": True
        }
    ]
    
    created_count = 0
    for setting_data in default_settings:
        # Check if setting already exists
        existing = db.query(SiteSettings).filter(SiteSettings.setting_key == setting_data["setting_key"]).first()
        if not existing:
            setting = SiteSettings(
                id=str(uuid.uuid4()),
                **setting_data
            )
            db.add(setting)
            created_count += 1
    
    db.commit()
    
    return {
        "message": f"Default settings initialized successfully",
        "created_count": created_count
    }