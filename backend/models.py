from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Table, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

# Association tables for many-to-many relationships
user_tool_favorites = Table('user_tool_favorites', Base.metadata,
    Column('user_id', String, ForeignKey('users.id')),
    Column('tool_id', String, ForeignKey('tools.id'))
)

tool_categories = Table('tool_categories', Base.metadata,
    Column('tool_id', String, ForeignKey('tools.id')),
    Column('category_id', String, ForeignKey('categories.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="user")  # user, admin, superadmin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    profile_image = Column(String)
    bio = Column(Text)
    
    # Relationships
    blogs = relationship("Blog", back_populates="author")
    reviews = relationship("Review", back_populates="user")
    favorite_tools = relationship("Tool", secondary=user_tool_favorites, back_populates="favorited_by")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True)
    description = Column(Text)
    parent_id = Column(String, ForeignKey('categories.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    seo_title = Column(String)
    seo_description = Column(Text)
    seo_keywords = Column(String)
    
    # Relationships
    parent = relationship("Category", remote_side=[id])
    children = relationship("Category")
    tools = relationship("Tool", secondary=tool_categories, back_populates="categories")

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    description = Column(Text)
    short_description = Column(String)
    url = Column(String)
    logo_url = Column(String)
    screenshot_url = Column(String)
    pricing_type = Column(String)  # free, freemium, paid
    pricing_details = Column(JSON)
    features = Column(JSON)
    pros = Column(JSON)
    cons = Column(JSON)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    trending_score = Column(Float, default=0.0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    seo_title = Column(String)
    seo_description = Column(Text)
    seo_keywords = Column(String)
    json_ld = Column(JSON)
    
    # Relationships
    categories = relationship("Category", secondary=tool_categories, back_populates="tools")
    reviews = relationship("Review", back_populates="tool")
    favorited_by = relationship("User", secondary=user_tool_favorites, back_populates="favorite_tools")
    comments = relationship("ToolComment", back_populates="tool", cascade="all, delete-orphan")
    likes = relationship("ToolLike", back_populates="tool", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    tool_id = Column(String, ForeignKey('tools.id'), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String)
    content = Column(Text)
    pros = Column(JSON)
    cons = Column(JSON)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    tool = relationship("Tool", back_populates="reviews")

class Blog(Base):
    __tablename__ = "blogs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    content = Column(Text)
    excerpt = Column(Text)
    featured_image = Column(String)
    author_id = Column(String, ForeignKey('users.id'), nullable=False)
    status = Column(String, default="draft")  # draft, published, archived
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    reading_time = Column(Integer)  # in minutes
    tags = Column(JSON)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)
    seo_title = Column(String)
    seo_description = Column(Text)
    seo_keywords = Column(String)
    json_ld = Column(JSON)
    
    # Relationships
    author = relationship("User", back_populates="blogs")
    comments = relationship("BlogComment", back_populates="blog", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="blog", cascade="all, delete-orphan")
    bookmarks = relationship("BlogBookmark", back_populates="blog", cascade="all, delete-orphan")

class SeoPage(Base):
    __tablename__ = "seo_pages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    page_path = Column(String, nullable=False, unique=True)
    title = Column(String)
    description = Column(Text)
    keywords = Column(String)
    json_ld = Column(JSON)
    meta_tags = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)