"""
JSON-LD (Structured Data) Generator for Tools and Blogs
Generates SEO-friendly structured data for better search engine visibility
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import json

class JSONLDGenerator:
    """Generate JSON-LD structured data for different content types"""
    
    BASE_URL = "https://marketmind.com"  # This should be configured from environment
    
    @classmethod
    def generate_tool_json_ld(cls, tool: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a tool
        Follows schema.org SoftwareApplication format
        """
        json_ld = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.get('name', ''),
            "description": tool.get('description', ''),
            "url": tool.get('url', ''),
            "applicationCategory": "Productivity Software",
            "operatingSystem": "Web, Windows, macOS, Linux",
            "offers": {
                "@type": "Offer",
                "price": "0" if tool.get('pricing_type') == 'free' else "varies",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": str(tool.get('rating', 0)),
                "reviewCount": str(tool.get('review_count', 0)),
                "bestRating": "5",
                "worstRating": "1"
            } if tool.get('rating') and tool.get('review_count', 0) > 0 else None,
            "provider": {
                "@type": "Organization",
                "name": "MarketMind",
                "url": cls.BASE_URL
            },
            "datePublished": tool.get('created_at', '').isoformat() if tool.get('created_at') else None,
            "dateModified": tool.get('updated_at', '').isoformat() if tool.get('updated_at') else None,
            "image": tool.get('logo_url', ''),
            "screenshot": tool.get('screenshot_url', ''),
            "featureList": tool.get('features', []),
            "review": []
        }
        
        # Add categories as keywords
        if tool.get('categories'):
            json_ld["keywords"] = [cat.get('name', '') for cat in tool['categories']]
        
        # Clean up None values
        return {k: v for k, v in json_ld.items() if v is not None}
    
    @classmethod
    def generate_blog_json_ld(cls, blog: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate JSON-LD structured data for a blog post
        Follows schema.org Article format
        """
        json_ld = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.get('title', ''),
            "description": blog.get('excerpt', ''),
            "articleBody": blog.get('content', ''),
            "url": f"{cls.BASE_URL}/blogs/{blog.get('slug', '')}",
            "datePublished": blog.get('published_at', '').isoformat() if blog.get('published_at') else None,
            "dateCreated": blog.get('created_at', '').isoformat() if blog.get('created_at') else None,
            "dateModified": blog.get('updated_at', '').isoformat() if blog.get('updated_at') else None,
            "author": {
                "@type": "Person",
                "name": blog.get('author_name', 'MarketMind Team'),
                "url": cls.BASE_URL
            },
            "publisher": {
                "@type": "Organization",
                "name": "MarketMind",
                "url": cls.BASE_URL,
                "logo": {
                    "@type": "ImageObject",
                    "url": f"{cls.BASE_URL}/logo.png"
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"{cls.BASE_URL}/blogs/{blog.get('slug', '')}"
            },
            "image": blog.get('featured_image', ''),
            "keywords": blog.get('tags', []),
            "wordCount": len(blog.get('content', '').split()) if blog.get('content') else 0,
            "commentCount": blog.get('comment_count', 0),
            "interactionStatistic": [
                {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": blog.get('like_count', 0)
                },
                {
                    "@type": "InteractionCounter", 
                    "interactionType": "https://schema.org/CommentAction",
                    "userInteractionCount": blog.get('comment_count', 0)
                }
            ]
        }
        
        # Add reading time estimate
        words = len(blog.get('content', '').split()) if blog.get('content') else 0
        reading_time = max(1, words // 200)  # Assume 200 words per minute
        json_ld["timeRequired"] = f"PT{reading_time}M"
        
        # Clean up None values
        return {k: v for k, v in json_ld.items() if v is not None}
    
    @classmethod
    def generate_organization_json_ld(cls) -> Dict[str, Any]:
        """Generate JSON-LD for the MarketMind organization"""
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MarketMind",
            "url": cls.BASE_URL,
            "logo": f"{cls.BASE_URL}/logo.png",
            "description": "Discover the perfect tools for your business. Compare features, read reviews, and find the best software solutions.",
            "foundingDate": "2024",
            "sameAs": [
                "https://twitter.com/marketmind",
                "https://linkedin.com/company/marketmind"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@marketmind.com"
            }
        }
    
    @classmethod
    def generate_website_json_ld(cls) -> Dict[str, Any]:
        """Generate JSON-LD for the website"""
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MarketMind",
            "url": cls.BASE_URL,
            "description": "Discover the perfect tools for your business",
            "potentialAction": {
                "@type": "SearchAction",
                "target": f"{cls.BASE_URL}/tools?search={{search_term_string}}",
                "query-input": "required name=search_term_string"
            }
        }
    
    @classmethod
    def generate_breadcrumb_json_ld(cls, items: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Generate breadcrumb JSON-LD
        items: [{"name": "Home", "url": "/"}, {"name": "Tools", "url": "/tools"}]
        """
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": item["name"],
                    "item": f"{cls.BASE_URL}{item['url']}" if not item['url'].startswith('http') else item['url']
                }
                for i, item in enumerate(items)
            ]
        }
    
    @classmethod
    def generate_faq_json_ld(cls, faqs: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Generate FAQ JSON-LD
        faqs: [{"question": "What is...", "answer": "It is..."}]
        """
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq["answer"]
                    }
                }
                for faq in faqs
            ]
        }

def auto_generate_json_ld_for_existing_content(db, limit: int = 100):
    """
    Auto-generate JSON-LD for existing tools and blogs that don't have it
    This function can be called to populate missing JSON-LD data
    """
    from sqlalchemy.orm import Session
    from models import Tool, Blog
    
    updated_count = {"tools": 0, "blogs": 0}
    
    # Update tools
    tools = db.query(Tool).filter(
        (Tool.json_ld.is_(None)) | (Tool.json_ld == {})
    ).limit(limit).all()
    
    for tool in tools:
        try:
            tool_data = {
                'name': tool.name,
                'description': tool.description,
                'url': tool.url,
                'pricing_type': tool.pricing_type,
                'rating': tool.rating,
                'review_count': tool.review_count,
                'created_at': tool.created_at,
                'updated_at': tool.updated_at,
                'logo_url': tool.logo_url,
                'screenshot_url': tool.screenshot_url,
                'features': tool.features or [],
                'categories': [{'name': cat.name} for cat in tool.categories] if tool.categories else []
            }
            
            tool.json_ld = JSONLDGenerator.generate_tool_json_ld(tool_data)
            updated_count["tools"] += 1
            
        except Exception as e:
            print(f"Error generating JSON-LD for tool {tool.name}: {e}")
    
    # Update blogs
    blogs = db.query(Blog).filter(
        (Blog.json_ld.is_(None)) | (Blog.json_ld == {})
    ).limit(limit).all()
    
    for blog in blogs:
        try:
            blog_data = {
                'title': blog.title,
                'slug': blog.slug,
                'excerpt': blog.excerpt,
                'content': blog.content,
                'published_at': blog.published_at,
                'created_at': blog.created_at,
                'updated_at': blog.updated_at,
                'featured_image': blog.featured_image,
                'tags': blog.tags or [],
                'like_count': blog.like_count,
                'comment_count': len(blog.comments) if blog.comments else 0,
                'author_name': blog.author.full_name if blog.author else 'MarketMind Team'
            }
            
            blog.json_ld = JSONLDGenerator.generate_blog_json_ld(blog_data)
            updated_count["blogs"] += 1
            
        except Exception as e:
            print(f"Error generating JSON-LD for blog {blog.title}: {e}")
    
    # Commit changes
    try:
        db.commit()
        print(f"✅ JSON-LD auto-generation completed:")
        print(f"   - Tools updated: {updated_count['tools']}")
        print(f"   - Blogs updated: {updated_count['blogs']}")
        return updated_count
    except Exception as e:
        db.rollback()
        print(f"❌ Error committing JSON-LD updates: {e}")
        return {"tools": 0, "blogs": 0, "error": str(e)}