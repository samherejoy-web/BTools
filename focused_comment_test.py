#!/usr/bin/env python3
"""
Focused Comment Testing - Specific Issue Investigation
Testing specific scenarios that might cause user comment failures
"""

import requests
import json
import sys
from datetime import datetime

class FocusedCommentTester:
    def __init__(self, base_url="https://medium-clone-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.issues_found = []
        
    def log_issue(self, issue_type, description, severity="medium"):
        """Log issues found during testing"""
        issue = {
            'type': issue_type,
            'description': description,
            'severity': severity,
            'timestamp': datetime.now().isoformat()
        }
        self.issues_found.append(issue)
        
        severity_icon = "🚨" if severity == "critical" else "⚠️" if severity == "high" else "ℹ️"
        print(f"{severity_icon} {issue_type}: {description}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with detailed error logging"""
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
        except requests.exceptions.Timeout:
            self.log_issue("Request Timeout", f"Request to {endpoint} timed out", "high")
            return None
        except requests.exceptions.ConnectionError:
            self.log_issue("Connection Error", f"Cannot connect to {endpoint}", "critical")
            return None
        except Exception as e:
            self.log_issue("Request Error", f"Request failed: {str(e)}", "high")
            return None
    
    def test_authentication_scenarios(self):
        """Test various authentication scenarios"""
        print("\n🔐 TESTING AUTHENTICATION SCENARIOS")
        print("-" * 50)
        
        # Test 1: Valid login
        response = self.make_request('POST', 'auth/login', {
            'email': 'user1@example.com',
            'password': 'password123'
        })
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'access_token' in data:
                    self.token = data['access_token']
                    self.user_id = data.get('user', {}).get('id')
                    print("✅ Authentication successful")
                    
                    # Test token validation
                    me_response = self.make_request('GET', 'auth/me')
                    if me_response and me_response.status_code == 200:
                        print("✅ Token validation successful")
                    else:
                        self.log_issue("Token Validation", "JWT token validation failed", "critical")
                else:
                    self.log_issue("Authentication Response", "No access token in login response", "critical")
            except Exception as e:
                self.log_issue("Authentication Parsing", f"Cannot parse login response: {str(e)}", "critical")
        else:
            status = response.status_code if response else "No response"
            self.log_issue("Authentication Failure", f"Login failed with status: {status}", "critical")
        
        # Test 2: Invalid credentials
        response = self.make_request('POST', 'auth/login', {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        })
        
        if response and response.status_code in [401, 403]:
            print("✅ Invalid credentials properly rejected")
        else:
            status = response.status_code if response else "No response"
            self.log_issue("Invalid Credentials Handling", f"Unexpected response to invalid login: {status}", "medium")
    
    def test_comment_creation_detailed(self):
        """Test comment creation with detailed error analysis"""
        print("\n💬 TESTING COMMENT CREATION (DETAILED)")
        print("-" * 50)
        
        if not self.token:
            self.log_issue("Comment Test Setup", "No authentication token available", "critical")
            return
        
        # Get test data
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        tools_response = self.make_request('GET', 'tools?limit=1')
        
        if not blogs_response or blogs_response.status_code != 200:
            self.log_issue("Test Data - Blogs", "Cannot retrieve blogs for testing", "high")
            return
        
        if not tools_response or tools_response.status_code != 200:
            self.log_issue("Test Data - Tools", "Cannot retrieve tools for testing", "high")
            return
        
        try:
            blogs = blogs_response.json()
            tools = tools_response.json()
            
            if not blogs:
                self.log_issue("Test Data - Blog Availability", "No blogs available for testing", "high")
                return
            
            if not tools:
                self.log_issue("Test Data - Tool Availability", "No tools available for testing", "high")
                return
            
            blog_slug = blogs[0]['slug']
            tool_slug = tools[0]['slug']
            
        except Exception as e:
            self.log_issue("Test Data Parsing", f"Cannot parse test data: {str(e)}", "high")
            return
        
        # Test blog comment creation
        print(f"Testing blog comment on: {blog_slug}")
        
        comment_data = {
            'content': f'Detailed test comment on blog at {datetime.now().isoformat()}'
        }
        
        response = self.make_request('POST', f'blogs/{blog_slug}/comments', comment_data)
        
        if response:
            if response.status_code == 200:
                try:
                    comment_response = response.json()
                    print("✅ Blog comment created successfully")
                    
                    # Verify response structure
                    required_fields = ['id', 'content', 'user_id', 'user_name', 'created_at']
                    missing_fields = [field for field in required_fields if field not in comment_response]
                    
                    if missing_fields:
                        self.log_issue("Blog Comment Response Structure", f"Missing fields: {missing_fields}", "medium")
                    else:
                        print("✅ Blog comment response structure is complete")
                    
                    # Verify content matches
                    if comment_response.get('content') != comment_data['content']:
                        self.log_issue("Blog Comment Content Integrity", "Comment content was modified", "medium")
                    else:
                        print("✅ Blog comment content integrity maintained")
                    
                except Exception as e:
                    self.log_issue("Blog Comment Response Parsing", f"Cannot parse comment response: {str(e)}", "high")
            
            elif response.status_code == 401:
                self.log_issue("Blog Comment Authentication", "Authentication failed for comment creation", "critical")
            elif response.status_code == 403:
                self.log_issue("Blog Comment Authorization", "User not authorized to comment", "high")
            elif response.status_code == 404:
                self.log_issue("Blog Comment Not Found", f"Blog '{blog_slug}' not found", "high")
            elif response.status_code == 422:
                try:
                    error_data = response.json()
                    self.log_issue("Blog Comment Validation", f"Validation error: {error_data}", "medium")
                except:
                    self.log_issue("Blog Comment Validation", "Validation error (cannot parse details)", "medium")
            elif response.status_code == 500:
                self.log_issue("Blog Comment Server Error", "Internal server error during comment creation", "critical")
            else:
                self.log_issue("Blog Comment Unexpected Status", f"Unexpected status code: {response.status_code}", "medium")
        
        # Test tool comment creation
        print(f"Testing tool comment on: {tool_slug}")
        
        comment_data = {
            'content': f'Detailed test comment on tool at {datetime.now().isoformat()}'
        }
        
        response = self.make_request('POST', f'tools/{tool_slug}/comments', comment_data)
        
        if response:
            if response.status_code == 200:
                try:
                    comment_response = response.json()
                    print("✅ Tool comment created successfully")
                    
                    # Verify response structure
                    required_fields = ['id', 'content', 'user_id', 'user_name', 'created_at']
                    missing_fields = [field for field in required_fields if field not in comment_response]
                    
                    if missing_fields:
                        self.log_issue("Tool Comment Response Structure", f"Missing fields: {missing_fields}", "medium")
                    else:
                        print("✅ Tool comment response structure is complete")
                    
                    # Verify content matches
                    if comment_response.get('content') != comment_data['content']:
                        self.log_issue("Tool Comment Content Integrity", "Comment content was modified", "medium")
                    else:
                        print("✅ Tool comment content integrity maintained")
                    
                except Exception as e:
                    self.log_issue("Tool Comment Response Parsing", f"Cannot parse comment response: {str(e)}", "high")
            
            elif response.status_code == 401:
                self.log_issue("Tool Comment Authentication", "Authentication failed for comment creation", "critical")
            elif response.status_code == 403:
                self.log_issue("Tool Comment Authorization", "User not authorized to comment", "high")
            elif response.status_code == 404:
                self.log_issue("Tool Comment Not Found", f"Tool '{tool_slug}' not found", "high")
            elif response.status_code == 422:
                try:
                    error_data = response.json()
                    self.log_issue("Tool Comment Validation", f"Validation error: {error_data}", "medium")
                except:
                    self.log_issue("Tool Comment Validation", "Validation error (cannot parse details)", "medium")
            elif response.status_code == 500:
                self.log_issue("Tool Comment Server Error", "Internal server error during comment creation", "critical")
            else:
                self.log_issue("Tool Comment Unexpected Status", f"Unexpected status code: {response.status_code}", "medium")
    
    def test_comment_retrieval(self):
        """Test comment retrieval functionality"""
        print("\n📖 TESTING COMMENT RETRIEVAL")
        print("-" * 50)
        
        # Get test data
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        tools_response = self.make_request('GET', 'tools?limit=1')
        
        if not blogs_response or not tools_response:
            return
        
        try:
            blogs = blogs_response.json()
            tools = tools_response.json()
            
            if blogs:
                blog_slug = blogs[0]['slug']
                
                # Test blog comment retrieval
                response = self.make_request('GET', f'blogs/{blog_slug}/comments')
                
                if response and response.status_code == 200:
                    try:
                        comments = response.json()
                        print(f"✅ Blog comments retrieved: {len(comments)} comments")
                        
                        # Check comment structure
                        if comments:
                            sample_comment = comments[0]
                            required_fields = ['id', 'content', 'user_name', 'created_at']
                            missing_fields = [field for field in required_fields if field not in sample_comment]
                            
                            if missing_fields:
                                self.log_issue("Blog Comment Structure", f"Missing fields in comments: {missing_fields}", "medium")
                            else:
                                print("✅ Blog comment structure is correct")
                    except Exception as e:
                        self.log_issue("Blog Comment Retrieval Parsing", f"Cannot parse comments: {str(e)}", "high")
                else:
                    status = response.status_code if response else "No response"
                    self.log_issue("Blog Comment Retrieval", f"Failed to retrieve blog comments: {status}", "high")
            
            if tools:
                tool_slug = tools[0]['slug']
                
                # Test tool comment retrieval
                response = self.make_request('GET', f'tools/{tool_slug}/comments')
                
                if response and response.status_code == 200:
                    try:
                        comments = response.json()
                        print(f"✅ Tool comments retrieved: {len(comments)} comments")
                        
                        # Check comment structure
                        if comments:
                            sample_comment = comments[0]
                            required_fields = ['id', 'content', 'user_name', 'created_at']
                            missing_fields = [field for field in required_fields if field not in sample_comment]
                            
                            if missing_fields:
                                self.log_issue("Tool Comment Structure", f"Missing fields in comments: {missing_fields}", "medium")
                            else:
                                print("✅ Tool comment structure is correct")
                    except Exception as e:
                        self.log_issue("Tool Comment Retrieval Parsing", f"Cannot parse comments: {str(e)}", "high")
                else:
                    status = response.status_code if response else "No response"
                    self.log_issue("Tool Comment Retrieval", f"Failed to retrieve tool comments: {status}", "high")
        
        except Exception as e:
            self.log_issue("Comment Retrieval Setup", f"Cannot setup comment retrieval test: {str(e)}", "high")
    
    def test_cors_and_headers(self):
        """Test CORS and header issues that might affect frontend"""
        print("\n🌐 TESTING CORS AND HEADERS")
        print("-" * 50)
        
        # Test with Origin header (simulating frontend request)
        headers = {
            'Origin': 'https://medium-clone-3.preview.emergentagent.com',
            'Referer': 'https://medium-clone-3.preview.emergentagent.com/blogs'
        }
        
        response = self.make_request('GET', 'blogs?limit=1', headers=headers)
        
        if response:
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            }
            
            print("✅ CORS headers present:")
            for header, value in cors_headers.items():
                if value:
                    print(f"   {header}: {value}")
                else:
                    self.log_issue("CORS Configuration", f"Missing CORS header: {header}", "medium")
        else:
            self.log_issue("CORS Test", "Cannot test CORS headers", "high")
    
    def run_focused_test(self):
        """Run focused comment testing"""
        print("🎯 FOCUSED COMMENT FUNCTIONALITY TESTING")
        print("=" * 60)
        print("Investigating specific issues that might affect users")
        print("=" * 60)
        
        self.test_authentication_scenarios()
        self.test_comment_creation_detailed()
        self.test_comment_retrieval()
        self.test_cors_and_headers()
        
        self.generate_focused_report()
    
    def generate_focused_report(self):
        """Generate focused test report"""
        print("\n" + "=" * 60)
        print("🔍 FOCUSED COMMENT TESTING REPORT")
        print("=" * 60)
        
        if not self.issues_found:
            print("✅ NO ISSUES FOUND")
            print("   → All comment functionality is working correctly")
            print("   → Backend APIs are functioning properly")
            print("   → Authentication and authorization are working")
            print("   → CORS configuration is correct")
            print("\n🎯 CONCLUSION:")
            print("   → The issue is likely in the FRONTEND implementation")
            print("   → Check JavaScript comment form handling")
            print("   → Verify frontend authentication token management")
            print("   → Check browser console for JavaScript errors")
            print("   → Verify API endpoint URLs in frontend code")
            return
        
        # Categorize issues
        critical_issues = [i for i in self.issues_found if i['severity'] == 'critical']
        high_issues = [i for i in self.issues_found if i['severity'] == 'high']
        medium_issues = [i for i in self.issues_found if i['severity'] == 'medium']
        
        print(f"Total Issues Found: {len(self.issues_found)}")
        print(f"Critical: {len(critical_issues)}")
        print(f"High: {len(high_issues)}")
        print(f"Medium: {len(medium_issues)}")
        
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES:")
            print("-" * 40)
            for issue in critical_issues:
                print(f"   • {issue['type']}: {issue['description']}")
        
        if high_issues:
            print(f"\n⚠️ HIGH PRIORITY ISSUES:")
            print("-" * 40)
            for issue in high_issues:
                print(f"   • {issue['type']}: {issue['description']}")
        
        if medium_issues:
            print(f"\nℹ️ MEDIUM PRIORITY ISSUES:")
            print("-" * 40)
            for issue in medium_issues:
                print(f"   • {issue['type']}: {issue['description']}")
        
        print(f"\n🎯 ROOT CAUSE ANALYSIS:")
        print("-" * 40)
        
        if critical_issues:
            print("🚨 CRITICAL BACKEND ISSUES DETECTED")
            print("   → These issues will prevent users from commenting")
            print("   → Fix these backend issues immediately")
            
            auth_issues = [i for i in critical_issues if 'Authentication' in i['type'] or 'Token' in i['type']]
            if auth_issues:
                print("   → Authentication system is broken")
                print("   → Users cannot log in or tokens are invalid")
        
        elif high_issues:
            print("⚠️ SIGNIFICANT BACKEND ISSUES DETECTED")
            print("   → These issues may cause intermittent comment failures")
            print("   → Fix these issues to improve reliability")
        
        else:
            print("ℹ️ MINOR BACKEND ISSUES DETECTED")
            print("   → Core functionality works but has minor issues")
            print("   → These may not be the cause of user problems")
            print("   → Check frontend implementation as well")
        
        print(f"\n📋 RECOMMENDED ACTIONS:")
        print("-" * 40)
        
        if critical_issues:
            print("1. Fix critical authentication and server issues immediately")
            print("2. Test comment functionality after fixes")
            print("3. Check database connectivity and constraints")
            print("4. Verify JWT token generation and validation")
        elif high_issues:
            print("1. Address high priority issues")
            print("2. Test with different user accounts and scenarios")
            print("3. Check server logs for detailed error messages")
        else:
            print("1. Backend appears to be working correctly")
            print("2. Focus on frontend comment implementation")
            print("3. Check browser developer tools for errors")
            print("4. Verify frontend API calls and authentication")

def main():
    tester = FocusedCommentTester()
    tester.run_focused_test()

if __name__ == "__main__":
    main()