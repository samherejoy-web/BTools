#!/usr/bin/env python3
"""
SEO Endpoints Testing Script
Tests the specific SEO-related backend endpoints as requested in the review.
"""

import requests
import sys
import json
from datetime import datetime

class SEOTester:
    def __init__(self, base_url="https://blog-duplicate.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, description=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    if response.headers.get('content-type', '').startswith('application/json'):
                        response_data = response.json()
                        if isinstance(response_data, dict):
                            if len(str(response_data)) <= 300:
                                print(f"   Response: {response_data}")
                            else:
                                print(f"   Response: Large object with {len(response_data)} keys")
                        elif isinstance(response_data, list):
                            print(f"   Response: {len(response_data)} items")
                    else:
                        print(f"   Response: {response.text[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:300],
                    'endpoint': endpoint
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def login_superadmin(self):
        """Login as superadmin for protected endpoints"""
        success, response = self.run_test(
            "Superadmin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "superadmin@marketmind.com", "password": "admin123"},
            description="Login as superadmin for SEO overview testing"
        )
        if success and isinstance(response, dict) and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Logged in as superadmin")
            return True
        return False

    def test_seo_endpoints(self):
        """Test all SEO-related endpoints as requested in review"""
        print("\n🔍 COMPREHENSIVE SEO ENDPOINTS TESTING")
        print("=" * 60)
        
        results = []
        
        # Test 1: GET /api/sitemap.xml - should return proper XML sitemap
        print("\n1️⃣ Testing GET /api/sitemap.xml")
        success, response = self.run_test(
            "SEO Sitemap XML",
            "GET",
            "sitemap.xml",
            200,
            description="Test sitemap.xml generation for SEO"
        )
        results.append(success)
        
        if success and isinstance(response, str):
            # Validate XML structure
            if response.startswith('<?xml') and '<urlset' in response:
                print("   ✅ Valid XML sitemap format")
                url_count = response.count('<url>')
                print(f"   ✅ Contains {url_count} URLs")
                
                # Check for tools and blogs in sitemap
                if '/tools/' in response:
                    tool_urls = response.count('/tools/')
                    print(f"   ✅ Tool URLs found: {tool_urls}")
                if '/blogs/' in response:
                    blog_urls = response.count('/blogs/')
                    print(f"   ✅ Blog URLs found: {blog_urls}")
            else:
                print("   ❌ Invalid XML format")
                results.append(False)
        
        # Test 2: GET /api/robots.txt - should return robots.txt file
        print("\n2️⃣ Testing GET /api/robots.txt")
        success, response = self.run_test(
            "SEO Robots.txt",
            "GET",
            "robots.txt",
            200,
            description="Test robots.txt generation for SEO"
        )
        results.append(success)
        
        if success and isinstance(response, str):
            required_directives = ['User-agent:', 'Disallow:', 'Sitemap:']
            missing = [d for d in required_directives if d not in response]
            if not missing:
                print("   ✅ All required robots.txt directives present")
            else:
                print(f"   ❌ Missing directives: {missing}")
                results.append(False)
        
        # Test 3: GET /api/tools/notion - should return tool data with SEO fields
        print("\n3️⃣ Testing GET /api/tools/notion (specific tool with SEO fields)")
        success, response = self.run_test(
            "Tool 'notion' with SEO fields",
            "GET",
            "tools/by-slug/notion",
            200,
            description="Test specific tool 'notion' for SEO metadata"
        )
        
        if not success:
            # Try alternative approach - get tools and find one to test
            print("   ⚠️ 'notion' tool not found, trying alternative approach...")
            success_alt, tools_response = self.run_test(
                "Get tools for SEO testing",
                "GET",
                "tools?limit=1",
                200,
                description="Get any tool to test SEO data"
            )
            
            if success_alt and isinstance(tools_response, list) and len(tools_response) > 0:
                tool = tools_response[0]
                tool_id = tool.get('id')
                tool_name = tool.get('name', 'Unknown')
                
                success, response = self.run_test(
                    f"Tool '{tool_name}' with SEO fields",
                    "GET",
                    f"tools/{tool_id}",
                    200,
                    description=f"Test tool '{tool_name}' for SEO metadata"
                )
        
        results.append(success)
        
        if success and isinstance(response, dict):
            seo_fields = ['seo_title', 'seo_description', 'seo_keywords']
            present_fields = []
            missing_fields = []
            
            for field in seo_fields:
                if response.get(field):
                    present_fields.append(field)
                    print(f"   ✅ {field}: {response[field][:50]}...")
                else:
                    missing_fields.append(field)
                    print(f"   ❌ {field}: Missing or empty")
            
            if len(present_fields) >= 1:  # At least 1 SEO field
                print(f"   ✅ Tool has SEO data ({len(present_fields)}/3 fields)")
            else:
                print(f"   ❌ Tool lacks SEO data ({len(present_fields)}/3 fields)")
                results.append(False)
        
        # Test 4: GET /api/blogs/top-10-productivity-tools-for-remote-teams-in-2024
        print("\n4️⃣ Testing GET /api/blogs/top-10-productivity-tools-for-remote-teams-in-2024")
        success, response = self.run_test(
            "Specific blog with SEO metadata",
            "GET",
            "blogs/by-slug/top-10-productivity-tools-for-remote-teams-in-2024",
            200,
            description="Test specific blog for SEO metadata"
        )
        
        if not success:
            # Try alternative approach - get blogs and find one to test
            print("   ⚠️ Specific blog not found, trying alternative approach...")
            success_alt, blogs_response = self.run_test(
                "Get blogs for SEO testing",
                "GET",
                "blogs?limit=1",
                200,
                description="Get any blog to test SEO data"
            )
            
            if success_alt and isinstance(blogs_response, list) and len(blogs_response) > 0:
                blog = blogs_response[0]
                blog_id = blog.get('id')
                blog_title = blog.get('title', 'Unknown')
                
                success, response = self.run_test(
                    f"Blog '{blog_title[:30]}...' with SEO fields",
                    "GET",
                    f"blogs/{blog_id}",
                    200,
                    description=f"Test blog '{blog_title}' for SEO metadata"
                )
        
        results.append(success)
        
        if success and isinstance(response, dict):
            seo_fields = ['seo_title', 'seo_description', 'seo_keywords', 'json_ld']
            present_fields = []
            missing_fields = []
            
            for field in seo_fields:
                if response.get(field):
                    present_fields.append(field)
                    if field == 'json_ld':
                        print(f"   ✅ {field}: JSON-LD structured data present")
                    else:
                        print(f"   ✅ {field}: {str(response[field])[:50]}...")
                else:
                    missing_fields.append(field)
                    print(f"   ❌ {field}: Missing or empty")
            
            if len(present_fields) >= 2:  # At least 2 out of 4 SEO fields for blogs
                print(f"   ✅ Blog has good SEO data ({len(present_fields)}/4 fields)")
            else:
                print(f"   ⚠️ Blog has limited SEO data ({len(present_fields)}/4 fields)")
        
        # Test 5: Test a few other tools and blogs to ensure SEO data is present
        print("\n5️⃣ Testing other tools and blogs for SEO data presence")
        
        # Get some tools
        success, tools_response = self.run_test(
            "Get tools for SEO testing",
            "GET",
            "tools?limit=3",
            200,
            description="Get sample tools to test SEO data"
        )
        
        if success and isinstance(tools_response, list):
            tools_with_seo = 0
            for i, tool in enumerate(tools_response[:3]):
                tool_id = tool.get('id')
                tool_name = tool.get('name', 'Unknown')
                
                success_tool, tool_detail = self.run_test(
                    f"Tool {i+1} SEO check",
                    "GET",
                    f"tools/{tool_id}",
                    200,
                    description=f"Check SEO data for tool: {tool_name}"
                )
                
                if success_tool and isinstance(tool_detail, dict):
                    seo_count = sum(1 for field in ['seo_title', 'seo_description', 'seo_keywords'] 
                                  if tool_detail.get(field))
                    if seo_count >= 1:
                        tools_with_seo += 1
                        print(f"   ✅ Tool '{tool_name}': {seo_count}/3 SEO fields")
                    else:
                        print(f"   ❌ Tool '{tool_name}': No SEO fields")
            
            print(f"   📊 Tools with SEO data: {tools_with_seo}/{len(tools_response[:3])}")
            if tools_with_seo >= 1:
                results.append(True)
            else:
                results.append(False)
        
        # Get some blogs
        success, blogs_response = self.run_test(
            "Get blogs for SEO testing",
            "GET",
            "blogs?limit=3",
            200,
            description="Get sample blogs to test SEO data"
        )
        
        if success and isinstance(blogs_response, list):
            blogs_with_seo = 0
            for i, blog in enumerate(blogs_response[:3]):
                blog_id = blog.get('id')
                blog_title = blog.get('title', 'Unknown')
                
                success_blog, blog_detail = self.run_test(
                    f"Blog {i+1} SEO check",
                    "GET",
                    f"blogs/{blog_id}",
                    200,
                    description=f"Check SEO data for blog: {blog_title}"
                )
                
                if success_blog and isinstance(blog_detail, dict):
                    seo_count = sum(1 for field in ['seo_title', 'seo_description', 'seo_keywords', 'json_ld'] 
                                  if blog_detail.get(field))
                    if seo_count >= 1:
                        blogs_with_seo += 1
                        print(f"   ✅ Blog '{blog_title[:30]}...': {seo_count}/4 SEO fields")
                    else:
                        print(f"   ❌ Blog '{blog_title[:30]}...': {seo_count}/4 SEO fields")
            
            print(f"   📊 Blogs with SEO data: {blogs_with_seo}/{len(blogs_response[:3])}")
            if blogs_with_seo >= 1:
                results.append(True)
            else:
                results.append(False)
        
        # Test 6: Quick test of superadmin SEO overview endpoint
        print("\n6️⃣ Testing superadmin SEO overview endpoint")
        
        # Login as superadmin
        if self.login_superadmin():
            success, response = self.run_test(
                "Superadmin SEO Overview",
                "GET",
                "superadmin/seo/overview",
                200,
                description="Test superadmin SEO health overview"
            )
            results.append(success)
            
            if success and isinstance(response, dict):
                health_score = response.get('health_score', 0)
                total_pages = response.get('total_pages', 0)
                seo_optimized = response.get('seo_optimized', 0)
                critical_issues = response.get('critical_issues', 0)
                
                print(f"   ✅ SEO Health Score: {health_score}%")
                print(f"   ✅ Total Pages: {total_pages}")
                print(f"   ✅ SEO Optimized: {seo_optimized}")
                print(f"   ✅ Critical Issues: {critical_issues}")
                
                if health_score >= 80:
                    print(f"   ✅ Excellent SEO health score")
                elif health_score >= 60:
                    print(f"   ⚠️ Good SEO health score")
                else:
                    print(f"   ❌ Poor SEO health score")
        else:
            print("   ❌ Failed to login as superadmin for SEO overview test")
            results.append(False)
        
        # Summary
        print(f"\n📋 SEO ENDPOINTS TEST SUMMARY")
        print(f"   Tests run: {len(results)}")
        print(f"   Tests passed: {sum(results)}")
        print(f"   Success rate: {(sum(results)/len(results)*100):.1f}%")
        
        return all(results)

    def run_all_tests(self):
        """Run all SEO tests"""
        print("🚀 Starting SEO Backend Endpoints Testing")
        print("=" * 60)
        
        # Run SEO tests
        seo_success = self.test_seo_endpoints()
        
        # Final summary
        print(f"\n" + "=" * 60)
        print(f"📊 FINAL TEST RESULTS")
        print(f"=" * 60)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"   - {test['name']}: {error_msg}")
        
        if seo_success:
            print(f"\n🎉 SEO endpoints testing PASSED!")
        else:
            print(f"\n❌ SEO endpoints testing FAILED!")
        
        return seo_success

if __name__ == "__main__":
    tester = SEOTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)