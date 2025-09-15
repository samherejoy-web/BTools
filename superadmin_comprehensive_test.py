#!/usr/bin/env python3
"""
Comprehensive SuperAdmin Functionality Testing
Test all superadmin functionality as requested in the review
"""

import requests
import json
import sys
from datetime import datetime

class SuperAdminTester:
    def __init__(self, base_url="https://jsonld-production.preview.emergentagent.com/api"):
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

    def test_superadmin_authentication(self):
        """Test SuperAdmin Authentication"""
        print("\n🔐 SUPERADMIN AUTHENTICATION TESTING")
        print("=" * 50)
        
        success, response = self.run_test(
            "SuperAdmin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "superadmin@marketmind.com", "password": "admin123"},
            description="Test login with superadmin@marketmind.com / admin123"
        )
        
        if success and isinstance(response, dict):
            if 'access_token' in response:
                self.token = response['access_token']
                user_role = response.get('user', {}).get('role', 'unknown')
                print(f"   ✅ Logged in as: {user_role}")
                if user_role == 'superadmin':
                    print(f"   ✅ SuperAdmin role confirmed")
                    return True
                else:
                    print(f"   ❌ Expected superadmin role, got: {user_role}")
                    return False
        return False

    def test_superadmin_users_management(self):
        """Test SuperAdmin Users Management"""
        print("\n👥 SUPERADMIN USERS MANAGEMENT TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping users management test - no authentication token")
            return False
        
        success, response = self.run_test(
            "Get All Users (SuperAdmin)",
            "GET",
            "superadmin/users",
            200,
            description="GET /api/superadmin/users - verify all users displayed with roles"
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} users")
            
            # Analyze user roles
            role_counts = {}
            for user in response:
                role = user.get('role', 'unknown')
                role_counts[role] = role_counts.get(role, 0) + 1
            
            print(f"   Role distribution:")
            for role, count in role_counts.items():
                print(f"     - {role}: {count} users")
            
            # Check if we have expected roles
            expected_roles = ['user', 'admin', 'superadmin']
            found_roles = set(role_counts.keys())
            
            if all(role in found_roles for role in expected_roles):
                print(f"   ✅ All expected roles found: {expected_roles}")
            else:
                missing_roles = set(expected_roles) - found_roles
                print(f"   ⚠️ Missing roles: {missing_roles}")
            
            return True
        
        return False

    def test_superadmin_tools_management(self):
        """Test SuperAdmin Tools Management"""
        print("\n🛠️ SUPERADMIN TOOLS MANAGEMENT TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping tools management test - no authentication token")
            return False
        
        success, response = self.run_test(
            "Get All Tools (SuperAdmin)",
            "GET",
            "superadmin/tools",
            200,
            description="GET /api/superadmin/tools - verify all tools displayed with status"
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} tools")
            
            # Analyze tool status
            active_count = sum(1 for tool in response if tool.get('is_active', False))
            featured_count = sum(1 for tool in response if tool.get('is_featured', False))
            
            print(f"   Tool status:")
            print(f"     - Active tools: {active_count}/{len(response)}")
            print(f"     - Featured tools: {featured_count}/{len(response)}")
            
            # Show sample tools
            if len(response) > 0:
                print(f"   Sample tools:")
                for i, tool in enumerate(response[:3]):
                    name = tool.get('name', 'Unknown')
                    status = "Active" if tool.get('is_active') else "Inactive"
                    featured = "Featured" if tool.get('is_featured') else "Regular"
                    print(f"     {i+1}. {name} - {status}, {featured}")
            
            return True
        
        return False

    def test_superadmin_categories_management(self):
        """Test SuperAdmin Categories Management"""
        print("\n📂 SUPERADMIN CATEGORIES MANAGEMENT TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping categories management test - no authentication token")
            return False
        
        success, response = self.run_test(
            "Get All Categories (SuperAdmin)",
            "GET",
            "superadmin/categories",
            200,
            description="GET /api/superadmin/categories - verify categories with SEO data"
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} categories")
            
            # Check SEO data for categories
            seo_count = 0
            for category in response:
                has_seo = bool(category.get('seo_title') or category.get('seo_description'))
                if has_seo:
                    seo_count += 1
            
            print(f"   SEO data:")
            print(f"     - Categories with SEO data: {seo_count}/{len(response)}")
            
            # Show sample categories
            if len(response) > 0:
                print(f"   Sample categories:")
                for i, category in enumerate(response[:3]):
                    name = category.get('name', 'Unknown')
                    has_seo = "✅ SEO" if (category.get('seo_title') or category.get('seo_description')) else "❌ No SEO"
                    print(f"     {i+1}. {name} - {has_seo}")
            
            return True
        
        return False

    def test_seo_overview(self):
        """Test SEO Overview"""
        print("\n📊 SEO OVERVIEW TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping SEO overview test - no authentication token")
            return False
        
        success, response = self.run_test(
            "SEO Overview",
            "GET",
            "superadmin/seo/overview",
            200,
            description="GET /api/superadmin/seo/overview - verify SEO health score and metrics"
        )
        
        if success and isinstance(response, dict):
            health_score = response.get('seo_health_score', 0)
            total_pages = response.get('total_pages', 0)
            optimized_pages = response.get('seo_optimized_pages', 0)
            critical_issues = response.get('critical_issues', 0)
            
            print(f"   ✅ SEO Overview received:")
            print(f"     - SEO Health Score: {health_score}%")
            print(f"     - Total Pages: {total_pages}")
            print(f"     - SEO Optimized Pages: {optimized_pages}")
            print(f"     - Critical Issues: {critical_issues}")
            
            # Check tools and blogs breakdown
            tools_data = response.get('tools', {})
            blogs_data = response.get('blogs', {})
            
            if tools_data:
                tools_total = tools_data.get('total', 0)
                tools_seo = tools_data.get('with_seo', 0)
                tools_percent = tools_data.get('seo_percentage', 0)
                print(f"     - Tools: {tools_total} total, {tools_seo} with SEO ({tools_percent}%)")
            
            if blogs_data:
                blogs_total = blogs_data.get('total', 0)
                blogs_seo = blogs_data.get('with_seo', 0)
                blogs_percent = blogs_data.get('seo_percentage', 0)
                print(f"     - Blogs: {blogs_total} total, {blogs_seo} with SEO ({blogs_percent}%)")
            
            return True
        
        return False

    def test_seo_issues_analysis(self):
        """Test SEO Issues Analysis"""
        print("\n🔍 SEO ISSUES ANALYSIS TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping SEO issues test - no authentication token")
            return False
        
        success, response = self.run_test(
            "SEO Issues Analysis",
            "GET",
            "superadmin/seo/issues",
            200,
            description="GET /api/superadmin/seo/issues - verify issues detection and filtering"
        )
        
        if success and isinstance(response, dict):
            total_issues = response.get('total_issues', 0)
            issues_by_severity = response.get('issues_by_severity', {})
            
            print(f"   ✅ SEO Issues Analysis received:")
            print(f"     - Total Issues: {total_issues}")
            
            if issues_by_severity:
                print(f"     - Issues by severity:")
                for severity, count in issues_by_severity.items():
                    print(f"       • {severity}: {count} issues")
            
            # Test filtering by severity
            success_filter, filter_response = self.run_test(
                "SEO Issues - High Severity Filter",
                "GET",
                "superadmin/seo/issues?severity=high",
                200,
                description="Test filtering SEO issues by high severity"
            )
            
            if success_filter:
                print(f"   ✅ Severity filtering working")
            
            return success and success_filter
        
        return False

    def test_seo_template_generation(self):
        """Test SEO Template Generation"""
        print("\n🎨 SEO TEMPLATE GENERATION TESTING")
        print("=" * 50)
        
        if not self.token:
            print("❌ Skipping SEO template generation test - no authentication token")
            return False
        
        results = []
        
        # Test tools template generation
        success_tools, response_tools = self.run_test(
            "SEO Template Generation - Tools",
            "POST",
            "superadmin/seo/generate-templates?page_type=tools&count=5",
            200,
            description="POST /api/superadmin/seo/generate-templates - test for tools"
        )
        results.append(success_tools)
        
        if success_tools and isinstance(response_tools, dict):
            updated_count = response_tools.get('updated_count', 0)
            print(f"   ✅ Tools template generation: {updated_count} items updated")
        
        # Test blogs template generation
        success_blogs, response_blogs = self.run_test(
            "SEO Template Generation - Blogs",
            "POST",
            "superadmin/seo/generate-templates?page_type=blogs&count=5",
            200,
            description="POST /api/superadmin/seo/generate-templates - test for blogs"
        )
        results.append(success_blogs)
        
        if success_blogs and isinstance(response_blogs, dict):
            updated_count = response_blogs.get('updated_count', 0)
            print(f"   ✅ Blogs template generation: {updated_count} items updated")
        
        return all(results)

    def test_database_connectivity(self):
        """Test Database Connectivity"""
        print("\n💾 DATABASE CONNECTIVITY TESTING")
        print("=" * 50)
        
        success, response = self.run_test(
            "Database Health Check",
            "GET",
            "health",
            200,
            description="Verify current SQLite database has proper data"
        )
        
        if success and isinstance(response, dict):
            db_status = response.get('database', 'unknown')
            print(f"   ✅ Database status: {db_status}")
            
            if db_status == 'connected':
                print(f"   ✅ Database connectivity verified")
                return True
            else:
                print(f"   ❌ Database connectivity issue: {db_status}")
                return False
        
        return False

    def test_public_apis(self):
        """Test All Public APIs"""
        print("\n🌐 PUBLIC APIS TESTING")
        print("=" * 50)
        
        results = []
        
        # Test /api/tools
        success, response = self.run_test(
            "Public Tools API",
            "GET",
            "tools",
            200,
            description="Test /api/tools public endpoint"
        )
        results.append(success)
        if success and isinstance(response, list):
            print(f"   ✅ Tools API: {len(response)} tools found")
        
        # Test /api/blogs
        success, response = self.run_test(
            "Public Blogs API",
            "GET",
            "blogs",
            200,
            description="Test /api/blogs public endpoint"
        )
        results.append(success)
        if success and isinstance(response, list):
            print(f"   ✅ Blogs API: {len(response)} blogs found")
        
        # Test /api/categories
        success, response = self.run_test(
            "Public Categories API",
            "GET",
            "categories",
            200,
            description="Test /api/categories public endpoint"
        )
        results.append(success)
        if success and isinstance(response, list):
            print(f"   ✅ Categories API: {len(response)} categories found")
        
        # Test /api/sitemap.xml
        success, response = self.run_test(
            "Public Sitemap API",
            "GET",
            "sitemap.xml",
            200,
            description="Test /api/sitemap.xml public endpoint"
        )
        results.append(success)
        if success:
            print(f"   ✅ Sitemap API: XML generated successfully")
        
        # Test /api/robots.txt
        success, response = self.run_test(
            "Public Robots.txt API",
            "GET",
            "robots.txt",
            200,
            description="Test /api/robots.txt public endpoint"
        )
        results.append(success)
        if success:
            print(f"   ✅ Robots.txt API: Generated successfully")
        
        return all(results)

    def run_comprehensive_test(self):
        """Run all comprehensive superadmin tests"""
        print("🚀 COMPREHENSIVE SUPERADMIN FUNCTIONALITY TESTING")
        print("=" * 80)
        print("🎯 TESTING ALL SUPERADMIN FUNCTIONALITY FOR PRODUCTION READINESS")
        print("=" * 80)
        
        test_results = []
        
        # 1. SuperAdmin Authentication
        test_results.append(self.test_superadmin_authentication())
        
        # 2. SuperAdmin Users Management
        test_results.append(self.test_superadmin_users_management())
        
        # 3. SuperAdmin Tools Management
        test_results.append(self.test_superadmin_tools_management())
        
        # 4. SuperAdmin Categories Management
        test_results.append(self.test_superadmin_categories_management())
        
        # 5. SEO Overview
        test_results.append(self.test_seo_overview())
        
        # 6. SEO Issues Analysis
        test_results.append(self.test_seo_issues_analysis())
        
        # 7. SEO Template Generation
        test_results.append(self.test_seo_template_generation())
        
        # 8. Database Connectivity
        test_results.append(self.test_database_connectivity())
        
        # 9. All Public APIs
        test_results.append(self.test_public_apis())
        
        # Final Results
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE SUPERADMIN TEST RESULTS")
        print("=" * 80)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['name']}")
                if 'expected' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                print(f"   Endpoint: {test['endpoint']}")
        
        overall_success = all(test_results)
        
        print("\n" + "=" * 80)
        if overall_success:
            print("🎉 ALL SUPERADMIN FUNCTIONALITY TESTS PASSED!")
            print("✅ Application is ready for PostgreSQL migration and production deployment")
        else:
            print("❌ SOME SUPERADMIN FUNCTIONALITY TESTS FAILED!")
            print("⚠️ Issues need to be resolved before production deployment")
        print("=" * 80)
        
        return overall_success

if __name__ == "__main__":
    tester = SuperAdminTester()
    success = tester.run_comprehensive_test()
    sys.exit(0 if success else 1)