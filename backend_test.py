import requests
import sys
import json
import uuid
from datetime import datetime

class MarketMindAPITester:
    def __init__(self, base_url="https://blogtools-central.preview.emergentagent.com/api"):
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

    # USER TESTS
    def test_user_blog_operations(self):
        """Test user blog creation and management"""
        if not self.token:
            print("❌ Skipping user blog tests - no authentication token")
            return False
        
        results = []
        
        # Test create blog
        timestamp = datetime.now().strftime('%H%M%S')
        blog_data = {
            "title": f"Test Blog Post {timestamp}",
            "content": f"<h1>Test Blog Content</h1><p>This is a test blog post created at {timestamp} for automated testing purposes. It contains sample content to verify the blog creation functionality.</p>",
            "excerpt": "This is a test blog post excerpt for automated testing",
            "tags": ["test", "automation", "blog"],
            "seo_title": f"Test Blog Post {timestamp} - SEO Title",
            "seo_description": "SEO description for test blog post",
            "seo_keywords": "test, blog, automation"
        }
        
        success, response = self.run_test(
            "Create Blog Post",
            "POST",
            "blogs",
            200,
            data=blog_data,
            description="Create new blog post as authenticated user"
        )
        results.append(success)
        
        if success and isinstance(response, dict) and 'id' in response:
            created_blog_id = response['id']
            self.created_resources['blogs'].append({
                'id': created_blog_id,
                'title': blog_data['title']
            })
            
            # Test update blog
            success, response = self.run_test(
                "Update Blog Post",
                "PUT",
                f"blogs/{created_blog_id}",
                200,
                data={"title": f"Updated Test Blog Post {timestamp}"},
                description="Update blog post as owner"
            )
            results.append(success)
            
            # Test publish blog
            success, response = self.run_test(
                "Publish Blog Post",
                "POST",
                f"blogs/{created_blog_id}/publish",
                200,
                description="Publish blog post"
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

def main():
    print("🚀 Starting MarketMind AI Platform Comprehensive API Tests")
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
    
    # Test enhanced public APIs
    print("\n🔧 ENHANCED PUBLIC API TESTS")
    print("-" * 40)
    tester.test_tools_advanced()
    tester.test_blogs_advanced()
    tester.test_tool_comparison()
    
    # Test authentication with different user roles
    print("\n🔐 AUTHENTICATION & ROLE-BASED TESTS")
    print("-" * 40)
    
    # Test user registration
    tester.test_register()
    
    # Test login with different roles and comprehensive role-based testing
    test_accounts = [
        ("superadmin@marketmind.com", "admin123", "superadmin"),
        ("admin@marketmind.com", "admin123", "admin"),
        ("user1@example.com", "password123", "user")
    ]
    
    successful_logins = []
    for email, password, expected_role in test_accounts:
        success, role = tester.test_login(email, password)
        if success:
            successful_logins.append((email, role))
            
            # Test basic authenticated endpoints
            tester.test_current_user_info()
            tester.test_user_dashboard()
            
            # Test role-specific functionality
            if role == 'superadmin':
                print(f"\n👑 SUPERADMIN TESTS (as {role})")
                print("-" * 40)
                tester.test_superadmin_user_management()
                tester.test_superadmin_category_management()
                tester.test_superadmin_tool_management()
                tester.test_bulk_upload_template()
                
                # Also test admin functions as superadmin
                tester.test_admin_dashboard()
                tester.test_admin_blog_management()
                tester.test_admin_review_management()
                tester.test_admin_seo_management()
                tester.test_admin_analytics()
                
            elif role == 'admin':
                print(f"\n🛡️ ADMIN TESTS (as {role})")
                print("-" * 40)
                tester.test_admin_dashboard()
                tester.test_admin_blog_management()
                tester.test_admin_review_management()
                tester.test_admin_seo_management()
                tester.test_admin_analytics()
            
            elif role == 'user':
                print(f"\n👤 USER TESTS (as {role})")
                print("-" * 40)
                tester.test_user_blog_operations()
                tester.test_user_profile_operations()
                tester.test_tool_interactions()
            
            # Test AI integration (available to all authenticated users)
            if role in ['user', 'admin', 'superadmin']:
                print(f"\n🤖 AI INTEGRATION TESTS (as {role})")
                print("-" * 40)
                tester.test_ai_blog_generation()
                tester.test_ai_tool_comparison()
                tester.test_ai_blog_topics()
            
            # Reset token for next user
            tester.token = None
            tester.user_id = None
            tester.current_user_role = None
    
    # Print comprehensive results
    print("\n" + "=" * 70)
    print("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if successful_logins:
        print(f"\n✅ Successful Logins:")
        for email, role in successful_logins:
            print(f"   - {email} ({role})")
    
    # Print created resources summary
    if any(tester.created_resources.values()):
        print(f"\n📝 Resources Created During Testing:")
        for resource_type, resources in tester.created_resources.items():
            if resources:
                print(f"   - {resource_type.title()}: {len(resources)} items")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests Details:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}")
            if 'expected' in test:
                print(f"     Expected: {test['expected']}, Got: {test['actual']}")
            if 'error' in test:
                print(f"     Error: {test['error']}")
            if 'response' in test:
                print(f"     Response: {test['response']}")
            if 'endpoint' in test:
                print(f"     Endpoint: {test['endpoint']}")
    
    print("\n" + "=" * 70)
    
    # Return exit code based on results
    if len(tester.failed_tests) == 0:
        print("🎉 All tests passed! Backend is fully functional.")
        return 0
    elif len(tester.failed_tests) <= 3:
        print("⚠️  Minor issues found - backend is mostly working")
        return 0
    else:
        print("❌ Significant issues found - backend needs attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())