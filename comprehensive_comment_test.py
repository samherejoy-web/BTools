#!/usr/bin/env python3
"""
Comprehensive Comment Testing - Edge Cases and Error Scenarios
Testing various scenarios that might cause comment failures
"""

import requests
import json
import sys
from datetime import datetime

class ComprehensiveCommentTester:
    def __init__(self, base_url="https://secure-signup-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_results = []
        self.critical_issues = []
        
    def log_result(self, test_name, success, details="", error_details="", is_critical=False):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'error': error_details,
            'timestamp': datetime.now().isoformat(),
            'critical': is_critical
        }
        self.test_results.append(result)
        
        if is_critical and not success:
            self.critical_issues.append(result)
        
        status = "🚨" if is_critical and not success else "✅" if success else "❌"
        print(f"{status} {test_name}: {details if success else error_details}")
    
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
    
    def authenticate(self):
        """Authenticate with a test user"""
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
                    return True
            except Exception as e:
                pass
        return False
    
    def test_comment_edge_cases(self):
        """Test various edge cases that might cause comment failures"""
        print("\n🧪 TESTING COMMENT EDGE CASES")
        print("-" * 50)
        
        if not self.authenticate():
            self.log_result(
                "Authentication for Edge Cases",
                False,
                "Cannot authenticate - skipping edge case tests",
                is_critical=True
            )
            return
        
        # Get a test blog
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        if not blogs_response or blogs_response.status_code != 200:
            self.log_result(
                "Get Test Blog for Edge Cases",
                False,
                "Cannot get test blog",
                is_critical=True
            )
            return
        
        try:
            blogs = blogs_response.json()
            if not blogs:
                self.log_result(
                    "Test Blog Availability",
                    False,
                    "No blogs available for testing",
                    is_critical=True
                )
                return
            
            test_blog_slug = blogs[0]['slug']
        except Exception as e:
            self.log_result(
                "Parse Test Blog Response",
                False,
                f"Cannot parse blog response: {str(e)}",
                is_critical=True
            )
            return
        
        # Test 1: Empty comment content
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': ''
        })
        
        if response:
            if response.status_code == 422 or response.status_code == 400:
                self.log_result(
                    "Empty Comment Content Validation",
                    True,
                    "Properly rejects empty comments"
                )
            elif response.status_code == 200:
                self.log_result(
                    "Empty Comment Content Validation",
                    False,
                    "Accepts empty comments (potential issue)",
                    is_critical=False
                )
            else:
                self.log_result(
                    "Empty Comment Content Validation",
                    False,
                    f"Unexpected status: {response.status_code}",
                    is_critical=False
                )
        
        # Test 2: Very long comment content
        long_content = "A" * 10000  # 10k characters
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': long_content
        })
        
        if response:
            if response.status_code == 200:
                self.log_result(
                    "Long Comment Content",
                    True,
                    "Accepts long comments"
                )
            elif response.status_code == 422 or response.status_code == 413:
                self.log_result(
                    "Long Comment Content",
                    True,
                    "Properly limits comment length"
                )
            else:
                self.log_result(
                    "Long Comment Content",
                    False,
                    f"Unexpected status: {response.status_code}",
                    is_critical=False
                )
        
        # Test 3: Special characters and HTML in comments
        special_content = "<script>alert('xss')</script> & special chars: éñ中文🚀"
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': special_content
        })
        
        if response:
            if response.status_code == 200:
                try:
                    comment_data = response.json()
                    returned_content = comment_data.get('content', '')
                    if '<script>' not in returned_content:
                        self.log_result(
                            "Special Characters and HTML Sanitization",
                            True,
                            "Properly sanitizes HTML content"
                        )
                    else:
                        self.log_result(
                            "Special Characters and HTML Sanitization",
                            False,
                            "Does not sanitize HTML (security risk)",
                            is_critical=True
                        )
                except Exception as e:
                    self.log_result(
                        "Special Characters and HTML Sanitization",
                        False,
                        f"Cannot parse response: {str(e)}",
                        is_critical=False
                    )
            else:
                self.log_result(
                    "Special Characters and HTML Sanitization",
                    False,
                    f"Rejects special characters: {response.status_code}",
                    is_critical=False
                )
        
        # Test 4: Comment on non-existent blog
        response = self.make_request('POST', 'blogs/non-existent-slug-12345/comments', {
            'content': 'Test comment on non-existent blog'
        })
        
        if response:
            if response.status_code == 404:
                self.log_result(
                    "Comment on Non-existent Blog",
                    True,
                    "Properly returns 404 for non-existent blog"
                )
            else:
                self.log_result(
                    "Comment on Non-existent Blog",
                    False,
                    f"Unexpected status: {response.status_code}",
                    is_critical=False
                )
        
        # Test 5: Comment without authentication
        old_token = self.token
        self.token = None
        
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': 'Test comment without auth'
        })
        
        if response:
            if response.status_code == 401:
                self.log_result(
                    "Comment Without Authentication",
                    True,
                    "Properly requires authentication"
                )
            else:
                self.log_result(
                    "Comment Without Authentication",
                    False,
                    f"Does not require auth: {response.status_code}",
                    is_critical=True
                )
        
        self.token = old_token  # Restore token
        
        # Test 6: Comment with invalid/expired token
        self.token = "invalid.jwt.token"
        
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': 'Test comment with invalid token'
        })
        
        if response:
            if response.status_code == 401:
                self.log_result(
                    "Comment With Invalid Token",
                    True,
                    "Properly rejects invalid tokens"
                )
            else:
                self.log_result(
                    "Comment With Invalid Token",
                    False,
                    f"Accepts invalid token: {response.status_code}",
                    is_critical=True
                )
        
        self.token = old_token  # Restore token
    
    def test_comment_rate_limiting(self):
        """Test if there's any rate limiting on comments"""
        print("\n⏱️ TESTING COMMENT RATE LIMITING")
        print("-" * 50)
        
        if not self.token:
            self.log_result(
                "Rate Limiting Test Setup",
                False,
                "No authentication token available"
            )
            return
        
        # Get a test blog
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        if not blogs_response or blogs_response.status_code != 200:
            return
        
        try:
            blogs = blogs_response.json()
            if not blogs:
                return
            test_blog_slug = blogs[0]['slug']
        except:
            return
        
        # Try to post multiple comments quickly
        success_count = 0
        rate_limited = False
        
        for i in range(5):
            response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
                'content': f'Rate limit test comment #{i+1} at {datetime.now().isoformat()}'
            })
            
            if response:
                if response.status_code == 200:
                    success_count += 1
                elif response.status_code == 429:  # Too Many Requests
                    rate_limited = True
                    break
        
        if rate_limited:
            self.log_result(
                "Comment Rate Limiting",
                True,
                f"Rate limiting active after {success_count} comments"
            )
        else:
            self.log_result(
                "Comment Rate Limiting",
                True,
                f"No rate limiting detected ({success_count}/5 comments posted)"
            )
    
    def test_comment_approval_workflow(self):
        """Test comment approval workflow"""
        print("\n✅ TESTING COMMENT APPROVAL WORKFLOW")
        print("-" * 50)
        
        if not self.token:
            return
        
        # Get a test blog
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        if not blogs_response or blogs_response.status_code != 200:
            return
        
        try:
            blogs = blogs_response.json()
            if not blogs:
                return
            test_blog_slug = blogs[0]['slug']
        except:
            return
        
        # Post a comment
        response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': f'Approval workflow test comment at {datetime.now().isoformat()}'
        })
        
        if response and response.status_code == 200:
            try:
                comment_data = response.json()
                is_approved = comment_data.get('is_approved', False)
                
                if is_approved:
                    self.log_result(
                        "Comment Auto-Approval",
                        True,
                        "Comments are auto-approved"
                    )
                else:
                    self.log_result(
                        "Comment Manual Approval",
                        True,
                        "Comments require manual approval"
                    )
                
                # Check if the comment appears in the public list
                comments_response = self.make_request('GET', f'blogs/{test_blog_slug}/comments')
                if comments_response and comments_response.status_code == 200:
                    try:
                        comments = comments_response.json()
                        comment_found = any(c.get('id') == comment_data.get('id') for c in comments)
                        
                        if comment_found and is_approved:
                            self.log_result(
                                "Approved Comment Visibility",
                                True,
                                "Approved comments are visible publicly"
                            )
                        elif not comment_found and not is_approved:
                            self.log_result(
                                "Unapproved Comment Visibility",
                                True,
                                "Unapproved comments are hidden from public"
                            )
                        else:
                            self.log_result(
                                "Comment Visibility Logic",
                                False,
                                f"Inconsistent visibility: found={comment_found}, approved={is_approved}",
                                is_critical=False
                            )
                    except Exception as e:
                        self.log_result(
                            "Comment Visibility Check",
                            False,
                            f"Cannot parse comments response: {str(e)}"
                        )
            except Exception as e:
                self.log_result(
                    "Comment Approval Data",
                    False,
                    f"Cannot parse comment response: {str(e)}"
                )
    
    def test_nested_comments(self):
        """Test nested comment (reply) functionality"""
        print("\n🔗 TESTING NESTED COMMENTS (REPLIES)")
        print("-" * 50)
        
        if not self.token:
            return
        
        # Get a test blog
        blogs_response = self.make_request('GET', 'blogs?limit=1')
        if not blogs_response or blogs_response.status_code != 200:
            return
        
        try:
            blogs = blogs_response.json()
            if not blogs:
                return
            test_blog_slug = blogs[0]['slug']
        except:
            return
        
        # Post a parent comment
        parent_response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
            'content': f'Parent comment for reply test at {datetime.now().isoformat()}'
        })
        
        if parent_response and parent_response.status_code == 200:
            try:
                parent_comment = parent_response.json()
                parent_id = parent_comment.get('id')
                
                if parent_id:
                    # Post a reply
                    reply_response = self.make_request('POST', f'blogs/{test_blog_slug}/comments', {
                        'content': f'Reply to parent comment at {datetime.now().isoformat()}',
                        'parent_id': parent_id
                    })
                    
                    if reply_response and reply_response.status_code == 200:
                        try:
                            reply_comment = reply_response.json()
                            reply_parent_id = reply_comment.get('parent_id')
                            
                            if reply_parent_id == parent_id:
                                self.log_result(
                                    "Nested Comment Creation",
                                    True,
                                    "Successfully created nested comment"
                                )
                                
                                # Check if nested structure is maintained in GET request
                                comments_response = self.make_request('GET', f'blogs/{test_blog_slug}/comments')
                                if comments_response and comments_response.status_code == 200:
                                    try:
                                        comments = comments_response.json()
                                        parent_found = None
                                        
                                        for comment in comments:
                                            if comment.get('id') == parent_id:
                                                parent_found = comment
                                                break
                                        
                                        if parent_found and 'replies' in parent_found:
                                            replies = parent_found.get('replies', [])
                                            reply_found = any(r.get('id') == reply_comment.get('id') for r in replies)
                                            
                                            if reply_found:
                                                self.log_result(
                                                    "Nested Comment Structure",
                                                    True,
                                                    "Nested comments properly structured in response"
                                                )
                                            else:
                                                self.log_result(
                                                    "Nested Comment Structure",
                                                    False,
                                                    "Reply not found in parent's replies array",
                                                    is_critical=False
                                                )
                                        else:
                                            self.log_result(
                                                "Nested Comment Structure",
                                                False,
                                                "Parent comment missing replies structure",
                                                is_critical=False
                                            )
                                    except Exception as e:
                                        self.log_result(
                                            "Nested Comment Structure Check",
                                            False,
                                            f"Cannot parse nested structure: {str(e)}"
                                        )
                            else:
                                self.log_result(
                                    "Nested Comment Parent ID",
                                    False,
                                    f"Parent ID mismatch: expected {parent_id}, got {reply_parent_id}",
                                    is_critical=False
                                )
                        except Exception as e:
                            self.log_result(
                                "Nested Comment Reply Data",
                                False,
                                f"Cannot parse reply response: {str(e)}"
                            )
                    else:
                        status = reply_response.status_code if reply_response else "No response"
                        self.log_result(
                            "Nested Comment Reply Creation",
                            False,
                            f"Failed to create reply: {status}",
                            is_critical=False
                        )
                else:
                    self.log_result(
                        "Parent Comment ID",
                        False,
                        "Parent comment missing ID",
                        is_critical=False
                    )
            except Exception as e:
                self.log_result(
                    "Parent Comment Data",
                    False,
                    f"Cannot parse parent comment response: {str(e)}"
                )
        else:
            status = parent_response.status_code if parent_response else "No response"
            self.log_result(
                "Parent Comment Creation",
                False,
                f"Failed to create parent comment: {status}",
                is_critical=False
            )
    
    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        print("🔬 COMPREHENSIVE COMMENT FUNCTIONALITY TESTING")
        print("=" * 60)
        print("Testing edge cases and potential failure scenarios")
        print("=" * 60)
        
        self.test_comment_edge_cases()
        self.test_comment_rate_limiting()
        self.test_comment_approval_workflow()
        self.test_nested_comments()
        
        self.generate_comprehensive_report()
    
    def generate_comprehensive_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("🔍 COMPREHENSIVE COMMENT TESTING REPORT")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        critical_issues = len(self.critical_issues)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Critical Issues: {critical_issues}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES ({len(self.critical_issues)}):")
            print("-" * 40)
            for issue in self.critical_issues:
                print(f"   • {issue['test']}: {issue['error']}")
        
        # Categorize results
        security_tests = [r for r in self.test_results if 'Sanitization' in r['test'] or 'Authentication' in r['test'] or 'Token' in r['test']]
        validation_tests = [r for r in self.test_results if 'Validation' in r['test'] or 'Empty' in r['test'] or 'Long' in r['test']]
        functionality_tests = [r for r in self.test_results if 'Nested' in r['test'] or 'Approval' in r['test'] or 'Rate' in r['test']]
        
        print(f"\n📊 TEST CATEGORIES:")
        print("-" * 40)
        
        if security_tests:
            security_passed = len([t for t in security_tests if t['success']])
            print(f"🔒 Security Tests: {security_passed}/{len(security_tests)} passed")
        
        if validation_tests:
            validation_passed = len([t for t in validation_tests if t['success']])
            print(f"✅ Validation Tests: {validation_passed}/{len(validation_tests)} passed")
        
        if functionality_tests:
            functionality_passed = len([t for t in functionality_tests if t['success']])
            print(f"⚙️ Functionality Tests: {functionality_passed}/{len(functionality_tests)} passed")
        
        print(f"\n🎯 FINAL ASSESSMENT:")
        print("-" * 40)
        
        if critical_issues == 0 and passed_tests == total_tests:
            print("✅ EXCELLENT: All comment functionality tests passed")
            print("   → Comment system is robust and secure")
            print("   → No critical issues detected")
        elif critical_issues == 0:
            print("✅ GOOD: No critical issues, minor improvements possible")
            print("   → Core comment functionality is working")
            print("   → Some edge cases could be improved")
        elif critical_issues <= 2:
            print("⚠️ MODERATE: Some critical issues need attention")
            print("   → Comment functionality mostly works")
            print("   → Security or authentication issues detected")
        else:
            print("🚨 CRITICAL: Multiple serious issues detected")
            print("   → Comment functionality has significant problems")
            print("   → Immediate fixes required")
        
        print(f"\n📋 USER ISSUE ANALYSIS:")
        print("-" * 40)
        
        if critical_issues == 0 and passed_tests >= total_tests * 0.9:
            print("✅ Backend comment functionality is working correctly")
            print("   → User issues are likely frontend-related")
            print("   → Check JavaScript, form handling, UI components")
            print("   → Verify authentication token management in frontend")
        else:
            print("❌ Backend issues detected that could affect users")
            print("   → Fix critical backend issues first")
            print("   → Then investigate frontend implementation")

def main():
    tester = ComprehensiveCommentTester()
    tester.run_comprehensive_test()

if __name__ == "__main__":
    main()