from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from database import get_db
from models import User, FreeTool
from auth import get_current_superadmin
import uuid
from datetime import datetime

router = APIRouter()

class FreeToolCreate(BaseModel):
    name: str
    description: str
    url: str
    icon_url: Optional[str] = None
    category: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    order_index: int = 0

class FreeToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    icon_url: Optional[str] = None
    category: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None

# Public endpoints for free tools
@router.get("/api/free-tools")
async def get_free_tools(
    category: Optional[str] = Query(None, description="Filter by category"),
    featured_only: bool = Query(False, description="Get only featured tools"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get free tools (public endpoint)"""
    
    query = db.query(FreeTool).filter(FreeTool.is_active == True)
    
    if category:
        query = query.filter(FreeTool.category == category)
    
    if featured_only:
        query = query.filter(FreeTool.is_featured == True)
    
    tools = query.order_by(FreeTool.order_index, FreeTool.name).offset(skip).limit(limit).all()
    
    return [
        {
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "url": tool.url,
            "icon_url": tool.icon_url,
            "category": tool.category,
            "is_featured": tool.is_featured,
            "order_index": tool.order_index
        } for tool in tools
    ]

@router.get("/api/free-tools/categories")
async def get_free_tool_categories(
    db: Session = Depends(get_db)
):
    """Get all free tool categories"""
    
    categories = db.query(FreeTool.category).filter(
        FreeTool.is_active == True,
        FreeTool.category.isnot(None)
    ).distinct().all()
    
    return [category[0] for category in categories if category[0]]

@router.get("/api/free-tools/{tool_id}")
async def get_free_tool(
    tool_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific free tool"""
    
    tool = db.query(FreeTool).filter(
        FreeTool.id == tool_id,
        FreeTool.is_active == True
    ).first()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    return {
        "id": tool.id,
        "name": tool.name,
        "description": tool.description,
        "url": tool.url,
        "icon_url": tool.icon_url,
        "category": tool.category,
        "is_featured": tool.is_featured,
        "order_index": tool.order_index
    }

# SuperAdmin endpoints for managing free tools
@router.get("/api/superadmin/free-tools")
async def get_all_free_tools_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get all free tools with admin privileges"""
    
    query = db.query(FreeTool)
    
    if category:
        query = query.filter(FreeTool.category == category)
    
    if search:
        query = query.filter(
            FreeTool.name.contains(search) |
            FreeTool.description.contains(search)
        )
    
    tools = query.order_by(FreeTool.order_index, FreeTool.name).offset(skip).limit(limit).all()
    
    return [
        {
            "id": tool.id,
            "name": tool.name,
            "description": tool.description,
            "url": tool.url,
            "icon_url": tool.icon_url,
            "category": tool.category,
            "is_featured": tool.is_featured,
            "is_active": tool.is_active,
            "order_index": tool.order_index,
            "created_at": tool.created_at,
            "updated_at": tool.updated_at
        } for tool in tools
    ]

@router.get("/api/superadmin/free-tools/{tool_id}")
async def get_free_tool_admin(
    tool_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get a specific free tool for editing"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    return {
        "id": tool.id,
        "name": tool.name,
        "description": tool.description,
        "url": tool.url,
        "icon_url": tool.icon_url,
        "category": tool.category,
        "is_featured": tool.is_featured,
        "is_active": tool.is_active,
        "order_index": tool.order_index,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at
    }

@router.post("/api/superadmin/free-tools")
async def create_free_tool(
    tool_data: FreeToolCreate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Create a new free tool"""
    
    tool = FreeTool(
        id=str(uuid.uuid4()),
        name=tool_data.name,
        description=tool_data.description,
        url=tool_data.url,
        icon_url=tool_data.icon_url,
        category=tool_data.category,
        is_featured=tool_data.is_featured,
        is_active=tool_data.is_active,
        order_index=tool_data.order_index
    )
    
    db.add(tool)
    db.commit()
    db.refresh(tool)
    
    return {"message": "Free tool created successfully", "tool_id": tool.id}

@router.put("/api/superadmin/free-tools/{tool_id}")
async def update_free_tool(
    tool_id: str,
    tool_update: FreeToolUpdate,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Update a free tool"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    # Update fields
    update_data = tool_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tool, field, value)
    
    tool.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Free tool updated successfully"}

@router.delete("/api/superadmin/free-tools/{tool_id}")
async def delete_free_tool(
    tool_id: str,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Delete a free tool"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    db.delete(tool)
    db.commit()
    
    return {"message": "Free tool deleted successfully"}

@router.put("/api/superadmin/free-tools/{tool_id}/reorder")
async def reorder_free_tool(
    tool_id: str,
    new_order_index: int,
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Reorder a free tool"""
    
    tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Free tool not found")
    
    tool.order_index = new_order_index
    tool.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Free tool reordered successfully"}

# Bulk operations
@router.post("/api/superadmin/free-tools/bulk-create")
async def bulk_create_free_tools(
    tools_data: List[FreeToolCreate],
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk create free tools"""
    
    created_tools = []
    errors = []
    
    for tool_data in tools_data:
        try:
            tool = FreeTool(
                id=str(uuid.uuid4()),
                name=tool_data.name,
                description=tool_data.description,
                url=tool_data.url,
                icon_url=tool_data.icon_url,
                category=tool_data.category,
                is_featured=tool_data.is_featured,
                is_active=tool_data.is_active,
                order_index=tool_data.order_index
            )
            
            db.add(tool)
            created_tools.append(tool_data.name)
            
        except Exception as e:
            errors.append(f"Error creating {tool_data.name}: {str(e)}")
    
    try:
        db.commit()
        return {
            "message": f"Successfully created {len(created_tools)} free tools",
            "created": created_tools,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk creation failed: {str(e)}")

@router.put("/api/superadmin/free-tools/bulk-update-order")
async def bulk_update_order(
    tool_orders: Dict[str, int],  # tool_id -> order_index
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk update tool ordering"""
    
    updated_count = 0
    errors = []
    
    for tool_id, order_index in tool_orders.items():
        try:
            tool = db.query(FreeTool).filter(FreeTool.id == tool_id).first()
            if tool:
                tool.order_index = order_index
                tool.updated_at = datetime.utcnow()
                updated_count += 1
            else:
                errors.append(f"Tool {tool_id} not found")
        except Exception as e:
            errors.append(f"Error updating {tool_id}: {str(e)}")
    
    try:
        db.commit()
        return {
            "message": f"Successfully updated order for {updated_count} tools",
            "updated_count": updated_count,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk order update failed: {str(e)}")

# Statistics and overview
@router.get("/api/superadmin/free-tools/stats")
async def get_free_tools_stats(
    current_superadmin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    """Get free tools statistics"""
    
    total_tools = db.query(FreeTool).count()
    active_tools = db.query(FreeTool).filter(FreeTool.is_active == True).count()
    featured_tools = db.query(FreeTool).filter(
        FreeTool.is_featured == True,
        FreeTool.is_active == True
    ).count()
    
    # Category breakdown
    category_breakdown = db.query(
        FreeTool.category,
        db.func.count(FreeTool.id).label('count')
    ).filter(FreeTool.is_active == True).group_by(FreeTool.category).all()
    
    return {
        "total_tools": total_tools,
        "active_tools": active_tools,
        "featured_tools": featured_tools,
        "inactive_tools": total_tools - active_tools,
        "category_breakdown": [
            {"category": category or "Uncategorized", "count": count}
            for category, count in category_breakdown
        ]
    }