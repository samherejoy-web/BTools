#!/usr/bin/env python3

import requests
import json
from datetime import datetime

class SimpleBlogTester:
    def __init__(self):
        self.base_url = "https://sync-and-fix-1.preview.emergentagent.com/api"
        self.token = None
        
    def test_health(self):
        """Test health endpoint"""
        print("🔍 Testing health endpoint...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Health check passed")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_login(self):
        """Test login with superadmin"""
        print("🔍 Testing login...")
        try:
            login_data = {
                "email": "superadmin@marketmind.com",
                "password": "admin123"
            }
            response = requests.post(f"{self.base_url}/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                print(f"✅ Login successful as {data.get('user', {}).get('role', 'unknown')}")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def test_blog_creation(self):
        """Test blog creation with Medium-style fields"""
        if not self.token:
            print("❌ No token available for blog creation")
            return False
            
        print("🔍 Testing blog creation with Medium-style enhancements...")
        
        timestamp = datetime.now().strftime('%H%M%S')
        blog_data = {
            "title": f"Medium-Style Blog Test {timestamp}",
            "content": """
            <h1>Testing Medium-Style Blog Features</h1>
            <p class="lead">This is a comprehensive test of the Medium-style blog enhancements including enhanced typography, reading time calculation, and structured data.</p>
            
            <h2>Key Features Being Tested</h2>
            <ul>
                <li><strong>Enhanced Typography</strong> - Rich text formatting</li>
                <li><strong>Reading Time Calculation</strong> - Automatic estimation</li>
                <li><strong>SEO Optimization</strong> - Meta tags and structured data</li>
                <li><strong>JSON-LD Support</strong> - Schema.org structured data</li>
            </ul>
            
            <blockquote>
                <p>"The best blog platform is one that gets out of the way and lets you focus on writing great content."</p>
            </blockquote>
            
            <h3>Content Analysis</h3>
            <p>This blog post contains approximately 150 words and should have a reading time of about 1 minute. The system should automatically calculate this based on the content length.</p>
            
            <p>Additional content to test word count and reading time calculations. This paragraph adds more substance to ensure accurate reading time estimation.</p>
            """,
            "excerpt": "A comprehensive test of Medium-style blog enhancements including typography, reading time, and SEO features.",
            "tags": ["testing", "medium-style", "blog", "enhancements", "seo"],
            "seo_title": f"Medium-Style Blog Test {timestamp} - Complete Feature Testing",
            "seo_description": "Testing comprehensive Medium-style blog enhancements including typography, reading time calculation, SEO optimization, and JSON-LD structured data support.",
            "seo_keywords": "medium-style, blog, testing, seo, json-ld, typography, reading-time",
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": f"Medium-Style Blog Test {timestamp}",
                "author": {
                    "@type": "Person",
                    "name": "Test Author"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "MarketMindAI"
                },
                "datePublished": datetime.now().isoformat(),
                "description": "Testing Medium-style blog enhancements",
                "wordCount": 150,
                "keywords": ["testing", "medium-style", "blog"]
            }
        }
        
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(f"{self.base_url}/user/blogs", json=blog_data, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Blog created successfully!")
                print(f"   Blog ID: {data.get('id')}")
                print(f"   Blog Slug: {data.get('slug')}")
                print(f"   Reading Time: {data.get('reading_time')} minutes")
                print(f"   Status: {data.get('status')}")
                
                # Verify Medium-style fields
                medium_fields = ['seo_title', 'seo_description', 'seo_keywords', 'json_ld', 'reading_time', 'tags']
                for field in medium_fields:
                    if field in data and data[field]:
                        print(f"   ✅ {field}: Present")
                    else:
                        print(f"   ❌ {field}: Missing or empty")
                
                return data
            else:
                print(f"❌ Blog creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Blog creation error: {e}")
            return None
    
    def test_blog_retrieval(self, blog_data):
        """Test blog retrieval by ID and slug"""
        if not blog_data:
            return False
            
        blog_id = blog_data.get('id')
        blog_slug = blog_data.get('slug')
        
        print("🔍 Testing blog retrieval...")
        
        # Test retrieval by ID
        try:
            response = requests.get(f"{self.base_url}/blogs/{blog_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print("✅ Blog retrieved by ID successfully")
                print(f"   Title: {data.get('title')}")
                print(f"   Reading Time: {data.get('reading_time')} minutes")
            else:
                print(f"❌ Blog retrieval by ID failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Blog retrieval by ID error: {e}")
            return False
        
        # Test retrieval by slug
        if blog_slug:
            try:
                response = requests.get(f"{self.base_url}/blogs/by-slug/{blog_slug}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Blog retrieved by slug successfully")
                    print(f"   SEO Title: {data.get('seo_title')}")
                    print(f"   SEO Description: {data.get('seo_description', '')[:50]}...")
                else:
                    print(f"❌ Blog retrieval by slug failed: {response.status_code}")
                    return False
            except Exception as e:
                print(f"❌ Blog retrieval by slug error: {e}")
                return False
        
        return True
    
    def test_blog_publishing(self, blog_data):
        """Test blog publishing flow"""
        if not blog_data or not self.token:
            return False
            
        blog_id = blog_data.get('id')
        print("🔍 Testing blog publishing...")
        
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(f"{self.base_url}/user/blogs/{blog_id}/publish", headers=headers, timeout=10)
            
            if response.status_code == 200:
                print("✅ Blog published successfully")
                
                # Verify blog appears in public blogs
                response = requests.get(f"{self.base_url}/blogs?limit=10", timeout=10)
                if response.status_code == 200:
                    blogs = response.json()
                    published_blog = next((blog for blog in blogs if blog.get('id') == blog_id), None)
                    if published_blog:
                        print("✅ Published blog found in public list")
                        print(f"   Status: {published_blog.get('status')}")
                        return True
                    else:
                        print("❌ Published blog not found in public list")
                        return False
                else:
                    print(f"❌ Failed to get public blogs: {response.status_code}")
                    return False
            else:
                print(f"❌ Blog publishing failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Blog publishing error: {e}")
            return False
    
    def test_blog_engagement(self, blog_data):
        """Test blog engagement features"""
        if not blog_data or not self.token:
            return False
            
        blog_slug = blog_data.get('slug')
        if not blog_slug:
            return False
            
        print("🔍 Testing blog engagement features...")
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # Test view count increment
        try:
            response = requests.post(f"{self.base_url}/blogs/{blog_slug}/view", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ View count incremented: {data.get('view_count')}")
            else:
                print(f"❌ View count increment failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ View count increment error: {e}")
            return False
        
        # Test blog like
        try:
            response = requests.post(f"{self.base_url}/blogs/{blog_slug}/like", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Blog like toggled: liked={data.get('liked')}, count={data.get('like_count')}")
            else:
                print(f"❌ Blog like failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Blog like error: {e}")
            return False
        
        # Test blog bookmark
        try:
            response = requests.post(f"{self.base_url}/blogs/{blog_slug}/bookmark", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Blog bookmark toggled: bookmarked={data.get('bookmarked')}")
            else:
                print(f"❌ Blog bookmark failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Blog bookmark error: {e}")
            return False
        
        return True
    
    def test_blog_comments(self, blog_data):
        """Test blog comments system"""
        if not blog_data or not self.token:
            return False
            
        blog_slug = blog_data.get('slug')
        if not blog_slug:
            return False
            
        print("🔍 Testing blog comments system...")
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # Create a comment
        comment_data = {
            "content": "This is a test comment for the Medium-style blog post. Great work on the enhancements!"
        }
        
        try:
            response = requests.post(f"{self.base_url}/blogs/{blog_slug}/comments", json=comment_data, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Comment created successfully")
                print(f"   Comment ID: {data.get('id')}")
                print(f"   User: {data.get('user_name')}")
            else:
                print(f"❌ Comment creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Comment creation error: {e}")
            return False
        
        # Get comments
        try:
            response = requests.get(f"{self.base_url}/blogs/{blog_slug}/comments", timeout=10)
            if response.status_code == 200:
                comments = response.json()
                print(f"✅ Comments retrieved: {len(comments)} comments found")
                return True
            else:
                print(f"❌ Comments retrieval failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Comments retrieval error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all blog Medium-style enhancement tests"""
        print("🚀 Starting Blog Medium-Style Enhancement Testing")
        print("=" * 60)
        
        results = []
        
        # Test 1: Health check
        results.append(self.test_health())
        
        # Test 2: Authentication
        results.append(self.test_login())
        
        # Test 3: Blog creation with Medium-style fields
        blog_data = self.test_blog_creation()
        results.append(blog_data is not None)
        
        if blog_data:
            # Test 4: Blog retrieval
            results.append(self.test_blog_retrieval(blog_data))
            
            # Test 5: Blog publishing
            results.append(self.test_blog_publishing(blog_data))
            
            # Test 6: Blog engagement features
            results.append(self.test_blog_engagement(blog_data))
            
            # Test 7: Blog comments
            results.append(self.test_blog_comments(blog_data))
        
        # Summary
        passed = sum(results)
        total = len(results)
        
        print(f"\n" + "="*60)
        print(f"🏁 TESTING COMPLETED")
        print(f"="*60)
        print(f"Tests passed: {passed}/{total}")
        print(f"Success rate: {(passed/total*100):.1f}%")
        
        if passed == total:
            print(f"🎉 ALL BLOG MEDIUM-STYLE ENHANCEMENT TESTS PASSED!")
        else:
            print(f"⚠️ Some tests failed")
        
        return passed == total

if __name__ == "__main__":
    tester = SimpleBlogTester()
    tester.run_all_tests()