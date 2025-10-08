"""
URL Normalization Utilities for MarketMindAI
Handles URL normalization to ensure unique constraints
"""
import re
from urllib.parse import urlparse

def normalize_url(url):
    """
    Normalize URL by removing common prefixes for unique constraint checking
    
    Removes:
    - https://www.
    - http://www.
    - https://
    - http://
    - www.
    
    Args:
        url (str): The original URL
        
    Returns:
        str: Normalized URL without prefixes
    """
    if not url:
        return url
        
    # Convert to lowercase for consistent comparison
    normalized = url.lower().strip()
    
    # Remove trailing slash
    normalized = normalized.rstrip('/')
    
    # Remove protocol and www prefixes
    prefixes_to_remove = [
        'https://www.',
        'http://www.',
        'https://',
        'http://',
        'www.'
    ]
    
    for prefix in prefixes_to_remove:
        if normalized.startswith(prefix):
            normalized = normalized[len(prefix):]
            break
    
    return normalized

def get_display_url(url):
    """
    Get a clean display version of the URL
    
    Args:
        url (str): The original URL
        
    Returns:
        str: Clean URL for display purposes
    """
    if not url:
        return url
    
    # Ensure URL has protocol for proper parsing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        parsed = urlparse(url)
        # Return domain + path without trailing slash
        display_url = parsed.netloc + parsed.path
        return display_url.rstrip('/')
    except:
        return url

def validate_url_format(url):
    """
    Validate if URL has a proper format
    
    Args:
        url (str): URL to validate
        
    Returns:
        bool: True if valid format, False otherwise
    """
    if not url:
        return True  # Empty URLs are allowed
    
    # Basic URL pattern validation
    url_pattern = re.compile(
        r'^(?:http[s]?://)?'  # optional protocol
        r'(?:www\.)?'         # optional www
        r'[a-zA-Z0-9]'        # must start with alphanumeric
        r'[a-zA-Z0-9.-]*'     # domain characters
        r'\.[a-zA-Z]{2,}'     # TLD
        r'(?:/.*)?$'          # optional path
    )
    
    return bool(url_pattern.match(url.strip()))

def check_url_uniqueness(db, url, exclude_tool_id=None):
    """
    Check if normalized URL already exists in the database
    
    Args:
        db: Database session
        url (str): URL to check
        exclude_tool_id (str): Tool ID to exclude from check (for updates)
        
    Returns:
        bool: True if URL is unique, False if duplicate exists
    """
    if not url:
        return True
    
    from models import Tool
    
    normalized = normalize_url(url)
    
    # Query for existing tools with the same normalized URL
    query = db.query(Tool).filter(
        Tool.url.isnot(None)
    )
    
    # Exclude current tool if updating
    if exclude_tool_id:
        query = query.filter(Tool.id != exclude_tool_id)
    
    existing_tools = query.all()
    
    # Check if any existing tool has the same normalized URL
    for tool in existing_tools:
        if normalize_url(tool.url) == normalized:
            return False
    
    return True

def add_protocol_if_missing(url):
    """
    Add https:// protocol if missing from URL
    
    Args:
        url (str): URL that might be missing protocol
        
    Returns:
        str: URL with protocol
    """
    if not url:
        return url
    
    if not url.startswith(('http://', 'https://')):
        return 'https://' + url
    
    return url

def get_domain_from_url(url):
    """
    Extract domain from URL for display purposes
    
    Args:
        url (str): Full URL
        
    Returns:
        str: Domain only
    """
    if not url:
        return url
    
    try:
        # Ensure URL has protocol for parsing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        parsed = urlparse(url)
        domain = parsed.netloc
        
        # Remove www. prefix for display
        if domain.startswith('www.'):
            domain = domain[4:]
            
        return domain
    except:
        return url