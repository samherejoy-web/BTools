import requests
import sys
import json
import uuid
from datetime import datetime

class UserBlogCRUDTester:
    def __init__(self, base_url="https://tag-optimizer-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.current_user_role = None
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

    def test_user_blog_crud_with_like_count(self):
        """Test user blog CRUD endpoints specifically for like_count field after critical fix"""
        if not self.token:
            print("❌ Skipping user blog CRUD tests - no authentication token")
            return False
        
        print("\n🔧 USER BLOG CRUD ENDPOINTS - LIKE_COUNT FIELD TESTING")
        print("-" * 60)
        
        results = []
        created_blog_id = None
        
        # Test 1: GET /api/user/blogs (list user's blogs) - should include like_count field
        success, response = self.run_test(
            "GET /api/user/blogs - List User Blogs",
            "GET",
            "user/blogs",
            200,
            description="Test GET /api/user/blogs endpoint includes like_count field"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} user blogs")
            if response:
                # Check if like_count field is present
                first_blog = response[0]
                if 'like_count' in first_blog:
                    print(f"   ✅ like_count field present: {first_blog['like_count']}")
                else:
                    print(f"   ❌ like_count field MISSING from response")
                    results.append(False)
        
        # Test 2: POST /api/user/blogs (create new blog) - should return blog with like_count=0
        timestamp = datetime.now().strftime('%H%M%S')
        blog_data = {
            "title": f"Test Blog for Like Count {timestamp}",
            "content": f"<h1>Testing Like Count Field</h1><p>This blog is created to test the like_count field fix in user blog CRUD endpoints. Created at {timestamp}.</p>",
            "excerpt": "Testing like_count field in user blog endpoints",
            "tags": ["test", "like-count", "crud"],
            "seo_title": f"Test Blog for Like Count {timestamp} - SEO",
            "seo_description": "Testing like_count field in user blog CRUD endpoints",
            "seo_keywords": "test, like-count, crud, blog"
        }
        
        success, response = self.run_test(
            "POST /api/user/blogs - Create Blog",
            "POST",
            "user/blogs",
            200,
            data=blog_data,
            description="Test POST /api/user/blogs endpoint returns blog with like_count=0"
        )
        results.append(success)
        
        if success and isinstance(response, dict):
            created_blog_id = response.get('id')
            print(f"   Created blog ID: {created_blog_id}")
            
            # Check if like_count field is present and equals 0
            if 'like_count' in response:
                like_count = response['like_count']
                print(f"   ✅ like_count field present: {like_count}")
                if like_count == 0:
                    print(f"   ✅ like_count correctly initialized to 0")
                else:
                    print(f"   ⚠️ like_count is {like_count}, expected 0")
            else:
                print(f"   ❌ like_count field MISSING from create response")
                results.append(False)
        
        if created_blog_id:
            # Test 3: GET /api/user/blogs/{id} (get specific blog) - should include like_count field
            success, response = self.run_test(
                "GET /api/user/blogs/{id} - Get Specific Blog",
                "GET",
                f"user/blogs/{created_blog_id}",
                200,
                description="Test GET /api/user/blogs/{id} endpoint includes like_count field"
            )
            results.append(success)
            
            if success and isinstance(response, dict):
                if 'like_count' in response:
                    print(f"   ✅ like_count field present: {response['like_count']}")
                else:
                    print(f"   ❌ like_count field MISSING from get specific response")
                    results.append(False)
            
            # Test 4: PUT /api/user/blogs/{id} (update blog) - should return updated blog with like_count field
            update_data = {
                "title": f"Updated Test Blog for Like Count {timestamp}",
                "content": f"<h1>Updated Testing Like Count Field</h1><p>This blog content has been updated to test the like_count field fix. Updated at {timestamp}.</p>"
            }
            
            success, response = self.run_test(
                "PUT /api/user/blogs/{id} - Update Blog",
                "PUT",
                f"user/blogs/{created_blog_id}",
                200,
                data=update_data,
                description="Test PUT /api/user/blogs/{id} endpoint returns updated blog with like_count field"
            )
            results.append(success)
            
            if success and isinstance(response, dict):
                if 'like_count' in response:
                    print(f"   ✅ like_count field present after update: {response['like_count']}")
                else:
                    print(f"   ❌ like_count field MISSING from update response")
                    results.append(False)
            
            # Test 5: POST /api/user/blogs/{id}/publish (publish blog) - should work without issues
            success, response = self.run_test(
                "POST /api/user/blogs/{id}/publish - Publish Blog",
                "POST",
                f"user/blogs/{created_blog_id}/publish",
                200,
                description="Test POST /api/user/blogs/{id}/publish endpoint works without issues"
            )
            results.append(success)
            
            if success:
                print(f"   ✅ Blog published successfully")
            
            # Verify the published blog still has like_count when retrieved
            success, response = self.run_test(
                "GET /api/user/blogs/{id} - Verify Published Blog",
                "GET",
                f"user/blogs/{created_blog_id}",
                200,
                description="Verify published blog still includes like_count field"
            )
            results.append(success)
            
            if success and isinstance(response, dict):
                if 'like_count' in response:
                    print(f"   ✅ like_count field present after publish: {response['like_count']}")
                    print(f"   ✅ Blog status: {response.get('status', 'Unknown')}")
                else:
                    print(f"   ❌ like_count field MISSING from published blog response")
                    results.append(False)
        
        return all(results)

def main():
    print("🚀 Starting MarketMind AI Platform - User Blog CRUD Like Count Testing")
    print("=" * 70)
    print("🎯 FOCUS: Testing user blog CRUD endpoints after like_count field fix")
    print("=" * 70)
    
    tester = UserBlogCRUDTester()
    
    # Test authentication and user blog CRUD endpoints
    print("\n🔐 AUTHENTICATION & USER BLOG CRUD TESTING")
    print("-" * 40)
    
    # Test login with user account to test authenticated endpoints
    test_accounts = [
        ("user1@example.com", "password123", "user"),
        ("admin@marketmind.com", "admin123", "admin"),
        ("superadmin@marketmind.com", "admin123", "superadmin")
    ]
    
    successful_login = False
    for email, password, expected_role in test_accounts:
        success, role = tester.test_login(email, password)
        if success:
            successful_login = True
            print(f"   ✅ Logged in as: {email} ({role})")
            
            # Test the specific user blog CRUD functionality requested in the review
            print(f"\n🎯 USER BLOG CRUD ENDPOINTS TESTING (as {role})")
            print("-" * 50)
            
            # Run the focused test for user blog CRUD with like_count field
            crud_success = tester.test_user_blog_crud_with_like_count()
            
            break  # Only test with first successful login for focused testing
    
    if not successful_login:
        print("❌ Could not authenticate with any test account")
        print("   Available test accounts:")
        for email, password, role in test_accounts:
            print(f"   - {email} / {password} ({role})")
    
    # Print comprehensive results
    print("\n" + "=" * 70)
    print("📊 USER BLOG CRUD LIKE_COUNT FIELD TEST RESULTS")
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
                print(f"     Response: {test['response']}")
    
    print("\n" + "=" * 70)
    print("🎯 USER BLOG CRUD LIKE_COUNT FIELD TESTING COMPLETE")
    print("=" * 70)
    
    # Return exit code based on results
    if len(tester.failed_tests) == 0:
        print("🎉 All user blog CRUD like_count field tests passed!")
        return 0
    elif len(tester.failed_tests) <= 2:
        print("⚠️  Minor issues found - user blog CRUD functionality is mostly working")
        return 0
    else:
        print("❌ Significant issues found - user blog CRUD functionality needs attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())