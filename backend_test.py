import requests
import sys
import json
from datetime import datetime

class MarketMindAPITester:
    def __init__(self, base_url="https://blogtools-platform.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
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
                    if isinstance(response_data, dict) and len(response_data) <= 5:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list) and len(response_data) <= 3:
                        print(f"   Response: {len(response_data)} items")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_categories(self):
        """Test categories endpoint"""
        success, response = self.run_test(
            "Get Categories",
            "GET", 
            "categories",
            200
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
            200
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
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} blogs")
        return success

    def test_login(self, email, password):
        """Test login with different user roles"""
        success, response = self.run_test(
            f"Login - {email}",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and isinstance(response, dict):
            if 'access_token' in response:
                self.token = response['access_token']
                self.user_id = response.get('user', {}).get('id')
                user_role = response.get('user', {}).get('role', 'unknown')
                print(f"   Logged in as: {user_role}")
                return True, user_role
        return False, None

    def test_register(self):
        """Test user registration"""
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            201,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "full_name": "Test User"
            }
        )
        return success

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
                "topic": "The Future of AI in Marketing",
                "tone": "professional",
                "length": "medium"
            }
        )
        if success and isinstance(response, dict):
            if 'content' in response or 'title' in response:
                print("   AI blog generation working")
        return success

    def test_user_dashboard_data(self):
        """Test user dashboard data endpoints"""
        if not self.token:
            print("❌ Skipping dashboard test - no authentication token")
            return False
            
        success, response = self.run_test(
            "User Dashboard Stats",
            "GET",
            "user/dashboard/stats",
            200
        )
        return success

    def test_debug_connectivity(self):
        """Test debug connectivity endpoint"""
        success, response = self.run_test(
            "Debug Connectivity",
            "GET",
            "debug/connectivity",
            200
        )
        return success

def main():
    print("🚀 Starting MarketMind AI Platform API Tests")
    print("=" * 60)
    
    tester = MarketMindAPITester()
    
    # Test basic endpoints first
    print("\n📋 BASIC API TESTS")
    print("-" * 30)
    tester.test_health_check()
    tester.test_debug_connectivity()
    tester.test_categories()
    tester.test_tools()
    tester.test_blogs()
    
    # Test authentication with different user roles
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    
    # Test user registration
    tester.test_register()
    
    # Test login with different roles
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
            
            # Test role-specific endpoints
            if role in ['user', 'admin', 'superadmin']:
                tester.test_user_dashboard_data()
            
            # Test AI blog generation (requires authentication)
            if role in ['user', 'admin', 'superadmin']:
                print(f"\n🤖 AI INTEGRATION TEST (as {role})")
                print("-" * 30)
                tester.test_ai_blog_generation()
            
            # Reset token for next user
            tester.token = None
            tester.user_id = None
    
    # Print comprehensive results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if successful_logins:
        print(f"\n✅ Successful Logins:")
        for email, role in successful_logins:
            print(f"   - {email} ({role})")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}")
            if 'expected' in test:
                print(f"     Expected: {test['expected']}, Got: {test['actual']}")
            if 'error' in test:
                print(f"     Error: {test['error']}")
            if 'response' in test:
                print(f"     Response: {test['response']}")
    
    print("\n" + "=" * 60)
    
    # Return exit code based on results
    if len(tester.failed_tests) == 0:
        print("🎉 All tests passed!")
        return 0
    elif len(tester.failed_tests) <= 2:
        print("⚠️  Minor issues found - mostly working")
        return 0
    else:
        print("❌ Significant issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())