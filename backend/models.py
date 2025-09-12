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
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String, nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    email_otp_code = Column(String, nullable=True)
    email_otp_expires = Column(DateTime, nullable=True)
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
    
    # New optional fields for enhanced tool information
    domain_website = Column(String)  # Company domain/website
    linkedin_url = Column(String)  # LinkedIn profile URL
    founded_year = Column(Integer)  # Year company was founded
    about_section = Column(Text)  # Detailed about section
    founders = Column(JSON)  # List of founders with details
    latest_news = Column(Text)  # Latest news about the tool/company
    latest_feeds = Column(JSON)  # Latest feeds/updates
    job_openings = Column(JSON)  # Current job openings
    revenue = Column(String)  # Revenue information
    locations = Column(JSON)  # Company locations
    company_size = Column(String)  # Number of employees
    funding_info = Column(JSON)  # Funding rounds and amounts
    tech_stack = Column(JSON)  # Technologies used
    integrations = Column(JSON)  # Available integrations
    languages_supported = Column(JSON)  # Supported languages
    target_audience = Column(JSON)  # Target user groups
    use_cases = Column(JSON)  # Common use cases
    alternatives = Column(JSON)  # Alternative tools
    local_logo_path = Column(String)  # Path to local logo file
    
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

# Comment and Like Models for Blogs
class BlogComment(Base):
    __tablename__ = "blog_comments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_id = Column(String, ForeignKey('blogs.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    parent_id = Column(String, ForeignKey('blog_comments.id'))  # For nested comments/replies
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    blog = relationship("Blog", back_populates="comments")
    user = relationship("User")
    parent = relationship("BlogComment", remote_side=[id])
    replies = relationship("BlogComment", cascade="all, delete-orphan")

class BlogLike(Base):
    __tablename__ = "blog_likes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_id = Column(String, ForeignKey('blogs.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    blog = relationship("Blog", back_populates="likes")
    user = relationship("User")

class BlogBookmark(Base):
    __tablename__ = "blog_bookmarks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    blog_id = Column(String, ForeignKey('blogs.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    blog = relationship("Blog", back_populates="bookmarks")
    user = relationship("User")

# Comment and Like Models for Tools
class ToolComment(Base):
    __tablename__ = "tool_comments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_id = Column(String, ForeignKey('tools.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    parent_id = Column(String, ForeignKey('tool_comments.id'))  # For nested comments/replies
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tool = relationship("Tool", back_populates="comments")
    user = relationship("User")
    parent = relationship("ToolComment", remote_side=[id])
    replies = relationship("ToolComment", cascade="all, delete-orphan")

class ToolLike(Base):
    __tablename__ = "tool_likes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_id = Column(String, ForeignKey('tools.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tool = relationship("Tool", back_populates="likes")
    user = relationship("User")