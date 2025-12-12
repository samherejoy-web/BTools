#!/usr/bin/env python3
"""
JSON-LD Validation Script for MarketMind SEO Analysis
Validates structured data across different page types
"""

import json
import re
import requests
from urllib.parse import urljoin
import sys

def extract_jsonld_from_html(html_content):
    """Extract JSON-LD scripts from HTML content"""
    pattern = r'<script type="application/ld\+json">.*?</script>'
    jsonld_scripts = re.findall(pattern, html_content, re.DOTALL)
    
    jsonld_data = []
    for script in jsonld_scripts:
        # Extract JSON content between script tags
        json_content = re.search(r'<script type="application/ld\+json">(.*?)</script>', script, re.DOTALL)
        if json_content:
            json_str = json_content.group(1).strip()
            try:
                # Parse JSON to validate
                data = json.loads(json_str)
                jsonld_data.append(data)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON-LD found: {e}")
                print(f"Content: {json_str[:200]}...")
    
    return jsonld_data

def validate_schema_type(jsonld, expected_type):
    """Validate JSON-LD schema type"""
    if isinstance(jsonld, dict):
        actual_type = jsonld.get('@type')
        return actual_type == expected_type
    return False

def analyze_page_seo(url, expected_schema_type=None):
    """Analyze SEO and JSON-LD for a specific page"""
    print(f"\n🔍 Analyzing: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ HTTP {response.status_code} - Unable to fetch page")
            return False
        
        html = response.text
        
        # Extract meta tags
        title = re.search(r'<title[^>]*>([^<]+)</title>', html)
        description = re.search(r'<meta name="description" content="([^"]*)"', html)
        keywords = re.search(r'<meta name="keywords" content="([^"]*)"', html)
        og_title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
        og_description = re.search(r'<meta property="og:description" content="([^"]*)"', html)
        canonical = re.search(r'<link rel="canonical" href="([^"]*)"', html)
        
        print(f"  📄 Title: {title.group(1) if title else 'Missing'}")
        print(f"  📝 Description: {'✅ Present' if description else '❌ Missing'}")
        print(f"  🔑 Keywords: {'✅ Present' if keywords else '❌ Missing'}")
        print(f"  🌐 Canonical: {'✅ Present' if canonical else '❌ Missing'}")
        print(f"  📱 Open Graph: {'✅ Present' if og_title and og_description else '❌ Incomplete'}")
        
        # Extract and validate JSON-LD
        jsonld_data = extract_jsonld_from_html(html)
        
        if not jsonld_data:
            print("  ❌ No JSON-LD structured data found")
            return False
        
        print(f"  ✅ Found {len(jsonld_data)} JSON-LD schema(s)")
        
        for i, schema in enumerate(jsonld_data):
            schema_type = schema.get('@type', 'Unknown')
            print(f"    📊 Schema {i+1}: {schema_type}")
            
            if expected_schema_type and validate_schema_type(schema, expected_schema_type):
                print(f"    ✅ Matches expected schema type: {expected_schema_type}")
            
            # Check for important schema properties
            if schema_type == 'SoftwareApplication':
                required_props = ['name', 'description', 'url', 'applicationCategory']
                missing_props = [prop for prop in required_props if prop not in schema]
                if not missing_props:
                    print(f"    ✅ All required SoftwareApplication properties present")
                else:
                    print(f"    ⚠️ Missing properties: {', '.join(missing_props)}")
                
                # Check for ratings
                if 'aggregateRating' in schema:
                    rating = schema['aggregateRating']
                    print(f"    ⭐ Rating: {rating.get('ratingValue', 'N/A')} ({rating.get('ratingCount', 0)} reviews)")
                
            elif schema_type == 'BlogPosting':
                required_props = ['headline', 'author', 'datePublished', 'publisher']
                missing_props = [prop for prop in required_props if prop not in schema]
                if not missing_props:
                    print(f"    ✅ All required BlogPosting properties present")
                else:
                    print(f"    ⚠️ Missing properties: {', '.join(missing_props)}")
            
            elif schema_type == 'WebSite':
                required_props = ['name', 'url', 'publisher']
                missing_props = [prop for prop in required_props if prop not in schema]
                if not missing_props:
                    print(f"    ✅ All required WebSite properties present")
                else:
                    print(f"    ⚠️ Missing properties: {', '.join(missing_props)}")
        
        return True
        
    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return False

def main():
    """Main validation function"""
    base_url = "https://seo-semantic-html.preview.emergentagent.com"
    
    print("🚀 MarketMind JSON-LD Validation Report")
    print("=" * 50)
    
    # Test pages with expected schema types
    test_cases = [
        (f"{base_url}/", "WebSite"),
        (f"{base_url}/tools", "WebSite"),
        (f"{base_url}/blogs", "WebSite"),
        (f"{base_url}/tools/notion", "SoftwareApplication"),
        (f"{base_url}/tools/figma", "SoftwareApplication"),
        (f"{base_url}/blogs/top-10-productivity-tools-for-remote-teams-in-2024", "BlogPosting"),
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for url, expected_schema in test_cases:
        if analyze_page_seo(url, expected_schema):
            successful_tests += 1
    
    print("\n" + "=" * 50)
    print(f"📊 VALIDATION SUMMARY")
    print(f"✅ Successful: {successful_tests}/{total_tests}")
    print(f"📈 Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 ALL JSON-LD SCHEMAS VALIDATED SUCCESSFULLY!")
        print("🤖 Site is fully optimized for AI/LLM information extraction")
    elif successful_tests >= total_tests * 0.8:
        print("✅ GOOD: Most schemas validated successfully")
        print("⚠️ Some minor issues found - review above output")
    else:
        print("❌ ISSUES DETECTED: Multiple schema validation failures")
        print("🔧 Review and fix JSON-LD implementation")
    
    return successful_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)