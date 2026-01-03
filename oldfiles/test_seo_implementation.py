#!/usr/bin/env python3
"""
SEO Implementation Testing Script
Tests all the SEO improvements we've implemented
"""

import requests
import json
from urllib.parse import urljoin
from xml.etree import ElementTree as ET

# Base URL for testing
BASE_URL = "http://localhost:8001"
FRONTEND_URL = "http://localhost:3000"

def test_sitemap():
    """Test sitemap.xml generation"""
    print("🗺️  Testing Sitemap Generation...")
    
    try:
        response = requests.get(f"{BASE_URL}/sitemap.xml")
        if response.status_code == 200:
            # Parse XML
            root = ET.fromstring(response.content)
            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
            
            print(f"   ✅ Sitemap generated successfully")
            print(f"   📊 Found {len(urls)} URLs in sitemap")
            
            # Check for key pages
            url_locs = [url.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc').text 
                       for url in urls]
            
            required_pages = ['/tools', '/blogs', '/']
            for page in required_pages:
                if any(page in url for url in url_locs):
                    print(f"   ✅ {page} found in sitemap")
                else:
                    print(f"   ❌ {page} missing from sitemap")
            
            return True
        else:
            print(f"   ❌ Sitemap request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Sitemap test error: {e}")
        return False

def test_robots_txt():
    """Test robots.txt generation"""
    print("\n🤖 Testing Robots.txt...")
    
    try:
        response = requests.get(f"{BASE_URL}/robots.txt")
        if response.status_code == 200:
            content = response.text
            print("   ✅ Robots.txt generated successfully")
            
            # Check for key directives
            if "User-agent: *" in content:
                print("   ✅ User-agent directive found")
            if "Sitemap:" in content:
                print("   ✅ Sitemap directive found")
            if "Disallow: /admin/" in content:
                print("   ✅ Admin protection found")
            if "Allow: /api/blogs/" in content:
                print("   ✅ Blog API allowed for crawling")
            
            return True
        else:
            print(f"   ❌ Robots.txt request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Robots.txt test error: {e}")
        return False

def test_backend_seo_endpoints():
    """Test backend SEO-related endpoints"""
    print("\n🔧 Testing Backend SEO Endpoints...")
    
    # Test blog endpoint for SEO data
    try:
        response = requests.get(f"{BASE_URL}/api/blogs")
        if response.status_code == 200:
            blogs = response.json()
            if blogs and len(blogs) > 0:
                blog = blogs[0] if isinstance(blogs, list) else blogs.get('blogs', [{}])[0]
                
                # Check for SEO fields
                seo_fields = ['title', 'seo_title', 'seo_description', 'seo_keywords']
                found_fields = [field for field in seo_fields if field in blog]
                
                print(f"   ✅ Blog API working - {len(found_fields)}/{len(seo_fields)} SEO fields present")
                
                if 'slug' in blog:
                    # Test individual blog SEO
                    blog_response = requests.get(f"{BASE_URL}/api/blogs/by-slug/{blog['slug']}")
                    if blog_response.status_code == 200:
                        blog_detail = blog_response.json()
                        if 'json_ld' in blog_detail:
                            print("   ✅ JSON-LD structured data available")
                        print("   ✅ Individual blog SEO data accessible")
                    else:
                        print("   ⚠️  Individual blog access failed")
            else:
                print("   ⚠️  No blogs found for SEO testing")
        else:
            print(f"   ❌ Blog API failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Blog API test error: {e}")

    # Test tools endpoint for SEO data
    try:
        response = requests.get(f"{BASE_URL}/api/tools")
        if response.status_code == 200:
            tools_data = response.json()
            tools = tools_data if isinstance(tools_data, list) else tools_data.get('tools', [])
            
            if tools and len(tools) > 0:
                tool = tools[0]
                seo_fields = ['name', 'seo_title', 'seo_description', 'short_description']
                found_fields = [field for field in seo_fields if field in tool]
                
                print(f"   ✅ Tools API working - {len(found_fields)}/{len(seo_fields)} SEO fields present")
                
                if 'slug' in tool:
                    # Test individual tool SEO
                    tool_response = requests.get(f"{BASE_URL}/api/tools/by-slug/{tool['slug']}")
                    if tool_response.status_code == 200:
                        tool_detail = tool_response.json()
                        if 'json_ld' in tool_detail:
                            print("   ✅ Tool JSON-LD structured data available")
                        print("   ✅ Individual tool SEO data accessible")
                    else:
                        print("   ⚠️  Individual tool access failed")
            else:
                print("   ⚠️  No tools found for SEO testing")
        else:
            print(f"   ❌ Tools API failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Tools API test error: {e}")

def test_frontend_seo_meta():
    """Test if frontend is properly serving SEO meta tags"""
    print("\n🌐 Testing Frontend SEO Meta Tags...")
    
    try:
        # Test homepage
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200:
            content = response.text
            
            # Check for updated title
            if "MarketMind" in content:
                print("   ✅ Updated page title found")
            
            # Check for meta description
            if 'name="description"' in content and "business tools" in content:
                print("   ✅ SEO meta description found")
            
            # Check for Open Graph tags
            if 'property="og:title"' in content:
                print("   ✅ Open Graph meta tags found")
            
            # Check for Twitter Card tags
            if 'property="twitter:card"' in content:
                print("   ✅ Twitter Card meta tags found")
            
            # Check for theme color
            if 'name="theme-color"' in content:
                print("   ✅ Theme color meta tag found")
            
            # Check for viewport optimization
            if 'name="viewport"' in content and 'shrink-to-fit=no' in content:
                print("   ✅ Optimized viewport meta tag found")
                
            return True
        else:
            print(f"   ❌ Frontend request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Frontend test error: {e}")
        return False

def test_performance_impact():
    """Test if SEO changes impact performance"""
    print("\n⚡ Testing Performance Impact...")
    
    try:
        import time
        
        # Measure homepage load time
        start_time = time.time()
        response = requests.get(FRONTEND_URL)
        load_time = time.time() - start_time
        
        if response.status_code == 200:
            content_size = len(response.content)
            print(f"   ✅ Homepage loaded in {load_time:.2f}s")
            print(f"   📊 Content size: {content_size / 1024:.1f}KB")
            
            if load_time < 2.0:
                print("   ✅ Load time is good for SEO")
            elif load_time < 4.0:
                print("   ⚠️  Load time is acceptable but could be improved")
            else:
                print("   ❌ Load time may impact SEO ranking")
                
            return True
        else:
            print(f"   ❌ Performance test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Performance test error: {e}")
        return False

def main():
    """Run all SEO implementation tests"""
    print("🔍 SEO Implementation Testing")
    print("=" * 40)
    
    tests = [
        test_sitemap,
        test_robots_txt,
        test_backend_seo_endpoints,
        test_frontend_seo_meta,
        test_performance_impact
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"   ❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 40)
    print(f"📈 SEO Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All SEO implementations are working correctly!")
        print("\n✅ Your site is now optimized for:")
        print("   • Google Search")
        print("   • Bing Search")
        print("   • LLM Crawlers")
        print("   • Social Media Sharing")
        print("   • Performance Metrics")
    else:
        print("⚠️  Some SEO implementations need attention.")
    
    return passed == total

if __name__ == "__main__":
    main()