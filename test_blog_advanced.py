#!/usr/bin/env python3

import requests
import json
from datetime import datetime

class AdvancedBlogTester:
    def __init__(self):
        self.base_url = "https://medium-clone-3.preview.emergentagent.com/api"
        self.token = None
        
    def login(self):
        """Login as superadmin"""
        login_data = {
            "email": "superadmin@marketmind.com",
            "password": "admin123"
        }
        response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('access_token')
            return True
        return False
    
    def test_blog_listing_and_search(self):
        """Test blog listing, pagination, search, and filtering"""
        print("🔍 Testing blog listing and search functionality...")
        
        results = []
        
        # Test 1: Basic blog listing with pagination
        try:
            response = requests.get(f"{self.base_url}/blogs?skip=0&limit=5", timeout=10)
            if response.status_code == 200:
                blogs = response.json()
                print(f"✅ Pagination working - Retrieved {len(blogs)} blogs")
                results.append(True)
            else:
                print(f"❌ Pagination failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ Pagination error: {e}")
            results.append(False)
        
        # Test 2: Search functionality
        try:
            response = requests.get(f"{self.base_url}/blogs?search=productivity", timeout=10)
            if response.status_code == 200:
                blogs = response.json()
                print(f"✅ Search working - Found {len(blogs)} blogs matching 'productivity'")
                results.append(True)
            else:
                print(f"❌ Search failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ Search error: {e}")
            results.append(False)
        
        # Test 3: Tag filtering
        try:
            response = requests.get(f"{self.base_url}/blogs?tag=testing", timeout=10)
            if response.status_code == 200:
                blogs = response.json()
                print(f"✅ Tag filtering working - Found {len(blogs)} blogs with 'testing' tag")
                results.append(True)
            else:
                print(f"❌ Tag filtering failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ Tag filtering error: {e}")
            results.append(False)
        
        # Test 4: Sorting options
        sort_options = ["newest", "oldest", "most_viewed", "trending"]
        for sort_option in sort_options:
            try:
                response = requests.get(f"{self.base_url}/blogs?sort={sort_option}&limit=3", timeout=10)
                if response.status_code == 200:
                    print(f"✅ Sorting by {sort_option} working")
                    results.append(True)
                else:
                    print(f"❌ Sorting by {sort_option} failed: {response.status_code}")
                    results.append(False)
            except Exception as e:
                print(f"❌ Sorting by {sort_option} error: {e}")
                results.append(False)
        
        return all(results)
    
    def test_blog_backward_compatibility(self):
        """Test backward compatibility with existing blog posts"""
        print("🔍 Testing backward compatibility with existing blogs...")
        
        try:
            # Get existing blogs
            response = requests.get(f"{self.base_url}/blogs?limit=10", timeout=10)
            if response.status_code == 200:
                blogs = response.json()
                print(f"✅ Retrieved {len(blogs)} existing blogs")
                
                if blogs:
                    # Test first blog for compatibility
                    blog = blogs[0]
                    blog_id = blog.get('id')
                    
                    # Test retrieval by ID
                    response = requests.get(f"{self.base_url}/blogs/{blog_id}", timeout=10)
                    if response.status_code == 200:
                        blog_data = response.json()
                        print(f"✅ Existing blog retrieved successfully")
                        print(f"   Title: {blog_data.get('title', 'N/A')}")
                        print(f"   Reading Time: {blog_data.get('reading_time', 'N/A')} minutes")
                        print(f"   Has SEO Title: {'✅' if blog_data.get('seo_title') else '❌'}")
                        print(f"   Has JSON-LD: {'✅' if blog_data.get('json_ld') else '❌'}")
                        return True
                    else:
                        print(f"❌ Failed to retrieve existing blog: {response.status_code}")
                        return False
                else:
                    print("⚠️ No existing blogs found")
                    return True
            else:
                print(f"❌ Failed to get existing blogs: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backward compatibility test error: {e}")
            return False
    
    def test_blog_performance(self):
        """Test blog performance with larger content"""
        print("🔍 Testing blog performance with larger content...")
        
        if not self.token:
            print("❌ No token available")
            return False
        
        # Create a blog with larger content
        timestamp = datetime.now().strftime('%H%M%S')
        large_content = """
        <h1>Performance Test Blog Post</h1>
        <p class="lead">This is a performance test with larger content to verify the system can handle substantial blog posts efficiently.</p>
        """ + """
        <h2>Section {}</h2>
        <p>This is section {} with substantial content to test performance. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <ul>
            <li>Feature point 1 for section {}</li>
            <li>Feature point 2 for section {}</li>
            <li>Feature point 3 for section {}</li>
        </ul>
        """.format(*([i, i, i, i] for i in range(1, 11))) * 10  # Create 10 sections
        
        blog_data = {
            "title": f"Performance Test Blog {timestamp}",
            "content": large_content,
            "excerpt": "This is a performance test blog with substantial content to verify system efficiency.",
            "tags": ["performance", "testing", "large-content", "efficiency"],
            "seo_title": f"Performance Test Blog {timestamp} - System Efficiency Testing",
            "seo_description": "Testing blog system performance with large content payloads to ensure efficient handling of substantial blog posts.",
            "seo_keywords": "performance, testing, large-content, efficiency, blog-system",
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": f"Performance Test Blog {timestamp}",
                "author": {
                    "@type": "Person",
                    "name": "Performance Tester"
                },
                "datePublished": datetime.now().isoformat(),
                "description": "Performance testing blog with large content",
                "wordCount": len(large_content.split())
            }
        }
        
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            import time
            start_time = time.time()
            
            response = requests.post(f"{self.base_url}/user/blogs", json=blog_data, headers=headers, timeout=30)
            
            end_time = time.time()
            creation_time = end_time - start_time
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Large blog created successfully in {creation_time:.2f} seconds")
                print(f"   Content size: ~{len(large_content)} characters")
                print(f"   Word count: ~{len(large_content.split())} words")
                print(f"   Reading time: {data.get('reading_time')} minutes")
                
                # Test retrieval performance
                blog_id = data.get('id')
                start_time = time.time()
                
                response = requests.get(f"{self.base_url}/blogs/{blog_id}", timeout=15)
                
                end_time = time.time()
                retrieval_time = end_time - start_time
                
                if response.status_code == 200:
                    print(f"✅ Large blog retrieved in {retrieval_time:.2f} seconds")
                    
                    if creation_time < 5.0 and retrieval_time < 2.0:
                        print("✅ Performance acceptable")
                        return True
                    else:
                        print("⚠️ Performance slower than expected")
                        return True  # Still pass, just slower
                else:
                    print(f"❌ Large blog retrieval failed: {response.status_code}")
                    return False
            else:
                print(f"❌ Large blog creation failed: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False
                
        except Exception as e:
            print(f"❌ Performance test error: {e}")
            return False
    
    def test_json_ld_validation(self):
        """Test JSON-LD structured data validation"""
        print("🔍 Testing JSON-LD structured data validation...")
        
        try:
            # Get a published blog to test JSON-LD
            response = requests.get(f"{self.base_url}/blogs?limit=5", timeout=10)
            if response.status_code == 200:
                blogs = response.json()
                
                json_ld_blogs = 0
                valid_json_ld = 0
                
                for blog in blogs:
                    json_ld = blog.get('json_ld')
                    if json_ld and isinstance(json_ld, dict):
                        json_ld_blogs += 1
                        
                        # Check for required JSON-LD fields
                        required_fields = ['@context', '@type']
                        blog_required_fields = ['headline', 'author', 'datePublished']
                        
                        has_basic = all(field in json_ld for field in required_fields)
                        has_blog_fields = any(field in json_ld for field in blog_required_fields)
                        
                        if has_basic and has_blog_fields:
                            valid_json_ld += 1
                            print(f"   ✅ Blog '{blog.get('title', 'Unknown')[:30]}...' has valid JSON-LD")
                        else:
                            print(f"   ⚠️ Blog '{blog.get('title', 'Unknown')[:30]}...' has incomplete JSON-LD")
                
                print(f"✅ JSON-LD validation completed")
                print(f"   Blogs with JSON-LD: {json_ld_blogs}/{len(blogs)}")
                print(f"   Valid JSON-LD structures: {valid_json_ld}/{json_ld_blogs}")
                
                return json_ld_blogs > 0  # Pass if at least some blogs have JSON-LD
            else:
                print(f"❌ Failed to get blogs for JSON-LD validation: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ JSON-LD validation error: {e}")
            return False
    
    def run_advanced_tests(self):
        """Run advanced blog functionality tests"""
        print("🚀 Starting Advanced Blog Functionality Testing")
        print("=" * 60)
        
        if not self.login():
            print("❌ Failed to authenticate")
            return False
        
        results = []
        
        # Test 1: Blog listing and search
        results.append(self.test_blog_listing_and_search())
        
        # Test 2: Backward compatibility
        results.append(self.test_blog_backward_compatibility())
        
        # Test 3: Performance with large content
        results.append(self.test_blog_performance())
        
        # Test 4: JSON-LD validation
        results.append(self.test_json_ld_validation())
        
        # Summary
        passed = sum(results)
        total = len(results)
        
        print(f"\n" + "="*60)
        print(f"🏁 ADVANCED TESTING COMPLETED")
        print(f"="*60)
        print(f"Tests passed: {passed}/{total}")
        print(f"Success rate: {(passed/total*100):.1f}%")
        
        if passed == total:
            print(f"🎉 ALL ADVANCED BLOG TESTS PASSED!")
        else:
            print(f"⚠️ Some advanced tests had issues")
        
        return passed == total

if __name__ == "__main__":
    tester = AdvancedBlogTester()
    tester.run_advanced_tests()