from groq import Groq
import os
from typing import List, Dict, Any
import json
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.client = Groq(api_key="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")
        self.model = "openai/gpt-oss-20b"
    
    def generate_blog_content(self, topic: str, keywords: List[str] = [], target_length: str = "medium") -> Dict[str, Any]:
        """Generate comprehensive blog content using AI"""
        
        length_guide = {
            "short": "800-1200 words",
            "medium": "1500-2500 words", 
            "long": "3000-5000 words"
        }
        
        keywords_str = ", ".join(keywords) if keywords else ""
        
        prompt = f"""
        Create a comprehensive, engaging blog post about: {topic}
        
        Requirements:
        - Target length: {length_guide.get(target_length, "1500-2500 words")}
        - Include these keywords naturally: {keywords_str}
        - Professional, informative tone
        - Include actionable insights
        - Structure with clear headings and subheadings
        - Add a compelling introduction and conclusion
        - Include practical examples where relevant
        
        Format the response as JSON with these fields:
        - title: Blog title (SEO optimized)
        - excerpt: Brief summary (150-200 words)
        - content: Full blog content in HTML format with proper headings
        - seo_title: SEO optimized title
        - seo_description: Meta description (150-160 chars)
        - seo_keywords: Comma separated keywords
        - tags: Array of relevant tags
        - reading_time: Estimated reading time in minutes
        """
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_completion_tokens=8192,
                top_p=1,
                reasoning_effort="medium"
            )
            
            response_content = completion.choices[0].message.content
            
            # Try to parse as JSON, fallback to structured text
            try:
                return json.loads(response_content)
            except json.JSONDecodeError:
                # If not JSON, create structured response
                return {
                    "title": f"AI Generated: {topic}",
                    "excerpt": response_content[:200] + "...",
                    "content": f"<h1>{topic}</h1>\n<div>{response_content}</div>",
                    "seo_title": f"{topic} - Complete Guide",
                    "seo_description": response_content[:150] + "...",
                    "seo_keywords": ", ".join(keywords) if keywords else topic,
                    "tags": keywords if keywords else [topic.split()[0]],
                    "reading_time": max(1, len(response_content.split()) // 200)
                }
                
        except Exception as e:
            raise Exception(f"AI blog generation failed: {str(e)}")
    
    def compare_tools(self, tool_names: List[str], comparison_criteria: List[str] = []) -> Dict[str, Any]:
        """Generate AI-powered tool comparison"""
        
        criteria = comparison_criteria if comparison_criteria else [
            "Features", "Pricing", "Ease of Use", "Customer Support", "Integration Capabilities"
        ]
        
        tools_str = ", ".join(tool_names)
        criteria_str = ", ".join(criteria)
        
        prompt = f"""
        Create a comprehensive comparison of these tools: {tools_str}
        
        Compare them based on: {criteria_str}
        
        For each tool, provide:
        1. Overview and key strengths
        2. Detailed pros and cons
        3. Best use cases
        4. Pricing analysis
        5. Rating out of 5 for each criteria
        
        Also provide:
        - Overall recommendation based on different use cases
        - Summary table comparing key metrics
        - Final verdict on which tool is best for what scenarios
        
        Format as JSON with structured data for easy parsing.
        Include overall_winner, detailed_comparison (array), and summary fields.
        """
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_completion_tokens=8192,
                top_p=1,
                reasoning_effort="medium"
            )
            
            response_content = completion.choices[0].message.content
            
            try:
                return json.loads(response_content)
            except json.JSONDecodeError:
                # Fallback structured response
                return {
                    "overall_winner": tool_names[0] if tool_names else "N/A",
                    "detailed_comparison": [
                        {
                            "tool_name": tool,
                            "pros": ["Feature rich", "Good value"],
                            "cons": ["Learning curve", "Limited integrations"],
                            "rating": 4.0,
                            "best_for": "General use cases"
                        } for tool in tool_names
                    ],
                    "summary": response_content,
                    "criteria_used": criteria
                }
                
        except Exception as e:
            raise Exception(f"AI tool comparison failed: {str(e)}")
    
    def generate_seo_content(self, page_type: str, main_keyword: str, additional_info: str = "") -> Dict[str, Any]:
        """Generate SEO optimized content for pages"""
        
        prompt = f"""
        Generate SEO optimized content for a {page_type} page targeting the keyword: {main_keyword}
        Additional context: {additional_info}
        
        Provide:
        - SEO optimized title (under 60 chars)
        - Meta description (150-160 chars)
        - H1 heading
        - List of related keywords
        - JSON-LD structured data appropriate for the page type
        - Content outline with key sections
        
        Format as JSON for easy parsing.
        """
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_completion_tokens=4096,
                top_p=1,
                reasoning_effort="medium"
            )
            
            response_content = completion.choices[0].message.content
            
            try:
                return json.loads(response_content)
            except json.JSONDecodeError:
                return {
                    "seo_title": f"{main_keyword} - Complete Guide",
                    "meta_description": f"Discover everything about {main_keyword}. Comprehensive guide with expert insights and practical tips.",
                    "h1_heading": f"Ultimate Guide to {main_keyword}",
                    "related_keywords": [main_keyword, f"{main_keyword} guide", f"best {main_keyword}"],
                    "json_ld": {"@type": "Article", "headline": f"{main_keyword} Guide"},
                    "content_outline": response_content
                }
                
        except Exception as e:
            raise Exception(f"SEO content generation failed: {str(e)}")

# Global AI service instance
ai_service = AIService()