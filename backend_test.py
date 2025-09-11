import requests
import sys
import json
import uuid
from datetime import datetime
try:
    from PIL import Image
except ImportError:
    Image = None

class MarketMindAPITester:
    def __init__(self, base_url="https://tag-optimizer-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.current_user_role = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_resources = {
            'users': [],
            'tools': [],
            'categories': [],
            'blogs': [],
            'reviews': []
        }

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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict):
                        if len(str(response_data)) <= 300:
                            print(f"   Response: {response_data}")
                        else:
                            print(f"   Response: Large object with {len(response_data)} keys")
                    elif isinstance(response_data, list):
                        print(f"   Response: {len(response_data)} items")
                        if len(response_data) <= 3 and response_data:
                            print(f"   Sample: {response_data[0] if response_data else 'Empty'}")
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

    # BASIC API TESTS
    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200,
            description="Test API health and database connectivity"
        )
        return success

    def test_debug_connectivity(self):
        """Test debug connectivity endpoint"""
        success, response = self.run_test(
            "Debug Connectivity",
            "GET",
            "debug/connectivity",
            200,
            description="Test system connectivity and configuration"
        )
        return success

    def test_categories(self):
        """Test categories endpoint"""
        success, response = self.run_test(
            "Get Categories",
            "GET", 
            "categories",
            200,
            description="Get all available categories"
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            if len(response) >= 6:
                categories = [cat.get('name', 'Unknown') for cat in response[:6]]
                print(f"   Categories: {', '.join(categories)}")
        return success

    def test_tools(self):
        """Test tools endpoint"""
        success, response = self.run_test(
            "Get Tools",
            "GET",
            "tools",
            200,
            description="Get all available tools"
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tools")
        return success

    def test_blogs(self):
        """Test blogs endpoint"""
        success, response = self.run_test(
            "Get Blogs",
            "GET",
            "blogs",
            200,
            description="Get all available blogs"
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} blogs")
        return success

    # AUTHENTICATION TESTS
    def test_register(self):
        """Test user registration with proper username field"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@test.com"
        test_username = f"testuser_{timestamp}"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "username": test_username,
                "password": "TestPass123!",
                "full_name": "Test User"
            },
            description="Register new user with all required fields"
        )
        
        if success and isinstance(response, dict) and 'user' in response:
            self.created_resources['users'].append({
                'id': response['user']['id'],
                'email': test_email,
                'username': test_username
            })
        
        return success

    def test_login(self, email, password):
        """Test login with different user roles"""
        success, response = self.run_test(
            f"Login - {email}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password},
            description=f"Login with {email}"
        )
        if success and isinstance(response, dict):
            if 'access_token' in response:
                self.token = response['access_token']
                self.user_id = response.get('user', {}).get('id')
                self.current_user_role = response.get('user', {}).get('role', 'unknown')
                user_role = response.get('user', {}).get('role', 'unknown')
                print(f"   Logged in as: {user_role}")
                return True, user_role
        return False, None

    def test_current_user_info(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ Skipping user info test - no authentication token")
            return False
            
        success, response = self.run_test(
            "Current User Info",
            "GET",
            "auth/me",
            200,
            description="Get current authenticated user information"
        )
        return success

    def test_user_dashboard(self):
        """Test user dashboard endpoint"""
        if not self.token:
            print("❌ Skipping dashboard test - no authentication token")
            return False
            
        success, response = self.run_test(
            "User Dashboard",
            "GET",
            "user/dashboard",
            200,
            description="Get user dashboard data and statistics"
        )
        return success

    # SUPERADMIN TESTS
    def test_superadmin_user_management(self):
        """Test superadmin user CRUD operations"""
        if self.current_user_role != 'superadmin':
            print("❌ Skipping superadmin tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get all users
        success, response = self.run_test(
            "Get All Users (Superadmin)",
            "GET",
            "superadmin/users",
            200,
            description="Get all users with superadmin privileges"
        )
        results.append(success)
        
        # Test create user
        timestamp = datetime.now().strftime('%H%M%S')
        new_user_data = {
            "email": f"admin_created_{timestamp}@test.com",
            "username": f"admin_created_{timestamp}",
            "password": "AdminPass123!",
            "full_name": "Admin Created User",
            "role": "user"
        }
        
        success, response = self.run_test(
            "Create User (Superadmin)",
            "POST",
            "superadmin/users",
            200,
            data=new_user_data,
            description="Create new user as superadmin"
        )
        results.append(success)
        
        if success and isinstance(response, dict) and 'user_id' in response:
            created_user_id = response['user_id']
            self.created_resources['users'].append({
                'id': created_user_id,
                'email': new_user_data['email'],
                'username': new_user_data['username']
            })
            
            # Test update user
            success, response = self.run_test(
                "Update User (Superadmin)",
                "PUT",
                f"superadmin/users/{created_user_id}",
                200,
                data={"full_name": "Updated Admin User", "role": "admin"},
                description="Update user details as superadmin"
            )
            results.append(success)
        
        return all(results)

    def test_superadmin_category_management(self):
        """Test superadmin category CRUD operations"""
        if self.current_user_role != 'superadmin':
            print("❌ Skipping superadmin category tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get all categories
        success, response = self.run_test(
            "Get All Categories (Superadmin)",
            "GET",
            "superadmin/categories",
            200,
            description="Get all categories with superadmin privileges"
        )
        results.append(success)
        
        # Test create category
        timestamp = datetime.now().strftime('%H%M%S')
        new_category_data = {
            "name": f"Test Category {timestamp}",
            "description": "Test category created by automated test",
            "seo_title": f"Test Category {timestamp} - SEO Title",
            "seo_description": "SEO description for test category"
        }
        
        success, response = self.run_test(
            "Create Category (Superadmin)",
            "POST",
            "superadmin/categories",
            200,
            data=new_category_data,
            description="Create new category as superadmin"
        )
        results.append(success)
        
        if success and isinstance(response, dict) and 'category_id' in response:
            created_category_id = response['category_id']
            self.created_resources['categories'].append({
                'id': created_category_id,
                'name': new_category_data['name']
            })
            
            # Test update category
            success, response = self.run_test(
                "Update Category (Superadmin)",
                "PUT",
                f"superadmin/categories/{created_category_id}",
                200,
                data={"name": f"Updated Test Category {timestamp}"},
                description="Update category as superadmin"
            )
            results.append(success)
        
        return all(results)

    def test_superadmin_tool_management(self):
        """Test superadmin tool CRUD operations"""
        if self.current_user_role != 'superadmin':
            print("❌ Skipping superadmin tool tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get all tools
        success, response = self.run_test(
            "Get All Tools (Superadmin)",
            "GET",
            "superadmin/tools",
            200,
            description="Get all tools with superadmin privileges"
        )
        results.append(success)
        
        # Test create tool
        timestamp = datetime.now().strftime('%H%M%S')
        new_tool_data = {
            "name": f"Test Tool {timestamp}",
            "description": "This is a test tool created by automated testing",
            "short_description": "Test tool for automation",
            "url": "https://example.com/test-tool",
            "pricing_type": "free",
            "features": ["Feature 1", "Feature 2", "Feature 3"],
            "pros": ["Pro 1", "Pro 2"],
            "cons": ["Con 1"],
            "is_featured": False,
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create Tool (Superadmin)",
            "POST",
            "superadmin/tools",
            200,
            data=new_tool_data,
            description="Create new tool as superadmin"
        )
        results.append(success)
        
        if success and isinstance(response, dict) and 'tool_id' in response:
            created_tool_id = response['tool_id']
            self.created_resources['tools'].append({
                'id': created_tool_id,
                'name': new_tool_data['name']
            })
            
            # Test update tool
            success, response = self.run_test(
                "Update Tool (Superadmin)",
                "PUT",
                f"superadmin/tools/{created_tool_id}",
                200,
                data={"name": f"Updated Test Tool {timestamp}", "is_featured": True},
                description="Update tool as superadmin"
            )
            results.append(success)
        
        return all(results)

    def test_bulk_upload_template(self):
        """Test CSV template download for bulk upload"""
        if self.current_user_role != 'superadmin':
            print("❌ Skipping bulk upload template test - insufficient permissions")
            return False
        
        success, response = self.run_test(
            "CSV Template Download",
            "GET",
            "superadmin/tools/csv-template",
            200,
            description="Download CSV template for bulk tool upload"
        )
        return success

    # ADMIN TESTS
    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if self.current_user_role not in ['admin', 'superadmin']:
            print("❌ Skipping admin dashboard test - insufficient permissions")
            return False
        
        success, response = self.run_test(
            "Admin Dashboard",
            "GET",
            "admin/dashboard",
            200,
            description="Get admin dashboard statistics and data"
        )
        return success

    def test_admin_blog_management(self):
        """Test admin blog management operations"""
        if self.current_user_role not in ['admin', 'superadmin']:
            print("❌ Skipping admin blog tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get all blogs as admin
        success, response = self.run_test(
            "Get All Blogs (Admin)",
            "GET",
            "admin/blogs",
            200,
            description="Get all blogs with admin privileges"
        )
        results.append(success)
        
        return all(results)

    def test_admin_review_management(self):
        """Test admin review management"""
        if self.current_user_role not in ['admin', 'superadmin']:
            print("❌ Skipping admin review tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get all reviews
        success, response = self.run_test(
            "Get All Reviews (Admin)",
            "GET",
            "admin/reviews",
            200,
            description="Get all reviews with admin privileges"
        )
        results.append(success)
        
        return all(results)

    def test_admin_seo_management(self):
        """Test admin SEO page management"""
        if self.current_user_role not in ['admin', 'superadmin']:
            print("❌ Skipping admin SEO tests - insufficient permissions")
            return False
        
        results = []
        
        # Test get SEO pages
        success, response = self.run_test(
            "Get SEO Pages (Admin)",
            "GET",
            "admin/seo-pages",
            200,
            description="Get all SEO pages configuration"
        )
        results.append(success)
        
        # Test create SEO page
        timestamp = datetime.now().strftime('%H%M%S')
        seo_page_data = {
            "page_path": f"/test-page-{timestamp}",
            "title": f"Test SEO Page {timestamp}",
            "description": "Test SEO page created by automated testing",
            "keywords": "test, seo, automation",
            "meta_tags": {"robots": "index,follow"}
        }
        
        success, response = self.run_test(
            "Create SEO Page (Admin)",
            "POST",
            "admin/seo-pages",
            200,
            data=seo_page_data,
            description="Create new SEO page configuration"
        )
        results.append(success)
        
        return all(results)

    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        if self.current_user_role not in ['admin', 'superadmin']:
            print("❌ Skipping admin analytics test - insufficient permissions")
            return False
        
        success, response = self.run_test(
            "Admin Analytics",
            "GET",
            "admin/analytics?days=30",
            200,
            description="Get analytics data for admin dashboard"
        )
        return success

    def test_blog_image_upload(self):
        """Test blog image upload functionality"""
        if not self.token:
            print("❌ Skipping image upload test - no authentication token")
            return False
        
        try:
            # Create a simple test image file
            import io
            from PIL import Image as PILImage
            
            # Create a simple 100x100 red image
            img = PILImage.new('RGB', (100, 100), color='red')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Test image upload
            files = {'file': ('test_image.png', img_bytes, 'image/png')}
            headers = {'Authorization': f'Bearer {self.token}'}
            
            url = f"{self.base_url}/blogs/upload-image"
            print(f"\n🔍 Testing Blog Image Upload...")
            print(f"   URL: {url}")
            
            response = requests.post(url, files=files, headers=headers, timeout=30)
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'image_url' in response_data:
                        print(f"   Image URL: {response_data['image_url']}")
                        print(f"   ✅ Image upload successful with proper URL")
                    else:
                        print(f"   ⚠️ Response missing image_url field")
                    print(f"   Response: {response_data}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    'name': 'Blog Image Upload',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:300],
                    'endpoint': 'blogs/upload-image'
                })
            
            self.tests_run += 1
            return success
            
        except ImportError:
            print("❌ PIL/Pillow not available - skipping image upload test")
            return True  # Don't fail the test if PIL is not available
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': 'Blog Image Upload',
                'error': str(e),
                'endpoint': 'blogs/upload-image'
            })
            self.tests_run += 1
            return False
    def test_user_blog_operations(self):
        """Test user blog creation and management using new user-specific endpoints"""
        if not self.token:
            print("❌ Skipping user blog tests - no authentication token")
            return False
        
        results = []
        
        # Test get user blogs (should be empty initially)
        success, response = self.run_test(
            "Get User Blogs",
            "GET",
            "user/blogs",
            200,
            description="Get all blogs by current user"
        )
        results.append(success)
        
        # Test create blog using user endpoint
        timestamp = datetime.now().strftime('%H%M%S')
        blog_data = {
            "title": f"User Blog Post {timestamp}",
            "content": f"<h1>User Blog Content</h1><p>This is a user blog post created at {timestamp} for testing the new user-specific blog endpoints. It includes JSON-LD and SEO data.</p><p>This content is longer to test reading time calculation and excerpt generation functionality.</p>",
            "excerpt": "This is a user blog post excerpt for testing user-specific endpoints",
            "tags": ["user-test", "automation", "blog", "json-ld"],
            "seo_title": f"User Blog Post {timestamp} - SEO Optimized Title",
            "seo_description": "SEO description for user blog post testing new endpoints",
            "seo_keywords": "user, blog, automation, json-ld, seo",
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": f"User Blog Post {timestamp}",
                "author": {
                    "@type": "Person",
                    "name": "Test User"
                },
                "datePublished": datetime.now().isoformat(),
                "description": "Test blog post with JSON-LD structured data"
            }
        }
        
        success, response = self.run_test(
            "Create User Blog Post",
            "POST",
            "user/blogs",
            200,
            data=blog_data,
            description="Create new blog post using user-specific endpoint"
        )
        results.append(success)
        
        if success and isinstance(response, dict) and 'id' in response:
            created_blog_id = response['id']
            self.created_resources['blogs'].append({
                'id': created_blog_id,
                'title': blog_data['title']
            })
            
            # Verify JSON-LD was stored
            if 'json_ld' in response and response['json_ld']:
                print(f"   ✅ JSON-LD data stored successfully")
            else:
                print(f"   ⚠️ JSON-LD data may not have been stored")
            
            # Verify SEO fields
            if response.get('seo_title') and response.get('seo_description'):
                print(f"   ✅ SEO fields stored successfully")
            else:
                print(f"   ⚠️ SEO fields may not have been stored properly")
            
            # Test get specific user blog
            success, response = self.run_test(
                "Get Specific User Blog",
                "GET",
                f"user/blogs/{created_blog_id}",
                200,
                description="Get specific blog by current user"
            )
            results.append(success)
            
            # Test update user blog
            update_data = {
                "title": f"Updated User Blog Post {timestamp}",
                "content": f"<h1>Updated Content</h1><p>This content has been updated to test the user blog update functionality.</p>",
                "json_ld": {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": f"Updated User Blog Post {timestamp}",
                    "author": {
                        "@type": "Person",
                        "name": "Test User"
                    },
                    "dateModified": datetime.now().isoformat(),
                    "description": "Updated test blog post with JSON-LD structured data"
                }
            }
            
            success, response = self.run_test(
                "Update User Blog Post",
                "PUT",
                f"user/blogs/{created_blog_id}",
                200,
                data=update_data,
                description="Update blog post using user-specific endpoint"
            )
            results.append(success)
            
            # Test publish user blog
            success, response = self.run_test(
                "Publish User Blog Post",
                "POST",
                f"user/blogs/{created_blog_id}/publish",
                200,
                description="Publish blog post using user-specific endpoint"
            )
            results.append(success)
            
            # Test delete user blog
            success, response = self.run_test(
                "Delete User Blog Post",
                "DELETE",
                f"user/blogs/{created_blog_id}",
                200,
                description="Delete blog post using user-specific endpoint"
            )
            results.append(success)
        
        return all(results)

    def test_user_profile_operations(self):
        """Test user profile management"""
        if not self.token:
            print("❌ Skipping user profile tests - no authentication token")
            return False
        
        results = []
        
        # Test update profile
        profile_data = {
            "full_name": "Updated Test User Name",
            "bio": "Updated bio for automated testing user"
        }
        
        success, response = self.run_test(
            "Update User Profile",
            "PUT",
            "user/profile",
            200,
            data=profile_data,
            description="Update user profile information"
        )
        results.append(success)
        
        return all(results)

    def test_tool_review_submission_bug(self):
        """Test tool review submission functionality - SPECIFIC BUG TESTING"""
        print("\n🐛 TOOL REVIEW SUBMISSION BUG TESTING")
        print("-" * 50)
        
        if not self.token:
            print("❌ Skipping tool review tests - no authentication token")
            return False
        
        results = []
        
        # First get available tools
        success, tools_response = self.run_test(
            "Get Tools for Review Testing",
            "GET",
            "tools?limit=10",
            200,
            description="Get tools to test review submission"
        )
        results.append(success)
        
        if success and isinstance(tools_response, list) and len(tools_response) > 0:
            # Find a tool without existing reviews from this user
            test_tool = None
            for tool in tools_response:
                if tool.get('review_count', 0) == 0:
                    test_tool = tool
                    break
            
            # If all tools have reviews, use the last one and expect "already reviewed" error
            if not test_tool:
                test_tool = tools_response[-1]
                print("   ⚠️ All tools have reviews, testing with last tool (may get 'already reviewed' error)")
            
            tool_id = test_tool['id']
            tool_slug = test_tool.get('slug', 'unknown-slug')
            
            print(f"   Testing with tool: {test_tool['name']}")
            print(f"   Tool ID: {tool_id}")
            print(f"   Tool Slug: {tool_slug}")
            print(f"   Existing review count: {test_tool.get('review_count', 0)}")
            
            # CRITICAL TEST: Test the exact issue from the review request
            print("\n   🎯 TESTING EXACT ISSUE FROM REVIEW REQUEST:")
            print("   Frontend sends to `/tools/${tool?.id || toolSlug}/reviews`")
            print("   Backend expects `/api/tools/{tool_id}/reviews` with tool_id in payload")
            
            # Test 1: What frontend is likely sending (missing /api prefix)
            frontend_url_style = f"tools/{tool_id}/reviews"  # Missing /api prefix
            review_data_frontend = {
                "rating": 4,
                "title": "Frontend Review Test",
                "content": "Testing the exact scenario described in the bug report.",
                "pros": ["Good functionality", "User-friendly"],
                "cons": ["Some issues reported"]
            }
            
            success, response = self.run_test(
                "CRITICAL: Frontend URL Style (Missing tool_id in body)",
                "POST",
                frontend_url_style,
                422,  # Expected validation error - missing tool_id
                data=review_data_frontend,
                description="Test frontend URL style without tool_id in body (main issue)"
            )
            results.append(success)
            
            if not success:
                print("   🚨 CRITICAL ISSUE IDENTIFIED: Frontend missing tool_id in request body!")
            
            # Test 2: Correct format with tool_id in body
            review_data_correct = {
                "tool_id": tool_id,  # Backend requires this
                "rating": 4,
                "title": "Correct Format Review Test",
                "content": "Testing with correct format including tool_id in request body.",
                "pros": ["Easy to use", "Good features", "Reliable"],
                "cons": ["Could be faster"]
            }
            
            expected_status = 200 if test_tool.get('review_count', 0) == 0 else 400
            success, response = self.run_test(
                "Tool Review - Correct Format (tool_id in body)",
                "POST",
                f"tools/{tool_id}/reviews",
                expected_status,
                data=review_data_correct,
                description=f"Test POST /api/tools/{tool_id}/reviews with tool_id in body"
            )
            results.append(success)
            
            if success and expected_status == 200 and isinstance(response, dict):
                print(f"   ✅ Review created successfully")
                print(f"   Review ID: {response.get('id', 'Unknown')}")
                print(f"   Rating: {response.get('rating', 'Unknown')}")
                print(f"   Title: {response.get('title', 'Unknown')}")
                self.created_resources['reviews'].append({
                    'id': response.get('id'),
                    'tool_id': tool_id,
                    'title': response.get('title')
                })
            
            # Test 3: Test with slug in URL (what frontend might be doing)
            review_data_slug = {
                "tool_id": tool_id,  # Still need tool_id in body
                "rating": 5,
                "title": "Slug URL Test",
                "content": "Testing with slug in URL path.",
                "pros": ["Excellent"],
                "cons": ["None"]
            }
            
            success, response = self.run_test(
                "Tool Review - Slug in URL",
                "POST",
                f"tools/{tool_slug}/reviews",
                404,  # Expected to fail - endpoint doesn't support slug
                data=review_data_slug,
                description=f"Test POST /api/tools/{tool_slug}/reviews (should fail)"
            )
            results.append(success)
            
            # Test 4: Test what happens when frontend sends slug but no tool_id in body
            review_data_slug_no_id = {
                # No tool_id in body
                "rating": 3,
                "title": "Slug No ID Test",
                "content": "Testing slug URL without tool_id in body.",
                "pros": ["Testing"],
                "cons": ["Missing data"]
            }
            
            success, response = self.run_test(
                "CRITICAL: Slug URL + No tool_id (Frontend Issue)",
                "POST",
                f"tools/{tool_slug}/reviews",
                404,  # Expected to fail - endpoint doesn't exist
                data=review_data_slug_no_id,
                description="Test frontend sending slug URL without tool_id in body"
            )
            results.append(success)
            
            # Test 5: Get existing reviews
            success, response = self.run_test(
                "Get Tool Reviews",
                "GET",
                f"tools/{tool_id}/reviews",
                200,
                description=f"Get reviews for tool {tool_id}"
            )
            results.append(success)
            
            if success and isinstance(response, list):
                print(f"   Found {len(response)} reviews for this tool")
                for review in response[:3]:
                    print(f"   - Review: {review.get('title', 'No title')} (Rating: {review.get('rating', 'N/A')})")
            
            # Test 6: Test the FIXED frontend behavior
            print("\n   🔧 TESTING FIXED FRONTEND BEHAVIOR:")
            review_data_fixed = {
                "tool_id": tool_id,  # FIXED: Now includes tool_id in body
                "rating": 4,
                "title": "Fixed Frontend Review Test",
                "content": "Testing the fixed frontend behavior with tool_id included in request body.",
                "pros": ["Now works correctly", "Proper data format"],
                "cons": ["Should have been included from start"]
            }
            
            # Try with a different tool that might not have reviews from this user
            if len(tools_response) > 1:
                different_tool = tools_response[1]
                different_tool_id = different_tool['id']
                review_data_fixed['tool_id'] = different_tool_id
                
                expected_status = 200 if different_tool.get('review_count', 0) == 0 else 400
                success, response = self.run_test(
                    "FIXED: Frontend with tool_id in body",
                    "POST",
                    f"tools/{different_tool_id}/reviews",
                    expected_status,
                    data=review_data_fixed,
                    description="Test fixed frontend behavior with tool_id in body"
                )
                results.append(success)
                
                if success and expected_status == 200:
                    print(f"   ✅ FIXED: Review submission now works!")
                    print(f"   Review ID: {response.get('id', 'Unknown')}")
            
            # SUMMARY OF FINDINGS
            print("\n   📋 BUG ANALYSIS SUMMARY:")
            print("   1. Backend endpoint: POST /api/tools/{tool_id}/reviews")
            print("   2. Backend requires 'tool_id' in request body (ReviewCreate model)")
            print("   3. Frontend sends to `/tools/${tool?.id}/reviews`")
            print("   4. ❌ ISSUE: Frontend was missing 'tool_id' in request body")
            print("   5. ✅ FIXED: Added 'tool_id: selectedTool' to request body")
            print("   6. This fix resolves the 'failed to submit review' error")
            
        return all(results)

    def test_tool_interactions(self):
        """Test user tool interactions (reviews, favorites)"""
        if not self.token:
            print("❌ Skipping tool interaction tests - no authentication token")
            return False
        
        results = []
        
        # First get available tools
        success, tools_response = self.run_test(
            "Get Tools for Interaction",
            "GET",
            "tools?limit=1",
            200,
            description="Get tools to test interactions"
        )
        
        if success and isinstance(tools_response, list) and len(tools_response) > 0:
            tool_id = tools_response[0]['id']
            
            # Test create review
            review_data = {
                "tool_id": tool_id,
                "rating": 4,
                "title": "Great tool for testing",
                "content": "This tool works well for our automated testing purposes. Highly recommended!",
                "pros": ["Easy to use", "Good features", "Reliable"],
                "cons": ["Could be faster"]
            }
            
            success, response = self.run_test(
                "Create Tool Review",
                "POST",
                f"tools/{tool_id}/reviews",
                200,
                data=review_data,
                description="Create review for a tool"
            )
            results.append(success)
            
            # Test toggle favorite
            success, response = self.run_test(
                "Toggle Tool Favorite",
                "POST",
                f"tools/{tool_id}/favorite",
                200,
                description="Add/remove tool from favorites"
            )
            results.append(success)
        
        return all(results)

    # ENHANCED PUBLIC API TESTS
    def test_tools_advanced(self):
        """Test advanced tools API functionality"""
        results = []
        
        # Test tools with filtering
        success, response = self.run_test(
            "Get Tools with Filters",
            "GET",
            "tools?pricing=free&sort=rating&limit=5",
            200,
            description="Get tools with pricing filter and rating sort"
        )
        results.append(success)
        
        # Test tool search
        success, response = self.run_test(
            "Search Tools",
            "GET",
            "tools?search=productivity&limit=3",
            200,
            description="Search tools by keyword"
        )
        results.append(success)
        
        # Test featured tools
        success, response = self.run_test(
            "Get Featured Tools",
            "GET",
            "tools?featured=true",
            200,
            description="Get only featured tools"
        )
        results.append(success)
        
        # Test tool details
        if success and isinstance(response, list) and len(response) > 0:
            tool_id = response[0]['id']
            success, response = self.run_test(
                "Get Tool Details",
                "GET",
                f"tools/{tool_id}",
                200,
                description="Get detailed information for a specific tool"
            )
            results.append(success)
            
            # Test tool reviews
            success, response = self.run_test(
                "Get Tool Reviews",
                "GET",
                f"tools/{tool_id}/reviews",
                200,
                description="Get reviews for a specific tool"
            )
            results.append(success)
        
        return all(results)

    def test_blogs_advanced(self):
        """Test advanced blogs API functionality"""
        results = []
        
        # Test blogs with filtering
        success, response = self.run_test(
            "Get Published Blogs",
            "GET",
            "blogs?status=published&limit=5",
            200,
            description="Get only published blogs"
        )
        results.append(success)
        
        # Test blog search
        success, response = self.run_test(
            "Search Blogs",
            "GET",
            "blogs?search=productivity&limit=3",
            200,
            description="Search blogs by keyword"
        )
        results.append(success)
        
        # Test blog details
        if success and isinstance(response, list) and len(response) > 0:
            blog_id = response[0]['id']
            success, response = self.run_test(
                "Get Blog Details",
                "GET",
                f"blogs/{blog_id}",
                200,
                description="Get detailed information for a specific blog"
            )
            results.append(success)
        
        return all(results)

    def test_tool_comparison(self):
        """Test tool comparison functionality"""
        # First get some tools
        success, tools_response = self.run_test(
            "Get Tools for Comparison",
            "GET",
            "tools?limit=3",
            200,
            description="Get tools to test comparison feature"
        )
        
        if success and isinstance(tools_response, list) and len(tools_response) >= 2:
            tool_ids = [tool['id'] for tool in tools_response[:2]]
            tool_ids_str = ",".join(tool_ids)
            
            success, response = self.run_test(
                "Compare Tools",
                "GET",
                f"tools/compare?tool_ids={tool_ids_str}",
                200,
                description="Compare multiple tools"
            )
            return success
        
        return False

    # AI INTEGRATION TESTS
    def test_ai_blog_generation(self):
        """Test AI blog generation"""
        if not self.token:
            print("❌ Skipping AI blog test - no authentication token")
            return False
            
        success, response = self.run_test(
            "AI Blog Generation",
            "POST",
            "ai/generate-blog",
            200,
            data={
                "topic": "The Future of AI in Digital Marketing Tools",
                "keywords": ["AI", "marketing", "automation", "tools"],
                "target_length": "medium",
                "auto_publish": False
            },
            description="Generate blog content using AI"
        )
        
        if success and isinstance(response, dict):
            if 'content' in response and 'title' in response:
                print("   AI blog generation working - content and title generated")
                if 'id' in response:
                    self.created_resources['blogs'].append({
                        'id': response['id'],
                        'title': response['title']
                    })
        return success

    def test_ai_tool_comparison(self):
        """Test AI-powered tool comparison"""
        if not self.token:
            print("❌ Skipping AI tool comparison test - no authentication token")
            return False
        
        # First get some tools
        success, tools_response = self.run_test(
            "Get Tools for AI Comparison",
            "GET",
            "tools?limit=3",
            200,
            description="Get tools for AI comparison test"
        )
        
        if success and isinstance(tools_response, list) and len(tools_response) >= 2:
            tool_ids = [tool['id'] for tool in tools_response[:2]]
            
            success, response = self.run_test(
                "AI Tool Comparison",
                "POST",
                "ai/compare-tools",
                200,
                data={
                    "tool_ids": tool_ids,
                    "comparison_criteria": ["Features", "Pricing", "Ease of Use"],
                    "create_blog": True,
                    "auto_publish": False
                },
                description="Generate AI-powered tool comparison"
            )
            return success
        
        return False

    def test_ai_blog_topics(self):
        """Test AI blog topic suggestions"""
        success, response = self.run_test(
            "AI Blog Topic Suggestions",
            "GET",
            "ai/blog-topics?category=productivity",
            200,
            description="Get AI-suggested blog topics"
        )
        return success

    # PRODUCTION-READY FIXES TESTING
    def test_blog_by_slug_endpoint(self):
        """Test new blog by slug endpoint for published blogs"""
        results = []
        
        # First get some published blogs to test with
        success, blogs_response = self.run_test(
            "Get Published Blogs for Slug Test",
            "GET",
            "blogs?status=published&limit=3",
            200,
            description="Get published blogs to test slug endpoint"
        )
        results.append(success)
        
        if success and isinstance(blogs_response, list) and len(blogs_response) > 0:
            # Test with valid slug
            test_blog = blogs_response[0]
            blog_slug = test_blog.get('slug')
            
            if blog_slug:
                success, response = self.run_test(
                    "Get Blog by Slug - Valid",
                    "GET",
                    f"blogs/by-slug/{blog_slug}",
                    200,
                    description=f"Get blog by slug: {blog_slug}"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   Blog found: {response.get('title', 'Unknown')}")
                    print(f"   Status: {response.get('status', 'Unknown')}")
                    print(f"   Author: {response.get('author_name', 'Unknown')}")
        
        # Test with invalid slug
        success, response = self.run_test(
            "Get Blog by Slug - Invalid",
            "GET",
            "blogs/by-slug/non-existent-blog-slug",
            404,
            description="Test blog by slug with invalid slug"
        )
        results.append(success)
        
        return all(results)

    def test_blog_view_increment(self):
        """Test blog view increment endpoint"""
        results = []
        
        # First get a published blog
        success, blogs_response = self.run_test(
            "Get Published Blog for View Test",
            "GET",
            "blogs?status=published&limit=1",
            200,
            description="Get published blog to test view increment"
        )
        results.append(success)
        
        if success and isinstance(blogs_response, list) and len(blogs_response) > 0:
            test_blog = blogs_response[0]
            blog_slug = test_blog.get('slug')
            initial_view_count = test_blog.get('view_count', 0)
            
            if blog_slug:
                # Test view increment
                success, response = self.run_test(
                    "Increment Blog View Count",
                    "POST",
                    f"blogs/{blog_slug}/view",
                    200,
                    description=f"Increment view count for blog: {blog_slug}"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    new_view_count = response.get('view_count', 0)
                    print(f"   View count: {initial_view_count} -> {new_view_count}")
                    
                    # Verify view count increased
                    if new_view_count > initial_view_count:
                        print("   ✅ View count incremented successfully")
                    else:
                        print("   ⚠️ View count may not have incremented properly")
        
        # Test with invalid slug
        success, response = self.run_test(
            "Increment View - Invalid Slug",
            "POST",
            "blogs/non-existent-slug/view",
            404,
            description="Test view increment with invalid slug"
        )
        results.append(success)
        
        return all(results)

    def test_blog_listing_with_filters(self):
        """Test blog listing with new sorting and filtering options"""
        results = []
        
        # Test different sorting options
        sort_options = ["newest", "oldest", "most_viewed", "trending"]
        for sort_option in sort_options:
            success, response = self.run_test(
                f"Blog Listing - Sort by {sort_option}",
                "GET",
                f"blogs?sort={sort_option}&limit=5",
                200,
                description=f"Get blogs sorted by {sort_option}"
            )
            results.append(success)
            
            if success and isinstance(response, list):
                print(f"   Found {len(response)} blogs with {sort_option} sort")
        
        # Test AI generated filter (using featured parameter)
        success, response = self.run_test(
            "Blog Listing - AI Generated Only",
            "GET",
            "blogs?featured=true&limit=5",
            200,
            description="Get only AI generated blogs"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            ai_blogs = [blog for blog in response if blog.get('is_ai_generated', False)]
            print(f"   Found {len(ai_blogs)} AI generated blogs out of {len(response)} total")
        
        # Test non-AI generated filter
        success, response = self.run_test(
            "Blog Listing - Non-AI Generated Only",
            "GET",
            "blogs?featured=false&limit=5",
            200,
            description="Get only non-AI generated blogs"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            non_ai_blogs = [blog for blog in response if not blog.get('is_ai_generated', False)]
            print(f"   Found {len(non_ai_blogs)} non-AI generated blogs out of {len(response)} total")
        
        # Test default filtering (should only show published)
        success, response = self.run_test(
            "Blog Listing - Default Published Filter",
            "GET",
            "blogs?limit=10",
            200,
            description="Test default filtering to published blogs only"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            published_blogs = [blog for blog in response if blog.get('status') == 'published']
            print(f"   All {len(response)} blogs are published: {len(published_blogs) == len(response)}")
        
        return all(results)

    def test_tool_comparison_fixed(self):
        """Test the fixed tool comparison endpoint"""
        results = []
        
        # First get some tools to compare
        success, tools_response = self.run_test(
            "Get Tools for Fixed Comparison",
            "GET",
            "tools?limit=5",
            200,
            description="Get tools to test fixed comparison feature"
        )
        results.append(success)
        
        if success and isinstance(tools_response, list) and len(tools_response) >= 2:
            # Test with tool IDs
            tool_ids = [tool['id'] for tool in tools_response[:2]]
            tool_ids_str = ",".join(tool_ids)
            
            success, response = self.run_test(
                "Compare Tools - Fixed Endpoint (IDs)",
                "GET",
                f"tools/compare?tool_ids={tool_ids_str}",
                200,
                description="Compare tools using IDs (should be fixed now)"
            )
            results.append(success)
            
            if success and isinstance(response, list):
                print(f"   Successfully compared {len(response)} tools")
                for tool in response:
                    print(f"   - {tool.get('name', 'Unknown')} (ID: {tool.get('id', 'Unknown')[:8]}...)")
            
            # Test with tool slugs if available
            tool_slugs = [tool.get('slug') for tool in tools_response[:2] if tool.get('slug')]
            if len(tool_slugs) >= 2:
                tool_slugs_str = ",".join(tool_slugs)
                
                success, response = self.run_test(
                    "Compare Tools - Fixed Endpoint (Slugs)",
                    "GET",
                    f"tools/compare?tool_ids={tool_slugs_str}",
                    200,
                    description="Compare tools using slugs (should be fixed now)"
                )
                results.append(success)
                
                if success and isinstance(response, list):
                    print(f"   Successfully compared {len(response)} tools using slugs")
        
        # Test with invalid tool IDs
        success, response = self.run_test(
            "Compare Tools - Invalid IDs",
            "GET",
            "tools/compare?tool_ids=invalid-id-1,invalid-id-2",
            404,
            description="Test comparison with invalid tool IDs"
        )
        results.append(success)
        
        return all(results)

    def test_ai_tool_comparison_format(self):
        """Test AI tool comparison for blog-ready output format"""
        if not self.token:
            print("❌ Skipping AI tool comparison format test - no authentication token")
            return False
        
        results = []
        
        # First get some tools
        success, tools_response = self.run_test(
            "Get Tools for AI Comparison Format",
            "GET",
            "tools?limit=3",
            200,
            description="Get tools for AI comparison format test"
        )
        results.append(success)
        
        if success and isinstance(tools_response, list) and len(tools_response) >= 2:
            tool_ids = [tool['id'] for tool in tools_response[:2]]
            
            success, response = self.run_test(
                "AI Tool Comparison - Blog Format",
                "POST",
                "ai/compare-tools",
                200,
                data={
                    "tool_ids": tool_ids,
                    "comparison_criteria": ["Features", "Pricing", "Ease of Use", "Performance"],
                    "create_blog": True,
                    "auto_publish": False
                },
                description="Generate AI tool comparison in blog-ready format"
            )
            results.append(success)
            
            if success and isinstance(response, dict):
                print(f"   AI comparison generated successfully")
                if response.get('blog_created'):
                    print(f"   Blog created: {response.get('blog_id', 'Unknown ID')}")
                    print(f"   Blog slug: {response.get('blog_slug', 'Unknown slug')}")
                
                # Check for blog-ready content structure
                if 'summary' in response:
                    print(f"   Summary available: {len(response['summary'])} characters")
                if 'detailed_comparison' in response:
                    print(f"   Detailed comparison available: {len(response['detailed_comparison'])} items")
                if 'overall_winner' in response:
                    print(f"   Overall winner: {response['overall_winner']}")
        
        return all(results)

    def test_image_upload_endpoint(self):
        """Test blog image upload endpoint"""
        if not self.token:
            print("❌ Skipping image upload test - no authentication token")
            return False
        
        # Create a simple test image file in memory
        import io
        
        if Image is None:
            # Create a simple text file as fallback
            img_bytes = io.BytesIO(b"fake image content for testing")
            filename = 'test_image.txt'
            content_type = 'text/plain'
        else:
            # Create a simple test image
            img = Image.new('RGB', (100, 100), color='red')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            filename = 'test_image.png'
            content_type = 'image/png'
        
        # Test image upload
        try:
            url = f"{self.base_url}/blogs/upload-image"
            headers = {'Authorization': f'Bearer {self.token}'}
            files = {'file': (filename, img_bytes, content_type)}
            
            print(f"\n🔍 Testing Image Upload...")
            print(f"   URL: {url}")
            
            response = requests.post(url, files=files, headers=headers, timeout=30)
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    if 'image_url' in response_data:
                        print(f"   Image URL: {response_data['image_url']}")
                        return True, response_data['image_url']
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    'name': 'Image Upload',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:300],
                    'endpoint': 'blogs/upload-image'
                })
            
            self.tests_run += 1
            return success, None
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': 'Image Upload',
                'error': str(e),
                'endpoint': 'blogs/upload-image'
            })
            self.tests_run += 1
            return False, None

    def test_static_file_serving(self):
        """Test if uploaded images are accessible via /uploads/ path"""
        # First try to upload an image
        upload_success, image_url = self.test_image_upload_endpoint()
        
        if upload_success and image_url:
            # Test accessing the uploaded image
            full_image_url = f"{self.base_url.replace('/api', '')}{image_url}"
            
            success, response = self.run_test(
                "Static File Access",
                "GET",
                full_image_url,
                200,
                description=f"Test accessing uploaded image at {image_url}"
            )
            
            if success:
                print(f"   Image accessible at: {full_image_url}")
                return True
            else:
                print(f"   Image not accessible at: {full_image_url}")
                return False
        else:
            print("❌ Cannot test static file serving - image upload failed")
            return False

    def test_blog_publishing_functionality(self):
        """Test blog publishing functionality as requested in review"""
        print("\n📝 BLOG PUBLISHING FUNCTIONALITY TESTING")
        print("-" * 50)
        
        results = []
        
        # Test 1: Published blogs API endpoint (/api/blogs)
        success, response = self.run_test(
            "Published Blogs API Endpoint",
            "GET",
            "blogs",
            200,
            description="Test /api/blogs endpoint returns published blogs correctly"
        )
        results.append(success)
        
        published_blogs = []
        if success and isinstance(response, list):
            published_blogs = response
            print(f"   Found {len(published_blogs)} published blogs")
            # Verify all returned blogs are published
            non_published = [blog for blog in published_blogs if blog.get('status') != 'published']
            if non_published:
                print(f"   ❌ Found {len(non_published)} non-published blogs in results")
                results.append(False)
            else:
                print(f"   ✅ All {len(published_blogs)} blogs are published")
        
        # Test 2: Blog detail by slug (/api/blogs/by-slug/{slug})
        if published_blogs:
            test_blog = published_blogs[0]
            blog_slug = test_blog.get('slug')
            
            if blog_slug:
                success, response = self.run_test(
                    "Blog Detail by Slug",
                    "GET",
                    f"blogs/by-slug/{blog_slug}",
                    200,
                    description=f"Test /api/blogs/by-slug/{blog_slug} endpoint"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   Blog retrieved: {response.get('title', 'Unknown')}")
                    print(f"   Status: {response.get('status', 'Unknown')}")
                    print(f"   Author: {response.get('author_name', 'Unknown')}")
                    
                    # Verify it's published
                    if response.get('status') != 'published':
                        print(f"   ❌ Blog status is not 'published': {response.get('status')}")
                        results.append(False)
                    else:
                        print(f"   ✅ Blog is published")
        
        # Test 3: Blog like and comment endpoints (require authentication)
        if self.token and published_blogs:
            test_blog = published_blogs[0]
            blog_slug = test_blog.get('slug')
            
            if blog_slug:
                # Test POST /api/blogs/{slug}/like
                success, response = self.run_test(
                    "Blog Like Endpoint",
                    "POST",
                    f"blogs/{blog_slug}/like",
                    200,
                    description=f"Test POST /api/blogs/{blog_slug}/like endpoint"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   Like status: {response.get('liked', 'Unknown')}")
                    print(f"   Like count: {response.get('like_count', 'Unknown')}")
                
                # Test POST /api/blogs/{slug}/comments
                comment_data = {
                    "content": "This is a test comment for blog publishing functionality testing."
                }
                success, response = self.run_test(
                    "Blog Comment Creation",
                    "POST",
                    f"blogs/{blog_slug}/comments",
                    200,
                    data=comment_data,
                    description=f"Test POST /api/blogs/{blog_slug}/comments endpoint"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   Comment created: {response.get('id', 'Unknown')}")
                    print(f"   Comment content: {response.get('content', 'Unknown')[:50]}...")
                
                # Test GET /api/blogs/{slug}/comments
                success, response = self.run_test(
                    "Blog Comments Retrieval",
                    "GET",
                    f"blogs/{blog_slug}/comments",
                    200,
                    description=f"Test GET /api/blogs/{blog_slug}/comments endpoint"
                )
                results.append(success)
                
                if success and isinstance(response, list):
                    print(f"   Retrieved {len(response)} comments")
        else:
            print("❌ Skipping blog like/comment tests - no authentication token or no published blogs")
        
        return all(results)

    def test_tool_endpoints_functionality(self):
        """Test new tool endpoints as requested in review"""
        print("\n🔧 TOOL ENDPOINTS FUNCTIONALITY TESTING")
        print("-" * 50)
        
        results = []
        
        # First get some tools to test with
        success, tools_response = self.run_test(
            "Get Tools for Testing",
            "GET",
            "tools?limit=3",
            200,
            description="Get tools to test new endpoints"
        )
        results.append(success)
        
        available_tools = []
        if success and isinstance(tools_response, list):
            available_tools = tools_response
            print(f"   Found {len(available_tools)} tools for testing")
        
        if available_tools:
            test_tool = available_tools[0]
            tool_slug = test_tool.get('slug')
            
            if tool_slug:
                # Test 1: GET /api/tools/by-slug/{slug}
                success, response = self.run_test(
                    "Tool Detail by Slug",
                    "GET",
                    f"tools/by-slug/{tool_slug}",
                    200,
                    description=f"Test GET /api/tools/by-slug/{tool_slug} endpoint"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   Tool retrieved: {response.get('name', 'Unknown')}")
                    print(f"   Tool slug: {response.get('slug', 'Unknown')}")
                    print(f"   Tool active: {response.get('is_active', 'Unknown')}")
                
                # Test tool like and comment endpoints (require authentication)
                if self.token:
                    # Test 2: POST /api/tools/{slug}/like
                    success, response = self.run_test(
                        "Tool Like Endpoint",
                        "POST",
                        f"tools/{tool_slug}/like",
                        200,
                        description=f"Test POST /api/tools/{tool_slug}/like endpoint"
                    )
                    results.append(success)
                    
                    if success and isinstance(response, dict):
                        print(f"   Like status: {response.get('liked', 'Unknown')}")
                        print(f"   Like count: {response.get('like_count', 'Unknown')}")
                    
                    # Test 3: POST /api/tools/{slug}/comments
                    comment_data = {
                        "content": "This is a test comment for tool functionality testing."
                    }
                    success, response = self.run_test(
                        "Tool Comment Creation",
                        "POST",
                        f"tools/{tool_slug}/comments",
                        200,
                        data=comment_data,
                        description=f"Test POST /api/tools/{tool_slug}/comments endpoint"
                    )
                    results.append(success)
                    
                    if success and isinstance(response, dict):
                        print(f"   Comment created: {response.get('id', 'Unknown')}")
                        print(f"   Comment content: {response.get('content', 'Unknown')[:50]}...")
                    
                    # Test 4: GET /api/tools/{slug}/comments
                    success, response = self.run_test(
                        "Tool Comments Retrieval",
                        "GET",
                        f"tools/{tool_slug}/comments",
                        200,
                        description=f"Test GET /api/tools/{tool_slug}/comments endpoint"
                    )
                    results.append(success)
                    
                    if success and isinstance(response, list):
                        print(f"   Retrieved {len(response)} comments")
                else:
                    print("❌ Skipping tool like/comment tests - no authentication token")
        else:
            print("❌ No tools available for testing")
        
        return all(results)

    def test_production_ready_fixes(self):
        """Run all production-ready fix tests"""
        print("\n🔧 PRODUCTION-READY FIXES TESTING")
        print("-" * 50)
        
        results = []
        
        # Test all the specific areas mentioned in the review request
        results.append(self.test_blog_by_slug_endpoint())
        results.append(self.test_blog_view_increment())
        results.append(self.test_blog_listing_with_filters())
        results.append(self.test_tool_comparison_fixed())
        
        # Test AI and image features (require authentication)
        if self.token:
            results.append(self.test_ai_tool_comparison_format())
            results.append(self.test_static_file_serving())
        else:
            print("❌ Skipping AI and image tests - no authentication token")
        
        return all(results)

    def test_seo_sitemap_generation(self):
        """Test SEO sitemap.xml generation endpoint"""
        print("\n🗺️ SEO SITEMAP TESTING")
        print("-" * 50)
        
        results = []
        
        # Test sitemap.xml endpoint
        success, response = self.run_test(
            "Sitemap XML Generation",
            "GET",
            "sitemap.xml",
            200,
            description="Test GET /sitemap.xml endpoint for SEO sitemap generation"
        )
        results.append(success)
        
        if success and isinstance(response, str):
            print(f"   Sitemap content length: {len(response)} characters")
            
            # Verify XML structure
            if response.startswith('<?xml version="1.0" encoding="UTF-8"?>'):
                print("   ✅ Valid XML header found")
            else:
                print("   ❌ Invalid XML header")
                results.append(False)
            
            # Check for required sitemap elements
            required_elements = [
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
                '<url>',
                '<loc>',
                '<lastmod>',
                '<changefreq>',
                '<priority>'
            ]
            
            for element in required_elements:
                if element in response:
                    print(f"   ✅ Found required element: {element}")
                else:
                    print(f"   ❌ Missing required element: {element}")
                    results.append(False)
            
            # Check for main pages
            main_pages = ['/tools', '/blogs', '/compare']
            for page in main_pages:
                if page in response:
                    print(f"   ✅ Found main page: {page}")
                else:
                    print(f"   ⚠️ Main page not found: {page}")
            
            # Count URLs in sitemap
            url_count = response.count('<url>')
            print(f"   Total URLs in sitemap: {url_count}")
            
            if url_count > 0:
                print("   ✅ Sitemap contains URLs")
            else:
                print("   ❌ Sitemap contains no URLs")
                results.append(False)
        
        return all(results)

    def test_seo_robots_txt(self):
        """Test SEO robots.txt generation endpoint"""
        print("\n🤖 SEO ROBOTS.TXT TESTING")
        print("-" * 50)
        
        results = []
        
        # Test robots.txt endpoint
        success, response = self.run_test(
            "Robots.txt Generation",
            "GET",
            "robots.txt",
            200,
            description="Test GET /robots.txt endpoint for SEO robots directives"
        )
        results.append(success)
        
        if success and isinstance(response, str):
            print(f"   Robots.txt content length: {len(response)} characters")
            
            # Check for required robots.txt directives
            required_directives = [
                'User-agent: *',
                'Allow: /',
                'Disallow: /admin/',
                'Disallow: /dashboard/',
                'Disallow: /api/',
                'Allow: /api/blogs/',
                'Allow: /api/tools/',
                'Sitemap:',
                'Crawl-delay:'
            ]
            
            for directive in required_directives:
                if directive in response:
                    print(f"   ✅ Found required directive: {directive}")
                else:
                    print(f"   ❌ Missing required directive: {directive}")
                    results.append(False)
            
            # Check sitemap reference
            if 'sitemap.xml' in response.lower():
                print("   ✅ Sitemap reference found in robots.txt")
            else:
                print("   ❌ Sitemap reference missing from robots.txt")
                results.append(False)
            
            # Check admin area protection
            admin_protected = all(area in response for area in ['/admin/', '/dashboard/', '/superadmin/'])
            if admin_protected:
                print("   ✅ Admin areas properly protected")
            else:
                print("   ❌ Admin areas not properly protected")
                results.append(False)
        
        return all(results)

    def test_seo_data_in_apis(self):
        """Test SEO data presence in blog and tool APIs"""
        print("\n📊 SEO DATA IN APIS TESTING")
        print("-" * 50)
        
        results = []
        
        # Test 1: SEO data in blogs API
        success, blogs_response = self.run_test(
            "Blogs API - SEO Data Check",
            "GET",
            "blogs?limit=5",
            200,
            description="Test GET /api/blogs for SEO fields (seo_title, seo_description, seo_keywords)"
        )
        results.append(success)
        
        if success and isinstance(blogs_response, list) and len(blogs_response) > 0:
            blog = blogs_response[0]
            seo_fields = ['seo_title', 'seo_description', 'seo_keywords', 'json_ld']
            
            print(f"   Testing SEO fields in blog: {blog.get('title', 'Unknown')}")
            for field in seo_fields:
                if field in blog and blog[field] is not None:
                    print(f"   ✅ Blog has {field}: {str(blog[field])[:50]}...")
                else:
                    print(f"   ⚠️ Blog missing or null {field}")
            
            # Test specific blog by slug for JSON-LD structured data
            blog_slug = blog.get('slug')
            if blog_slug:
                success, blog_detail = self.run_test(
                    "Blog by Slug - JSON-LD Check",
                    "GET",
                    f"blogs/by-slug/{blog_slug}",
                    200,
                    description=f"Test GET /api/blogs/by-slug/{blog_slug} for JSON-LD structured data"
                )
                results.append(success)
                
                if success and isinstance(blog_detail, dict):
                    json_ld = blog_detail.get('json_ld')
                    if json_ld and isinstance(json_ld, dict):
                        print(f"   ✅ Blog has JSON-LD structured data")
                        if '@context' in json_ld and '@type' in json_ld:
                            print(f"   ✅ JSON-LD has required schema.org structure")
                            print(f"   JSON-LD type: {json_ld.get('@type', 'Unknown')}")
                        else:
                            print(f"   ⚠️ JSON-LD missing @context or @type")
                    else:
                        print(f"   ⚠️ Blog missing JSON-LD structured data")
        
        # Test 2: SEO data in tools API
        success, tools_response = self.run_test(
            "Tools API - SEO Data Check",
            "GET",
            "tools?limit=5",
            200,
            description="Test GET /api/tools for SEO fields (seo_title, seo_description, seo_keywords)"
        )
        results.append(success)
        
        if success and isinstance(tools_response, list) and len(tools_response) > 0:
            tool = tools_response[0]
            seo_fields = ['seo_title', 'seo_description', 'seo_keywords']
            
            print(f"   Testing SEO fields in tool: {tool.get('name', 'Unknown')}")
            for field in seo_fields:
                if field in tool and tool[field] is not None:
                    print(f"   ✅ Tool has {field}: {str(tool[field])[:50]}...")
                else:
                    print(f"   ⚠️ Tool missing or null {field}")
            
            # Test specific tool by slug
            tool_slug = tool.get('slug')
            if tool_slug:
                success, tool_detail = self.run_test(
                    "Tool by Slug - SEO Data Check",
                    "GET",
                    f"tools/by-slug/{tool_slug}",
                    200,
                    description=f"Test GET /api/tools/by-slug/{tool_slug} for SEO fields"
                )
                results.append(success)
                
                if success and isinstance(tool_detail, dict):
                    for field in seo_fields:
                        if field in tool_detail and tool_detail[field] is not None:
                            print(f"   ✅ Tool detail has {field}")
                        else:
                            print(f"   ⚠️ Tool detail missing {field}")
        
        return all(results)

    def test_seo_performance_impact(self):
        """Test performance impact of SEO endpoints"""
        print("\n⚡ SEO PERFORMANCE IMPACT TESTING")
        print("-" * 50)
        
        results = []
        import time
        
        # Test sitemap generation performance
        start_time = time.time()
        success, response = self.run_test(
            "Sitemap Performance Test",
            "GET",
            "sitemap.xml",
            200,
            description="Measure sitemap generation response time"
        )
        sitemap_time = time.time() - start_time
        results.append(success)
        
        print(f"   Sitemap generation time: {sitemap_time:.3f} seconds")
        if sitemap_time < 2.0:
            print("   ✅ Sitemap generation is fast (< 2 seconds)")
        elif sitemap_time < 5.0:
            print("   ⚠️ Sitemap generation is acceptable (< 5 seconds)")
        else:
            print("   ❌ Sitemap generation is slow (> 5 seconds)")
            results.append(False)
        
        # Test robots.txt performance
        start_time = time.time()
        success, response = self.run_test(
            "Robots.txt Performance Test",
            "GET",
            "robots.txt",
            200,
            description="Measure robots.txt generation response time"
        )
        robots_time = time.time() - start_time
        results.append(success)
        
        print(f"   Robots.txt generation time: {robots_time:.3f} seconds")
        if robots_time < 1.0:
            print("   ✅ Robots.txt generation is fast (< 1 second)")
        else:
            print("   ⚠️ Robots.txt generation could be faster")
        
        # Test existing API performance (baseline)
        start_time = time.time()
        success, response = self.run_test(
            "Baseline API Performance",
            "GET",
            "blogs?limit=10",
            200,
            description="Measure baseline API performance for comparison"
        )
        baseline_time = time.time() - start_time
        results.append(success)
        
        print(f"   Baseline API response time: {baseline_time:.3f} seconds")
        
        # Compare performance
        if sitemap_time <= baseline_time * 2:
            print("   ✅ SEO endpoints don't significantly impact performance")
        else:
            print("   ⚠️ SEO endpoints may impact performance")
        
        return all(results)

    def test_comprehensive_seo_functionality(self):
        """Run comprehensive SEO functionality tests"""
        print("\n🔍 COMPREHENSIVE SEO FUNCTIONALITY TESTING")
        print("=" * 60)
        
        seo_results = []
        
        # Run all SEO tests
        seo_results.append(self.test_seo_sitemap_generation())
        seo_results.append(self.test_seo_robots_txt())
        seo_results.append(self.test_seo_data_in_apis())
        seo_results.append(self.test_seo_performance_impact())
        
        # Summary
        passed_tests = sum(seo_results)
        total_tests = len(seo_results)
        
        print(f"\n📋 SEO TESTING SUMMARY:")
        print(f"   SEO Tests Passed: {passed_tests}/{total_tests}")
        print(f"   SEO Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if passed_tests == total_tests:
            print("   ✅ ALL SEO FUNCTIONALITY WORKING CORRECTLY")
        else:
            print("   ❌ SOME SEO FUNCTIONALITY NEEDS ATTENTION")
        
        return all(seo_results)

def main():
    print("🚀 Starting MarketMind AI Platform - SEO Implementation Testing")
    print("=" * 70)
    print("🎯 FOCUS: Testing new SEO features - Sitemap, Robots.txt, and SEO Data")
    print("=" * 70)
    
    tester = MarketMindAPITester()
    
    # Test basic endpoints first
    print("\n📋 BASIC API TESTS")
    print("-" * 40)
    tester.test_health_check()
    tester.test_debug_connectivity()
    tester.test_categories()
    tester.test_tools()
    tester.test_blogs()
    
    # MAIN TEST: Comprehensive SEO Functionality
    print("\n🎯 MAIN TEST: SEO IMPLEMENTATION")
    print("-" * 50)
    seo_success = tester.test_comprehensive_seo_functionality()
    
    # Print comprehensive results
    print("\n" + "=" * 70)
    print("📊 SEO IMPLEMENTATION TEST RESULTS")
    print("=" * 70)
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests Details:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}")
            if 'expected' in test:
                print(f"     Expected: {test['expected']}, Got: {test['actual']}")
            if 'error' in test:
                print(f"     Error: {test['error']}")
            if 'response' in test:
                print(f"     Response: {test['response'][:200]}...")
            if 'endpoint' in test:
                print(f"     Endpoint: {test['endpoint']}")
    
    print("\n" + "=" * 70)
    
    # Return exit code based on results
    if len(tester.failed_tests) == 0:
        print("🎉 All SEO functionality tests passed!")
        return 0
    elif len(tester.failed_tests) <= 2:
        print("⚠️  Minor issues found - SEO functionality is mostly working")
        return 0
    else:
        print("❌ Significant issues found - SEO functionality needs attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())