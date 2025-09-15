#!/usr/bin/env python3
"""
URGENT Comment Functionality Testing Script
Testing blog and tool comment endpoints to identify why users cannot write comments
"""

import requests
import json
import sys
from datetime import datetime

class CommentTester:
    def __init__(self, base_url="https://jsonld-tools-fix.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_results = []
        self.failed_tests = []
        
    def log_result(self, test_name, success, details="", error_details=""):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'error': error_details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            print(f"✅ {test_name}: {details}")
        else:
            print(f"❌ {test_name}: {error_details}")
            self.failed_tests.append(result)
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        request_headers = {'Content-Type': 'application/json'}
        
        if headers:
            request_headers.update(headers)
        
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)
            
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None
    
    def test_authentication(self):
        """Test authentication with different user accounts"""
        print("\n🔐 TESTING AUTHENTICATION")
        print("-" * 50)
        
        # Test accounts to try
        test_accounts = [
            ("user1@example.com", "password123"),
            ("admin@marketmind.com", "admin123"),
            ("superadmin@marketmind.com", "admin123"),
            ("test@test.com", "password123")
        ]
        
        for email, password in test_accounts:
            response = self.make_request('POST', 'auth/login', {
                'email': email,
                'password': password
            })
            
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    if 'access_token' in data:
                        self.token = data['access_token']
                        self.user_id = data.get('user', {}).get('id')
                        user_role = data.get('user', {}).get('role', 'unknown')
                        
                        self.log_result(
                            f"Authentication - {email}",
                            True,
                            f"Successfully logged in as {user_role}"
                        )
                        
                        # Test token validity
                        me_response = self.make_request('GET', 'auth/me')
                        if me_response and me_response.status_code == 200:
                            self.log_result(
                                "Token Validation",
                                True,
                                "JWT token is valid and working"
                            )
                        else:
                            self.log_result(
                                "Token Validation",
                                False,
                                f"Token validation failed: {me_response.status_code if me_response else 'No response'}"
                            )
                        
                        return True
                    else:
                        self.log_result(
                            f"Authentication - {email}",
                            False,
                            f"No access token in response: {data}"
                        )
                except Exception as e:
                    self.log_result(
                        f"Authentication - {email}",
                        False,
                        f"JSON parsing error: {str(e)}"
                    )
            else:
                error_msg = f"Status: {response.status_code}, Response: {response.text[:200]}" if response else "No response"
                self.log_result(
                    f"Authentication - {email}",
                    False,
                    error_msg
                )
        
        return False
    
    def get_published_blogs(self):
        """Get published blogs for testing"""
        print("\n📚 GETTING PUBLISHED BLOGS FOR TESTING")
        print("-" * 50)
        
        response = self.make_request('GET', 'blogs?limit=5')
        
        if response and response.status_code == 200:
            try:
                blogs = response.json()
                if isinstance(blogs, list) and len(blogs) > 0:
                    self.log_result(
                        "Get Published Blogs",
                        True,
                        f"Found {len(blogs)} published blogs"
                    )
                    
                    # Print blog details for testing
                    for i, blog in enumerate(blogs[:3]):
                        print(f"   Blog {i+1}: {blog.get('title', 'Unknown')} (slug: {blog.get('slug', 'Unknown')})")
                    
                    return blogs
                else:
                    self.log_result(
                        "Get Published Blogs",
                        False,
                        f"No blogs found or invalid response format: {blogs}"
                    )
            except Exception as e:
                self.log_result(
                    "Get Published Blogs",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:200]}" if response else "No response"
            self.log_result(
                "Get Published Blogs",
                False,
                error_msg
            )
        
        return []
    
    def get_active_tools(self):
        """Get active tools for testing"""
        print("\n🔧 GETTING ACTIVE TOOLS FOR TESTING")
        print("-" * 50)
        
        response = self.make_request('GET', 'tools?limit=5')
        
        if response and response.status_code == 200:
            try:
                tools = response.json()
                if isinstance(tools, list) and len(tools) > 0:
                    self.log_result(
                        "Get Active Tools",
                        True,
                        f"Found {len(tools)} active tools"
                    )
                    
                    # Print tool details for testing
                    for i, tool in enumerate(tools[:3]):
                        print(f"   Tool {i+1}: {tool.get('name', 'Unknown')} (slug: {tool.get('slug', 'Unknown')})")
                    
                    return tools
                else:
                    self.log_result(
                        "Get Active Tools",
                        False,
                        f"No tools found or invalid response format: {tools}"
                    )
            except Exception as e:
                self.log_result(
                    "Get Active Tools",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:200]}" if response else "No response"
            self.log_result(
                "Get Active Tools",
                False,
                error_msg
            )
        
        return []
    
    def test_blog_comments(self, blogs):
        """Test blog comment functionality"""
        print("\n💬 TESTING BLOG COMMENT FUNCTIONALITY")
        print("-" * 50)
        
        if not blogs:
            self.log_result(
                "Blog Comments Test",
                False,
                "No blogs available for testing"
            )
            return
        
        if not self.token:
            self.log_result(
                "Blog Comments Test",
                False,
                "No authentication token available"
            )
            return
        
        test_blog = blogs[0]
        blog_slug = test_blog.get('slug')
        
        if not blog_slug:
            self.log_result(
                "Blog Comments Test",
                False,
                "No blog slug available"
            )
            return
        
        print(f"Testing with blog: {test_blog.get('title', 'Unknown')} (slug: {blog_slug})")
        
        # Test 1: GET existing comments
        response = self.make_request('GET', f'blogs/{blog_slug}/comments')
        
        if response and response.status_code == 200:
            try:
                comments = response.json()
                self.log_result(
                    "GET Blog Comments",
                    True,
                    f"Successfully retrieved {len(comments)} comments"
                )
            except Exception as e:
                self.log_result(
                    "GET Blog Comments",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:300]}" if response else "No response"
            self.log_result(
                "GET Blog Comments",
                False,
                error_msg
            )
        
        # Test 2: POST new comment
        comment_data = {
            "content": f"This is a test comment created at {datetime.now().isoformat()} to test the comment functionality that users are reporting as broken."
        }
        
        response = self.make_request('POST', f'blogs/{blog_slug}/comments', comment_data)
        
        if response and response.status_code == 200:
            try:
                comment_response = response.json()
                self.log_result(
                    "POST Blog Comment",
                    True,
                    f"Successfully created comment: {comment_response.get('id', 'Unknown ID')}"
                )
                
                # Verify comment content
                if comment_response.get('content') == comment_data['content']:
                    self.log_result(
                        "Blog Comment Content Verification",
                        True,
                        "Comment content matches what was sent"
                    )
                else:
                    self.log_result(
                        "Blog Comment Content Verification",
                        False,
                        f"Content mismatch. Sent: {comment_data['content'][:50]}..., Got: {comment_response.get('content', 'None')[:50]}..."
                    )
                
                # Test 3: Verify comment appears in GET request
                verify_response = self.make_request('GET', f'blogs/{blog_slug}/comments')
                if verify_response and verify_response.status_code == 200:
                    try:
                        updated_comments = verify_response.json()
                        new_comment_found = any(c.get('id') == comment_response.get('id') for c in updated_comments)
                        
                        if new_comment_found:
                            self.log_result(
                                "Blog Comment Persistence Verification",
                                True,
                                "New comment appears in comment list"
                            )
                        else:
                            self.log_result(
                                "Blog Comment Persistence Verification",
                                False,
                                "New comment does not appear in comment list"
                            )
                    except Exception as e:
                        self.log_result(
                            "Blog Comment Persistence Verification",
                            False,
                            f"JSON parsing error: {str(e)}"
                        )
                
            except Exception as e:
                self.log_result(
                    "POST Blog Comment",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:300]}" if response else "No response"
            self.log_result(
                "POST Blog Comment",
                False,
                error_msg
            )
            
            # Additional debugging for 400/401/403/500 errors
            if response:
                if response.status_code == 401:
                    self.log_result(
                        "Blog Comment Authentication Issue",
                        False,
                        "401 Unauthorized - JWT token may be invalid or expired"
                    )
                elif response.status_code == 403:
                    self.log_result(
                        "Blog Comment Authorization Issue",
                        False,
                        "403 Forbidden - User may not have permission to comment"
                    )
                elif response.status_code == 404:
                    self.log_result(
                        "Blog Comment Not Found Issue",
                        False,
                        f"404 Not Found - Blog with slug '{blog_slug}' may not exist or not be published"
                    )
                elif response.status_code == 500:
                    self.log_result(
                        "Blog Comment Server Error",
                        False,
                        "500 Internal Server Error - Database or server issue"
                    )
    
    def test_tool_comments(self, tools):
        """Test tool comment functionality"""
        print("\n🔧 TESTING TOOL COMMENT FUNCTIONALITY")
        print("-" * 50)
        
        if not tools:
            self.log_result(
                "Tool Comments Test",
                False,
                "No tools available for testing"
            )
            return
        
        if not self.token:
            self.log_result(
                "Tool Comments Test",
                False,
                "No authentication token available"
            )
            return
        
        test_tool = tools[0]
        tool_slug = test_tool.get('slug')
        
        if not tool_slug:
            self.log_result(
                "Tool Comments Test",
                False,
                "No tool slug available"
            )
            return
        
        print(f"Testing with tool: {test_tool.get('name', 'Unknown')} (slug: {tool_slug})")
        
        # Test 1: GET existing comments
        response = self.make_request('GET', f'tools/{tool_slug}/comments')
        
        if response and response.status_code == 200:
            try:
                comments = response.json()
                self.log_result(
                    "GET Tool Comments",
                    True,
                    f"Successfully retrieved {len(comments)} comments"
                )
            except Exception as e:
                self.log_result(
                    "GET Tool Comments",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:300]}" if response else "No response"
            self.log_result(
                "GET Tool Comments",
                False,
                error_msg
            )
        
        # Test 2: POST new comment
        comment_data = {
            "content": f"This is a test review comment created at {datetime.now().isoformat()} to test the tool comment functionality that users are reporting as broken."
        }
        
        response = self.make_request('POST', f'tools/{tool_slug}/comments', comment_data)
        
        if response and response.status_code == 200:
            try:
                comment_response = response.json()
                self.log_result(
                    "POST Tool Comment",
                    True,
                    f"Successfully created comment: {comment_response.get('id', 'Unknown ID')}"
                )
                
                # Verify comment content
                if comment_response.get('content') == comment_data['content']:
                    self.log_result(
                        "Tool Comment Content Verification",
                        True,
                        "Comment content matches what was sent"
                    )
                else:
                    self.log_result(
                        "Tool Comment Content Verification",
                        False,
                        f"Content mismatch. Sent: {comment_data['content'][:50]}..., Got: {comment_response.get('content', 'None')[:50]}..."
                    )
                
                # Test 3: Verify comment appears in GET request
                verify_response = self.make_request('GET', f'tools/{tool_slug}/comments')
                if verify_response and verify_response.status_code == 200:
                    try:
                        updated_comments = verify_response.json()
                        new_comment_found = any(c.get('id') == comment_response.get('id') for c in updated_comments)
                        
                        if new_comment_found:
                            self.log_result(
                                "Tool Comment Persistence Verification",
                                True,
                                "New comment appears in comment list"
                            )
                        else:
                            self.log_result(
                                "Tool Comment Persistence Verification",
                                False,
                                "New comment does not appear in comment list"
                            )
                    except Exception as e:
                        self.log_result(
                            "Tool Comment Persistence Verification",
                            False,
                            f"JSON parsing error: {str(e)}"
                        )
                
            except Exception as e:
                self.log_result(
                    "POST Tool Comment",
                    False,
                    f"JSON parsing error: {str(e)}"
                )
        else:
            error_msg = f"Status: {response.status_code}, Response: {response.text[:300]}" if response else "No response"
            self.log_result(
                "POST Tool Comment",
                False,
                error_msg
            )
            
            # Additional debugging for 400/401/403/500 errors
            if response:
                if response.status_code == 401:
                    self.log_result(
                        "Tool Comment Authentication Issue",
                        False,
                        "401 Unauthorized - JWT token may be invalid or expired"
                    )
                elif response.status_code == 403:
                    self.log_result(
                        "Tool Comment Authorization Issue",
                        False,
                        "403 Forbidden - User may not have permission to comment"
                    )
                elif response.status_code == 404:
                    self.log_result(
                        "Tool Comment Not Found Issue",
                        False,
                        f"404 Not Found - Tool with slug '{tool_slug}' may not exist or not be active"
                    )
                elif response.status_code == 500:
                    self.log_result(
                        "Tool Comment Server Error",
                        False,
                        "500 Internal Server Error - Database or server issue"
                    )
    
    def check_database_constraints(self):
        """Check for potential database constraint issues"""
        print("\n🗄️ CHECKING DATABASE CONSTRAINTS")
        print("-" * 50)
        
        # Check if comment tables exist by trying to get comments from a non-existent resource
        # This should return 404, not 500 (which would indicate table doesn't exist)
        
        response = self.make_request('GET', 'blogs/non-existent-slug/comments')
        if response:
            if response.status_code == 404:
                self.log_result(
                    "Blog Comments Table Check",
                    True,
                    "Blog comments endpoint returns proper 404 for non-existent blog"
                )
            elif response.status_code == 500:
                self.log_result(
                    "Blog Comments Table Check",
                    False,
                    "500 error suggests database table or constraint issues"
                )
            else:
                self.log_result(
                    "Blog Comments Table Check",
                    False,
                    f"Unexpected status code: {response.status_code}"
                )
        
        response = self.make_request('GET', 'tools/non-existent-slug/comments')
        if response:
            if response.status_code == 404:
                self.log_result(
                    "Tool Comments Table Check",
                    True,
                    "Tool comments endpoint returns proper 404 for non-existent tool"
                )
            elif response.status_code == 500:
                self.log_result(
                    "Tool Comments Table Check",
                    False,
                    "500 error suggests database table or constraint issues"
                )
            else:
                self.log_result(
                    "Tool Comments Table Check",
                    False,
                    f"Unexpected status code: {response.status_code}"
                )
    
    def run_comprehensive_test(self):
        """Run comprehensive comment functionality test"""
        print("🚨 URGENT: COMMENT FUNCTIONALITY DIAGNOSTIC TEST")
        print("=" * 60)
        print("Testing why users cannot write comments on blogs and tools")
        print("=" * 60)
        
        # Step 1: Test authentication
        auth_success = self.test_authentication()
        
        # Step 2: Get test data
        blogs = self.get_published_blogs()
        tools = self.get_active_tools()
        
        # Step 3: Check database constraints
        self.check_database_constraints()
        
        # Step 4: Test blog comments
        self.test_blog_comments(blogs)
        
        # Step 5: Test tool comments
        self.test_tool_comments(tools)
        
        # Step 6: Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("🔍 COMMENT FUNCTIONALITY DIAGNOSTIC REPORT")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            print("-" * 40)
            
            # Group failures by category
            auth_failures = [f for f in self.failed_tests if 'Authentication' in f['test'] or 'Token' in f['test']]
            blog_failures = [f for f in self.failed_tests if 'Blog' in f['test']]
            tool_failures = [f for f in self.failed_tests if 'Tool' in f['test']]
            db_failures = [f for f in self.failed_tests if 'Database' in f['test'] or 'Table' in f['test']]
            
            if auth_failures:
                print("\n🔐 AUTHENTICATION ISSUES:")
                for failure in auth_failures:
                    print(f"   • {failure['test']}: {failure['error']}")
            
            if blog_failures:
                print("\n📚 BLOG COMMENT ISSUES:")
                for failure in blog_failures:
                    print(f"   • {failure['test']}: {failure['error']}")
            
            if tool_failures:
                print("\n🔧 TOOL COMMENT ISSUES:")
                for failure in tool_failures:
                    print(f"   • {failure['test']}: {failure['error']}")
            
            if db_failures:
                print("\n🗄️ DATABASE ISSUES:")
                for failure in db_failures:
                    print(f"   • {failure['test']}: {failure['error']}")
        
        # Root cause analysis
        print(f"\n🔍 ROOT CAUSE ANALYSIS:")
        print("-" * 40)
        
        if not any(r['success'] for r in self.test_results if 'Authentication' in r['test']):
            print("❌ CRITICAL: Authentication is completely broken")
            print("   → Users cannot log in, so they cannot comment")
            print("   → Check user accounts, password hashing, JWT token generation")
        
        elif not any(r['success'] for r in self.test_results if 'POST' in r['test'] and 'Comment' in r['test']):
            print("❌ CRITICAL: Comment creation is broken")
            print("   → Users can authenticate but cannot create comments")
            print("   → Check comment endpoints, database constraints, validation")
        
        elif any('500' in r['error'] for r in self.failed_tests):
            print("❌ CRITICAL: Server errors detected")
            print("   → Database or server configuration issues")
            print("   → Check database tables, foreign key constraints, server logs")
        
        elif any('404' in r['error'] for r in self.failed_tests if 'POST' in r['test']):
            print("❌ CRITICAL: Comment endpoints not found")
            print("   → API routes may not be properly registered")
            print("   → Check FastAPI router configuration")
        
        else:
            print("✅ No obvious critical issues detected")
            print("   → Comment functionality appears to be working")
            print("   → Issue may be frontend-related or user-specific")
        
        print(f"\n📋 RECOMMENDATIONS:")
        print("-" * 40)
        
        if self.failed_tests:
            print("1. Check backend server logs for detailed error messages")
            print("2. Verify database tables exist and have proper constraints")
            print("3. Test with different user accounts and browsers")
            print("4. Check frontend JavaScript console for errors")
            print("5. Verify API endpoint URLs match frontend calls")
        else:
            print("1. All backend comment functionality is working correctly")
            print("2. Issue is likely in frontend implementation")
            print("3. Check frontend comment form submission logic")
            print("4. Verify frontend authentication token handling")

def main():
    tester = CommentTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()