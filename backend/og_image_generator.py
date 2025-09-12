"""
OpenGraph Image Generator for Dynamic Social Media Images
Generates optimized OG images for tools, blogs, and pages
"""

from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
import os
import textwrap
import logging
from typing import Optional, Dict, Any
import hashlib
from datetime import datetime

class OGImageGenerator:
    """Advanced OpenGraph image generator with template support"""
    
    def __init__(self, cache_dir: str = "og_cache"):
        self.cache_dir = cache_dir
        self.base_width = 1200
        self.base_height = 630
        self.brand_color = (59, 130, 246)  # Blue
        self.text_color = (31, 41, 55)     # Dark gray
        self.bg_color = (255, 255, 255)    # White
        
        # Create cache directory
        os.makedirs(cache_dir, exist_ok=True)
        
        # Try to load fonts
        self.title_font = self._load_font("assets/fonts/Inter-Bold.ttf", 64) or self._get_default_font(64)
        self.subtitle_font = self._load_font("assets/fonts/Inter-Medium.ttf", 32) or self._get_default_font(32)
        self.brand_font = self._load_font("assets/fonts/Inter-SemiBold.ttf", 28) or self._get_default_font(28)
        
    def _load_font(self, font_path: str, size: int) -> Optional[ImageFont.FreeTypeFont]:
        """Load custom font or return None if not available"""
        try:
            if os.path.exists(font_path):
                return ImageFont.truetype(font_path, size)
        except Exception as e:
            logging.warning(f"Could not load font {font_path}: {e}")
        return None
    
    def _get_default_font(self, size: int) -> ImageFont.ImageFont:
        """Get default system font"""
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            return ImageFont.load_default()
    
    def generate_tool_og_image(self, tool_data: Dict[str, Any]) -> str:
        """Generate OpenGraph image for a tool"""
        
        # Create cache key
        cache_key = self._create_cache_key("tool", tool_data)
        cached_path = os.path.join(self.cache_dir, f"{cache_key}.jpg")
        
        # Return cached image if exists and recent
        if os.path.exists(cached_path) and self._is_cache_valid(cached_path):
            return cached_path
        
        # Create new image
        image = Image.new('RGB', (self.base_width, self.base_height), self.bg_color)
        draw = ImageDraw.Draw(image)
        
        # Draw background gradient
        self._draw_gradient_background(draw)
        
        # Add tool logo if available
        logo_x = 80
        logo_y = 80
        logo_size = 120
        
        if tool_data.get('logo_url') or tool_data.get('local_logo_path'):
            try:
                logo_img = self._load_logo_image(tool_data)
                if logo_img:
                    logo_img = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                    image.paste(logo_img, (logo_x, logo_y))
            except Exception as e:
                logging.warning(f"Could not load tool logo: {e}")
                # Draw placeholder logo
                self._draw_placeholder_logo(draw, logo_x, logo_y, logo_size)
        else:
            self._draw_placeholder_logo(draw, logo_x, logo_y, logo_size)
        
        # Add tool name (title)
        title_x = logo_x + logo_size + 40
        title_y = logo_y
        max_title_width = self.base_width - title_x - 80
        
        tool_name = tool_data.get('name', 'Business Tool')
        wrapped_title = self._wrap_text(tool_name, self.title_font, max_title_width)
        
        for i, line in enumerate(wrapped_title[:2]):  # Max 2 lines
            draw.text((title_x, title_y + i * 70), line, fill=self.text_color, font=self.title_font)
        
        # Add tool description
        desc_y = logo_y + logo_size + 40
        max_desc_width = self.base_width - 160
        
        description = tool_data.get('short_description') or tool_data.get('description', '')
        if description:
            # Clean HTML and limit length
            clean_desc = self._clean_html(description)[:200] + "..." if len(description) > 200 else description
            wrapped_desc = self._wrap_text(clean_desc, self.subtitle_font, max_desc_width)
            
            for i, line in enumerate(wrapped_desc[:3]):  # Max 3 lines
                draw.text((80, desc_y + i * 40), line, fill=(107, 114, 128), font=self.subtitle_font)
        
        # Add category/pricing info
        info_y = desc_y + 140
        category = tool_data.get('category', '')
        pricing = tool_data.get('pricing_type', '')
        
        if category:
            draw.text((80, info_y), f"Category: {category}", fill=self.brand_color, font=self.brand_font)
        
        if pricing:
            pricing_text = f"Pricing: {pricing.title()}"
            draw.text((80, info_y + 35), pricing_text, fill=self.brand_color, font=self.brand_font)
        
        # Add rating if available
        rating = tool_data.get('rating')
        if rating:
            rating_text = f"★ {rating:.1f}"
            rating_width = draw.textbbox((0, 0), rating_text, font=self.brand_font)[2]
            draw.text((self.base_width - rating_width - 80, info_y), rating_text, 
                     fill=(251, 191, 36), font=self.brand_font)  # Yellow
        
        # Add MarketMind branding
        self._add_branding(draw)
        
        # Save image
        image.save(cached_path, 'JPEG', quality=85, optimize=True)
        
        return cached_path
    
    def generate_blog_og_image(self, blog_data: Dict[str, Any]) -> str:
        """Generate OpenGraph image for a blog post"""
        
        # Create cache key
        cache_key = self._create_cache_key("blog", blog_data)
        cached_path = os.path.join(self.cache_dir, f"{cache_key}.jpg")
        
        # Return cached image if exists and recent
        if os.path.exists(cached_path) and self._is_cache_valid(cached_path):
            return cached_path
        
        # Create new image
        image = Image.new('RGB', (self.base_width, self.base_height), self.bg_color)
        draw = ImageDraw.Draw(image)
        
        # Draw background
        self._draw_gradient_background(draw, variant="blog")
        
        # Add featured image if available
        featured_img_height = 200
        if blog_data.get('featured_image'):
            try:
                featured_img = self._load_featured_image(blog_data['featured_image'])
                if featured_img:
                    # Resize and crop to fit
                    featured_img = self._resize_and_crop(featured_img, self.base_width, featured_img_height)
                    image.paste(featured_img, (0, 0))
            except Exception as e:
                logging.warning(f"Could not load featured image: {e}")
                # Draw placeholder
                draw.rectangle([0, 0, self.base_width, featured_img_height], fill=(243, 244, 246))
        else:
            # Draw placeholder background
            draw.rectangle([0, 0, self.base_width, featured_img_height], fill=(243, 244, 246))
        
        # Add dark overlay for text readability
        overlay = Image.new('RGBA', (self.base_width, self.base_height), (0, 0, 0, 100))
        image = Image.alpha_composite(image.convert('RGBA'), overlay).convert('RGB')
        draw = ImageDraw.Draw(image)
        
        # Add blog title
        title_y = featured_img_height + 40
        max_title_width = self.base_width - 160
        
        blog_title = blog_data.get('title', 'Blog Post')
        wrapped_title = self._wrap_text(blog_title, self.title_font, max_title_width)
        
        for i, line in enumerate(wrapped_title[:2]):  # Max 2 lines
            draw.text((80, title_y + i * 70), line, fill=self.text_color, font=self.title_font)
        
        # Add excerpt/description
        excerpt_y = title_y + 150
        excerpt = blog_data.get('excerpt') or blog_data.get('seo_description', '')
        if excerpt:
            clean_excerpt = self._clean_html(excerpt)[:150] + "..." if len(excerpt) > 150 else excerpt
            wrapped_excerpt = self._wrap_text(clean_excerpt, self.subtitle_font, max_title_width)
            
            for i, line in enumerate(wrapped_excerpt[:2]):  # Max 2 lines
                draw.text((80, excerpt_y + i * 40), line, fill=(107, 114, 128), font=self.subtitle_font)
        
        # Add author and date
        author_y = excerpt_y + 100
        author = blog_data.get('author_name', 'MarketMind Team')
        published_date = blog_data.get('published_at', blog_data.get('created_at', ''))
        
        if published_date:
            try:
                if isinstance(published_date, str):
                    date_obj = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
                else:
                    date_obj = published_date
                date_str = date_obj.strftime('%B %d, %Y')
            except:
                date_str = 'Recent'
        else:
            date_str = 'Recent'
        
        draw.text((80, author_y), f"By {author} • {date_str}", fill=self.brand_color, font=self.brand_font)
        
        # Add reading time if available
        reading_time = blog_data.get('reading_time')
        if reading_time:
            reading_text = f"{reading_time} min read"
            reading_width = draw.textbbox((0, 0), reading_text, font=self.brand_font)[2]
            draw.text((self.base_width - reading_width - 80, author_y), reading_text, 
                     fill=(107, 114, 128), font=self.brand_font)
        
        # Add MarketMind branding
        self._add_branding(draw)
        
        # Save image
        image.save(cached_path, 'JPEG', quality=85, optimize=True)
        
        return cached_path
    
    def generate_page_og_image(self, page_data: Dict[str, Any]) -> str:
        """Generate OpenGraph image for general pages"""
        
        # Create cache key
        cache_key = self._create_cache_key("page", page_data)
        cached_path = os.path.join(self.cache_dir, f"{cache_key}.jpg")
        
        # Return cached image if exists and recent
        if os.path.exists(cached_path) and self._is_cache_valid(cached_path):
            return cached_path
        
        # Create new image
        image = Image.new('RGB', (self.base_width, self.base_height), self.bg_color)
        draw = ImageDraw.Draw(image)
        
        # Draw background
        self._draw_gradient_background(draw, variant="page")
        
        # Add large centered title
        title = page_data.get('title', 'MarketMind')
        max_title_width = self.base_width - 160
        
        # Use larger font for page titles
        large_title_font = self._load_font("assets/fonts/Inter-Bold.ttf", 80) or self._get_default_font(80)
        wrapped_title = self._wrap_text(title, large_title_font, max_title_width)
        
        # Center the title vertically
        total_title_height = len(wrapped_title) * 90
        start_y = (self.base_height - total_title_height) // 2 - 50
        
        for i, line in enumerate(wrapped_title[:2]):  # Max 2 lines
            line_width = draw.textbbox((0, 0), line, font=large_title_font)[2]
            x_position = (self.base_width - line_width) // 2
            draw.text((x_position, start_y + i * 90), line, fill=self.text_color, font=large_title_font)
        
        # Add subtitle/description
        description = page_data.get('description', '')
        if description:
            desc_y = start_y + total_title_height + 40
            clean_desc = self._clean_html(description)[:120] + "..." if len(description) > 120 else description
            wrapped_desc = self._wrap_text(clean_desc, self.subtitle_font, max_title_width)
            
            for i, line in enumerate(wrapped_desc[:2]):  # Max 2 lines
                line_width = draw.textbbox((0, 0), line, font=self.subtitle_font)[2]
                x_position = (self.base_width - line_width) // 2
                draw.text((x_position, desc_y + i * 40), line, fill=(107, 114, 128), font=self.subtitle_font)
        
        # Add MarketMind branding
        self._add_branding(draw)
        
        # Save image
        image.save(cached_path, 'JPEG', quality=85, optimize=True)
        
        return cached_path
    
    def _draw_gradient_background(self, draw: ImageDraw.Draw, variant: str = "default"):
        """Draw subtle gradient background"""
        
        if variant == "blog":
            # Subtle blue gradient for blogs
            for y in range(self.base_height):
                alpha = int(255 * (1 - y / self.base_height) * 0.1)
                color = (59, 130, 246, alpha)  # Blue with varying alpha
                draw.line([(0, y), (self.base_width, y)], fill=color)
        elif variant == "page":
            # Subtle gray gradient for pages
            for y in range(self.base_height):
                alpha = int(255 * (1 - y / self.base_height) * 0.05)
                color = (107, 114, 128, alpha)  # Gray with varying alpha
                draw.line([(0, y), (self.base_width, y)], fill=color)
        else:
            # Default subtle gradient
            for y in range(self.base_height):
                alpha = int(255 * (1 - y / self.base_height) * 0.03)
                color = (59, 130, 246, alpha)  # Very subtle blue
                draw.line([(0, y), (self.base_width, y)], fill=color)
    
    def _draw_placeholder_logo(self, draw: ImageDraw.Draw, x: int, y: int, size: int):
        """Draw placeholder logo when actual logo is not available"""
        
        # Draw circle background
        draw.ellipse([x, y, x + size, y + size], fill=self.brand_color, outline=(31, 41, 55), width=3)
        
        # Draw "MT" text (MarketMind Tool)
        placeholder_font = self._load_font("assets/fonts/Inter-Bold.ttf", size//3) or self._get_default_font(size//3)
        text = "MT"
        text_bbox = draw.textbbox((0, 0), text, font=placeholder_font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        text_x = x + (size - text_width) // 2
        text_y = y + (size - text_height) // 2
        
        draw.text((text_x, text_y), text, fill=(255, 255, 255), font=placeholder_font)
    
    def _add_branding(self, draw: ImageDraw.Draw):
        """Add MarketMind branding to bottom right"""
        
        brand_text = "MarketMind"
        brand_width = draw.textbbox((0, 0), brand_text, font=self.brand_font)[2]
        
        # Position at bottom right
        brand_x = self.base_width - brand_width - 40
        brand_y = self.base_height - 50
        
        draw.text((brand_x, brand_y), brand_text, fill=self.brand_color, font=self.brand_font)
        
        # Add small logo/icon
        icon_size = 24
        icon_x = brand_x - icon_size - 15
        icon_y = brand_y + 2
        
        draw.ellipse([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], 
                    fill=self.brand_color, outline=None)
        
        # Add "M" in the circle
        m_font = self._get_default_font(14)
        draw.text((icon_x + 7, icon_y + 3), "M", fill=(255, 255, 255), font=m_font)
    
    def _load_logo_image(self, tool_data: Dict[str, Any]) -> Optional[Image.Image]:
        """Load tool logo from URL or local path"""
        
        logo_url = tool_data.get('logo_url')
        local_path = tool_data.get('local_logo_path')
        
        if logo_url:
            response = requests.get(logo_url, timeout=10, stream=True)
            response.raise_for_status()
            return Image.open(BytesIO(response.content)).convert('RGBA')
        elif local_path:
            local_full_path = os.path.join("uploads/logos", local_path)
            if os.path.exists(local_full_path):
                return Image.open(local_full_path).convert('RGBA')
        
        return None
    
    def _load_featured_image(self, image_url: str) -> Optional[Image.Image]:
        """Load featured image from URL"""
        
        response = requests.get(image_url, timeout=10, stream=True)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert('RGB')
    
    def _resize_and_crop(self, image: Image.Image, target_width: int, target_height: int) -> Image.Image:
        """Resize and crop image to fit target dimensions"""
        
        # Calculate aspect ratios
        img_ratio = image.width / image.height
        target_ratio = target_width / target_height
        
        if img_ratio > target_ratio:
            # Image is wider, crop width
            new_height = target_height
            new_width = int(new_height * img_ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Crop from center
            left = (new_width - target_width) // 2
            image = image.crop((left, 0, left + target_width, target_height))
        else:
            # Image is taller, crop height
            new_width = target_width
            new_height = int(new_width / img_ratio)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Crop from center
            top = (new_height - target_height) // 2
            image = image.crop((0, top, target_width, top + target_height))
        
        return image
    
    def _wrap_text(self, text: str, font: ImageFont.ImageFont, max_width: int) -> list:
        """Wrap text to fit within max width"""
        
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            test_width = font.getbbox(test_line)[2]
            
            if test_width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    # Single word is too long, break it
                    lines.append(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def _clean_html(self, text: str) -> str:
        """Remove HTML tags from text"""
        import re
        clean = re.sub('<.*?>', '', text)
        return clean.strip()
    
    def _create_cache_key(self, image_type: str, data: Dict[str, Any]) -> str:
        """Create cache key from data"""
        
        # Create hash from relevant data
        cache_data = {
            'type': image_type,
            'title': data.get('title', ''),
            'name': data.get('name', ''),
            'description': data.get('description', ''),
            'logo_url': data.get('logo_url', ''),
            'featured_image': data.get('featured_image', ''),
            'updated_at': data.get('updated_at', '')
        }
        
        cache_string = str(sorted(cache_data.items()))
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_path: str, max_age_hours: int = 24) -> bool:
        """Check if cached image is still valid"""
        
        if not os.path.exists(cache_path):
            return False
        
        # Check file age
        file_age = datetime.now().timestamp() - os.path.getmtime(cache_path)
        max_age_seconds = max_age_hours * 3600
        
        return file_age < max_age_seconds
    
    def cleanup_old_cache(self, max_age_days: int = 7):
        """Clean up old cached images"""
        
        cutoff_time = datetime.now().timestamp() - (max_age_days * 24 * 3600)
        
        for filename in os.listdir(self.cache_dir):
            file_path = os.path.join(self.cache_dir, filename)
            if os.path.isfile(file_path) and os.path.getmtime(file_path) < cutoff_time:
                try:
                    os.remove(file_path)
                    logging.info(f"Removed old cache file: {filename}")
                except Exception as e:
                    logging.warning(f"Could not remove cache file {filename}: {e}")

# Convenience functions
def generate_tool_og_image(tool_data: Dict[str, Any], cache_dir: str = "og_cache") -> str:
    """Generate OG image for a tool"""
    generator = OGImageGenerator(cache_dir)
    return generator.generate_tool_og_image(tool_data)

def generate_blog_og_image(blog_data: Dict[str, Any], cache_dir: str = "og_cache") -> str:
    """Generate OG image for a blog"""
    generator = OGImageGenerator(cache_dir)
    return generator.generate_blog_og_image(blog_data)

def generate_page_og_image(page_data: Dict[str, Any], cache_dir: str = "og_cache") -> str:
    """Generate OG image for a page"""
    generator = OGImageGenerator(cache_dir)
    return generator.generate_page_og_image(page_data)