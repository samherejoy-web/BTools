"""
Advanced Schema Markup Generator for Enhanced SEO
Generates comprehensive JSON-LD structured data for different content types
"""

from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import json
import re
from models import Tool, Blog, Review, User, Category
import os

class SchemaGenerator:
    """Advanced schema markup generator with comprehensive support for various schema types"""
    
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv('FRONTEND_URL', 'https://marketmind.com')
        self.organization_data = self._get_organization_schema()
    
    def _get_organization_schema(self) -> Dict[str, Any]:
        """Base organization schema for the website"""
        return {
            "@type": "Organization",
            "name": "MarketMind",
            "url": self.base_url,
            "logo": {
                "@type": "ImageObject", 
                "url": f"{self.base_url}/api/images/logo.png",
                "width": "400",
                "height": "400"
            },
            "description": "Discover and compare the best business tools with AI-powered insights and community reviews.",
            "foundingDate": "2024",
            "sameAs": [
                "https://twitter.com/marketmind",
                "https://linkedin.com/company/marketmind",
                "https://github.com/marketmind"
            ],
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "contactType": "Customer Service",
                    "email": "support@marketmind.com",
                    "availableLanguage": ["English"]
                },
                {
                    "@type": "ContactPoint", 
                    "contactType": "Sales",
                    "email": "sales@marketmind.com",
                    "availableLanguage": ["English"]
                }
            ],
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "US",
                "addressRegion": "Online"
            }
        }
    
    def generate_product_schema(self, tool: Tool, reviews: List[Review] = None) -> Dict[str, Any]:
        """Generate comprehensive Product/SoftwareApplication schema for tools"""
        
        schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.name,
            "description": self._clean_text(tool.description or tool.short_description or ""),
            "url": tool.url,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser, iOS, Android",
            "author": self.organization_data,
            "publisher": self.organization_data,
            "dateCreated": tool.created_at.isoformat() if tool.created_at else None,
            "dateModified": tool.updated_at.isoformat() if tool.updated_at else None,
            "version": "Latest",
            "downloadUrl": tool.url,
            "softwareHelp": {
                "@type": "CreativeWork",
                "url": f"{self.base_url}/tools/{tool.slug}#help"
            }
        }
        
        # Add images
        if tool.logo_url:
            schema["image"] = {
                "@type": "ImageObject",
                "url": tool.logo_url,
                "width": "400",
                "height": "400"
            }
        elif tool.local_logo_path:
            schema["image"] = {
                "@type": "ImageObject", 
                "url": f"{self.base_url}/api/uploads/logos/{tool.local_logo_path}",
                "width": "400",
                "height": "400"
            }
        
        # Add screenshot if available
        if hasattr(tool, 'screenshot_url') and tool.screenshot_url:
            schema["screenshot"] = {
                "@type": "ImageObject",
                "url": tool.screenshot_url,
                "width": "1200",
                "height": "800"
            }
        
        # Add pricing information
        if tool.pricing_type:
            offers = self._generate_pricing_offers(tool)
            if offers:
                schema["offers"] = offers
        
        # Add aggregate rating if reviews exist
        if reviews and len(reviews) > 0:
            schema["aggregateRating"] = self._generate_aggregate_rating(reviews)
        elif hasattr(tool, 'rating') and tool.rating and hasattr(tool, 'review_count') and tool.review_count:
            schema["aggregateRating"] = {
                "@type": "AggregateRating",
                "ratingValue": str(tool.rating),
                "reviewCount": str(tool.review_count),
                "bestRating": "5",
                "worstRating": "1"
            }
        
        # Add reviews
        if reviews:
            schema["review"] = [self._generate_review_schema(review) for review in reviews[:10]]  # Limit to 10 reviews
        
        # Add features
        if hasattr(tool, 'features') and tool.features:
            if isinstance(tool.features, list):
                schema["featureList"] = tool.features
            elif isinstance(tool.features, str):
                schema["featureList"] = [f.strip() for f in tool.features.split(',')]
        
        # Add additional properties from enhanced fields
        if hasattr(tool, 'founded_year') and tool.founded_year:
            schema["dateCreated"] = f"{tool.founded_year}-01-01"
            
        if hasattr(tool, 'company_size') and tool.company_size:
            schema["author"]["numberOfEmployees"] = tool.company_size
            
        if hasattr(tool, 'funding_info') and tool.funding_info:
            schema["funding"] = {
                "@type": "MonetaryGrant",
                "description": tool.funding_info
            }
        
        # Add supported languages
        if hasattr(tool, 'languages_supported') and tool.languages_supported:
            schema["availableLanguage"] = tool.languages_supported.split(',') if isinstance(tool.languages_supported, str) else tool.languages_supported
        
        # Add use cases as applicationSubCategory
        if hasattr(tool, 'use_cases') and tool.use_cases:
            schema["applicationSubCategory"] = tool.use_cases.split(',') if isinstance(tool.use_cases, str) else tool.use_cases
        
        return schema
    
    def generate_article_schema(self, blog: Blog, author: User = None) -> Dict[str, Any]:
        """Generate comprehensive Article/BlogPosting schema for blogs"""
        
        schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": self._clean_text(blog.excerpt or blog.seo_description or ""),
            "datePublished": blog.published_at.isoformat() if blog.published_at else blog.created_at.isoformat(),
            "dateModified": blog.updated_at.isoformat() if blog.updated_at else blog.created_at.isoformat(),
            "url": f"{self.base_url}/blogs/{blog.slug}",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"{self.base_url}/blogs/{blog.slug}"
            },
            "publisher": self.organization_data,
            "inLanguage": "en-US"
        }
        
        # Add author information
        if author:
            schema["author"] = {
                "@type": "Person",
                "name": author.full_name or author.username,
                "url": f"{self.base_url}/authors/{author.username}",
                "description": getattr(author, 'bio', '') or f"Content creator at {self.organization_data['name']}"
            }
        elif hasattr(blog, 'author_name') and blog.author_name:
            schema["author"] = {
                "@type": "Person",
                "name": blog.author_name
            }
        else:
            schema["author"] = self.organization_data
        
        # Add featured image
        if hasattr(blog, 'featured_image') and blog.featured_image:
            schema["image"] = {
                "@type": "ImageObject",
                "url": blog.featured_image,
                "width": "1200",
                "height": "630"
            }
        
        # Add article content analysis
        if blog.content:
            word_count = len(blog.content.split())
            schema["wordCount"] = word_count
            
            # Estimate reading time (average 200 words per minute)
            reading_time = max(1, word_count // 200)
            schema["timeRequired"] = f"PT{reading_time}M"
        
        # Add keywords/tags
        if blog.seo_keywords:
            schema["keywords"] = blog.seo_keywords
        
        # Add article sections if available
        if hasattr(blog, 'content') and blog.content:
            sections = self._extract_article_sections(blog.content)
            if sections:
                schema["articleSection"] = sections
        
        # Add categories/tags
        if hasattr(blog, 'category') and blog.category:
            schema["about"] = {
                "@type": "Thing",
                "name": blog.category
            }
        
        # Add engagement metrics if available
        if hasattr(blog, 'view_count') and blog.view_count:
            schema["interactionStatistic"] = [
                {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/ReadAction",
                    "userInteractionCount": blog.view_count
                }
            ]
            
            if hasattr(blog, 'like_count') and blog.like_count:
                schema["interactionStatistic"].append({
                    "@type": "InteractionCounter", 
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": blog.like_count
                })
        
        return schema
    
    def generate_review_schema(self, review: Review, tool: Tool = None) -> Dict[str, Any]:
        """Generate Review schema for tool reviews"""
        
        schema = {
            "@context": "https://schema.org",
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": str(review.rating), 
                "bestRating": "5",
                "worstRating": "1"
            },
            "author": {
                "@type": "Person",
                "name": review.user.full_name or review.user.username if review.user else "Anonymous"
            },
            "datePublished": review.created_at.isoformat() if review.created_at else None,
            "reviewBody": self._clean_text(review.comment or "")
        }
        
        # Add reviewed item
        if tool:
            schema["itemReviewed"] = {
                "@type": "SoftwareApplication",
                "name": tool.name,
                "url": tool.url,
                "image": tool.logo_url or f"{self.base_url}/api/uploads/logos/{tool.local_logo_path}" if tool.local_logo_path else None
            }
        
        # Add helpful votes if available
        if hasattr(review, 'helpful_count') and review.helpful_count:
            schema["positiveNotes"] = f"Found helpful by {review.helpful_count} users"
        
        return schema
    
    def generate_breadcrumb_schema(self, breadcrumbs: List[Dict[str, str]]) -> Dict[str, Any]:
        """Generate BreadcrumbList schema"""
        
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": idx + 1,
                    "name": crumb["name"],
                    "item": crumb["url"]
                }
                for idx, crumb in enumerate(breadcrumbs)
            ]
        }
    
    def generate_website_schema(self) -> Dict[str, Any]:
        """Generate WebSite schema with search functionality"""
        
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MarketMind",
            "url": self.base_url,
            "description": "Discover and compare the best business tools",
            "publisher": self.organization_data,
            "potentialAction": [
                {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": f"{self.base_url}/tools?q={{search_term_string}}"
                    },
                    "query-input": "required name=search_term_string"
                }
            ],
            "mainEntity": {
                "@type": "ItemList",
                "name": "Business Tools Directory",
                "description": "Comprehensive directory of business tools and software"
            }
        }
    
    def generate_faq_schema(self, faqs: List[Dict[str, str]]) -> Dict[str, Any]:
        """Generate FAQ schema for pages with FAQ sections"""
        
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
    
    def generate_how_to_schema(self, title: str, steps: List[str], description: str = "") -> Dict[str, Any]:
        """Generate HowTo schema for tutorial content"""
        
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": title,
            "description": description,
            "step": [
                {
                    "@type": "HowToStep",
                    "name": f"Step {idx + 1}",
                    "text": step
                }
                for idx, step in enumerate(steps)
            ],
            "totalTime": f"PT{len(steps) * 2}M"  # Estimate 2 minutes per step
        }
    
    def generate_collection_schema(self, tools: List[Tool], collection_name: str, description: str = "") -> Dict[str, Any]:
        """Generate CollectionPage schema for tool categories"""
        
        return {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": collection_name,
            "description": description,
            "url": f"{self.base_url}/tools?category={collection_name.lower().replace(' ', '-')}",
            "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": len(tools),
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": idx + 1,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": tool.name,
                            "url": f"{self.base_url}/tools/{tool.slug}",
                            "description": tool.short_description or tool.description[:150]
                        }
                    }
                    for idx, tool in enumerate(tools[:20])  # Limit to 20 items
                ]
            }
        }
    
    # Helper methods
    
    def _clean_text(self, text: str) -> str:
        """Clean text content for schema markup"""
        if not text:
            return ""
        
        # Remove HTML tags
        clean_text = re.sub(r'<[^>]+>', '', text)
        # Remove extra whitespace
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        return clean_text
    
    def _generate_pricing_offers(self, tool: Tool) -> List[Dict[str, Any]]:
        """Generate pricing offers for tools"""
        offers = []
        
        if tool.pricing_type == 'free':
            offers.append({
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2025-12-31",
                "category": "Free"
            })
        elif tool.pricing_type == 'freemium':
            offers.extend([
                {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD", 
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": "2025-12-31",
                    "category": "Free Tier"
                },
                {
                    "@type": "Offer",
                    "price": "9.99",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock", 
                    "priceValidUntil": "2025-12-31",
                    "category": "Premium"
                }
            ])
        elif hasattr(tool, 'pricing_details') and tool.pricing_details:
            # Parse pricing details if available
            if isinstance(tool.pricing_details, dict):
                for plan_name, price in tool.pricing_details.items():
                    if isinstance(price, str):
                        # Extract numeric price
                        price_match = re.search(r'\d+\.?\d*', price)
                        if price_match:
                            offers.append({
                                "@type": "Offer",
                                "price": price_match.group(),
                                "priceCurrency": "USD",
                                "availability": "https://schema.org/InStock",
                                "priceValidUntil": "2025-12-31",
                                "category": plan_name
                            })
        
        return offers
    
    def _generate_aggregate_rating(self, reviews: List[Review]) -> Dict[str, Any]:
        """Generate aggregate rating from reviews"""
        if not reviews:
            return None
            
        total_rating = sum(review.rating for review in reviews)
        avg_rating = total_rating / len(reviews)
        
        return {
            "@type": "AggregateRating",
            "ratingValue": f"{avg_rating:.1f}",
            "reviewCount": str(len(reviews)),
            "bestRating": "5",
            "worstRating": "1"
        }
    
    def _generate_review_schema(self, review: Review) -> Dict[str, Any]:
        """Generate individual review schema"""
        return {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": str(review.rating),
                "bestRating": "5",
                "worstRating": "1"
            },
            "author": {
                "@type": "Person",
                "name": review.user.full_name or review.user.username if review.user else "Anonymous"
            },
            "datePublished": review.created_at.isoformat() if review.created_at else None,
            "reviewBody": self._clean_text(review.comment or "")
        }
    
    def _extract_article_sections(self, content: str) -> List[str]:
        """Extract article sections from content (simplified H2 headers)"""
        if not content:
            return []
            
        # Find H2 headers as section indicators
        h2_pattern = r'<h2[^>]*>(.*?)</h2>'
        sections = re.findall(h2_pattern, content, re.IGNORECASE)
        
        # Clean and return section titles
        return [self._clean_text(section) for section in sections[:5]]  # Limit to 5 sections

# Convenience functions for direct use

def generate_tool_schema(tool: Tool, reviews: List[Review] = None, base_url: str = None) -> str:
    """Generate JSON-LD schema string for a tool"""
    generator = SchemaGenerator(base_url)
    schema = generator.generate_product_schema(tool, reviews)
    return json.dumps(schema, indent=2)

def generate_blog_schema(blog: Blog, author: User = None, base_url: str = None) -> str:
    """Generate JSON-LD schema string for a blog"""
    generator = SchemaGenerator(base_url)
    schema = generator.generate_article_schema(blog, author)
    return json.dumps(schema, indent=2)

def generate_review_schema(review: Review, tool: Tool = None, base_url: str = None) -> str:
    """Generate JSON-LD schema string for a review"""
    generator = SchemaGenerator(base_url)
    schema = generator.generate_review_schema(review, tool)
    return json.dumps(schema, indent=2)