from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import FreeTool
from auth import get_current_superadmin
import uuid
from datetime import datetime

router = APIRouter()

class FreeToolCreate(BaseModel):
    name: str
    link: str
    description: Optional[str] = None

class FreeToolUpdate(BaseModel):
    name: Optional[str] = None
    link: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

# Public endpoint to get active free tools
@router.get("/api/free-tools")
async def get_free_tools(
    limit: Optional[int] = Query(None, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all active free tools (public endpoint)"""
    
    query = db.query(FreeTool).filter(FreeTool.is_active == True).order_by(FreeTool.name)
    
    if limit:
        query = query.limit(limit)
    
    tools = query.all()
    
    return [
        {
            "id": tool.id,
            "name": tool.name,
            "link": tool.link,
            "description": tool.description,
            "created_at": tool.created_at
        } for tool in tools
    ]

# SuperAdmin endpoints
@router.get("/api/superadmin/free-tools")
async def get_all_free_tools_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    current_superadmin = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all free tools with admin privileges"""
    
    query = db.query(FreeTool)
    
    if search:
        query = query.filter(
            FreeTool.name.contains(search) | 
            FreeTool.description.contains(search) |
            FreeTool.link.contains(search)
        )
    
    tools = query.order_by(desc(FreeTool.created_at)).offset(skip).limit(limit).all()
    total = query.count()
    
    return {
        "tools": [
            {
                "id": tool.id,
                "name": tool.name,
                "link": tool.link,
                "description": tool.description,
                "is_active": tool.is_active,
                "created_at": tool.created_at,
                "updated_at": tool.updated_at
            } for tool in tools
        ],
        "total": total
    }

@router.post("/api/superadmin/free-tools")
async def create_free_tool(
    tool: FreeToolCreate,
    current_superadmin = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create new free tool"""
    
    # Check if tool with same name or link already exists
    existing_tool = db.query(FreeTool).filter(
        (FreeTool.name == tool.name) | (FreeTool.link == tool.link)
    ).first()
    
    if existing_tool:
        raise HTTPException(status_code=400, detail="Tool with this name or link already exists")
    
    db_tool = FreeTool(
        id=str(uuid.uuid4()),
        name=tool.name,
        link=tool.link,
        description=tool.description
    )
    
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    
    return {"message": "Free tool created successfully", "tool_id": db_tool.id}

@router.put("/api/superadmin/free-tools/{tool_id}")
async def update_free_tool(
    tool_id: str,
    tool_update: FreeToolUpdate,
    current_superadmin = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update free tool"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    # Check for conflicts if name or link is being updated
    update_data = tool_update.dict(exclude_unset=True)
    
    if "name" in update_data or "link" in update_data:
        existing_tool = db.query(FreeTool).filter(
            FreeTool.id != tool_id,
            (FreeTool.name == update_data.get("name", tool.name)) | 
            (FreeTool.link == update_data.get("link", tool.link))
        ).first()
        
        if existing_tool:
            raise HTTPException(status_code=400, detail="Tool with this name or link already exists")
    
    # Update fields
    for field, value in update_data.items():
        setattr(tool, field, value)
    
    tool.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Free tool updated successfully"}

@router.delete("/api/superadmin/free-tools/{tool_id}")
async def delete_free_tool(
    tool_id: str,
    current_superadmin = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete free tool"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    db.delete(tool)
    db.commit()
    
    return {"message": "Free tool deleted successfully"}

@router.get("/api/superadmin/free-tools/{tool_id}")
async def get_free_tool(
    tool_id: str,
    current_superadmin = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get specific free tool details"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    return {
        "id": tool.id,
        "name": tool.name,
        "link": tool.link,
        "description": tool.description,
        "is_active": tool.is_active,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at
    }