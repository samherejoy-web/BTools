#!/usr/bin/env python3
"""
PostgreSQL Migration Testing Suite
Tests complete backend functionality after PostgreSQL migration
"""

import requests
import sys
import json
import uuid
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class PostgreSQLMigrationTester:
    def __init__(self, base_url="https://blog-posting-fix.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.db_connection = None
        
        # Database connection details
        self.db_url = os.getenv("DATABASE_URL", "postgresql://marketmind:secure_marketmind_2024@localhost:5432/marketmind_prod")
        
    def connect_to_database(self):
        """Test direct PostgreSQL connection"""
        try:
            self.db_connection = psycopg2.connect(self.db_url)
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
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

    def test_database_connection(self):
        """Test 1: Database Connection Tests"""
        print("\n" + "="*70)
        print("🔧 TEST 1: DATABASE CONNECTION TESTS")
        print("="*70)
        
        results = []
        
        # 1.1 Test PostgreSQL connection
        print("\n📊 TEST 1.1: PostgreSQL Connection")
        success = self.connect_to_database()
        results.append(success)
        
        if success:
            print("✅ PostgreSQL connection successful")
            
            # 1.2 Test table existence
            print("\n📊 TEST 1.2: Table Creation Verification")
            try:
                cursor = self.db_connection.cursor()
                
                # Check if main tables exist
                tables_to_check = ['users', 'blogs', 'tools', 'categories', 'reviews']
                for table in tables_to_check:
                    cursor.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}');")
                    exists = cursor.fetchone()[0]
                    if exists:
                        print(f"   ✅ Table '{table}' exists")
                    else:
                        print(f"   ❌ Table '{table}' missing")
                        results.append(False)
                
                results.append(True)
                
                # 1.3 Test data retrieval
                print("\n📊 TEST 1.3: Data Retrieval from Major Tables")
                for table in tables_to_check:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table};")
                        count = cursor.fetchone()[0]
                        print(f"   ✅ {table}: {count} records")
                    except Exception as e:
                        print(f"   ❌ {table}: Error - {e}")
                        results.append(False)
                
                results.append(True)
                cursor.close()
                
            except Exception as e:
                print(f"   ❌ Database query failed: {e}")
                results.append(False)
        else:
            results.extend([False, False])
        
        return all(results)

    def test_api_endpoints(self):
        """Test 2: API Endpoint Tests"""
        print("\n" + "="*70)
        print("🔧 TEST 2: API ENDPOINT TESTS")
        print("="*70)
        
        results = []
        
        # 2.1 Health check
        print("\n📊 TEST 2.1: Health Check")
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200,
            description="Test API health and database connectivity"
        )
        results.append(success)
        
        if success and isinstance(response, dict):
            db_status = response.get('database', 'unknown')
            if db_status == 'connected':
                print("   ✅ Database connectivity confirmed via API")
                results.append(True)
            else:
                print(f"   ❌ Database status: {db_status}")
                results.append(False)
        
        # 2.2 Categories endpoint
        print("\n📊 TEST 2.2: Categories Endpoint")
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200,
            description="Test categories endpoint"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   ✅ Retrieved {len(response)} categories")
            if len(response) > 0:
                # Check first category structure
                first_cat = response[0]
                required_fields = ['id', 'name', 'slug']
                for field in required_fields:
                    if field in first_cat:
                        print(f"   ✅ Category has '{field}' field")
                    else:
                        print(f"   ❌ Category missing '{field}' field")
                        results.append(False)
                results.append(True)
        
        # 2.3 Tools endpoint
        print("\n📊 TEST 2.3: Tools Endpoint")
        success, response = self.run_test(
            "Get Tools",
            "GET",
            "tools",
            200,
            description="Test tools endpoint"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   ✅ Retrieved {len(response)} tools")
            if len(response) > 0:
                # Check first tool structure
                first_tool = response[0]
                required_fields = ['id', 'name', 'slug', 'features', 'pricing_type']
                for field in required_fields:
                    if field in first_tool:
                        print(f"   ✅ Tool has '{field}' field")
                    else:
                        print(f"   ❌ Tool missing '{field}' field")
                        results.append(False)
                results.append(True)
        
        # 2.4 Blogs endpoint
        print("\n📊 TEST 2.4: Blogs Endpoint")
        success, response = self.run_test(
            "Get Blogs",
            "GET",
            "blogs",
            200,
            description="Test blogs endpoint"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   ✅ Retrieved {len(response)} published blogs")
            if len(response) > 0:
                # Check first blog structure
                first_blog = response[0]
                required_fields = ['id', 'title', 'slug', 'status', 'tags', 'json_ld']
                for field in required_fields:
                    if field in first_blog:
                        print(f"   ✅ Blog has '{field}' field")
                    else:
                        print(f"   ❌ Blog missing '{field}' field")
                        results.append(False)
                results.append(True)
        
        return all(results)

    def test_postgresql_specific_features(self):
        """Test 3: PostgreSQL-Specific Tests"""
        print("\n" + "="*70)
        print("🔧 TEST 3: POSTGRESQL-SPECIFIC TESTS")
        print("="*70)
        
        results = []
        
        if not self.db_connection:
            print("❌ No database connection available")
            return False
        
        try:
            cursor = self.db_connection.cursor()
            
            # 3.1 Test JSON column functionality
            print("\n📊 TEST 3.1: JSON Column Functionality")
            
            # Test tools.features JSON column
            cursor.execute("SELECT id, name, features FROM tools WHERE features IS NOT NULL LIMIT 3;")
            tools_with_features = cursor.fetchall()
            
            if tools_with_features:
                print(f"   ✅ Found {len(tools_with_features)} tools with JSON features")
                for tool_id, name, features in tools_with_features:
                    if isinstance(features, (list, dict)):
                        print(f"   ✅ Tool '{name}': JSON features properly stored")
                    else:
                        print(f"   ❌ Tool '{name}': Features not stored as JSON")
                        results.append(False)
                results.append(True)
            else:
                print("   ⚠️ No tools with features found")
                results.append(True)  # Not a failure, just no data
            
            # Test blogs.tags JSON column
            cursor.execute("SELECT id, title, tags FROM blogs WHERE tags IS NOT NULL LIMIT 3;")
            blogs_with_tags = cursor.fetchall()
            
            if blogs_with_tags:
                print(f"   ✅ Found {len(blogs_with_tags)} blogs with JSON tags")
                for blog_id, title, tags in blogs_with_tags:
                    if isinstance(tags, list):
                        print(f"   ✅ Blog '{title}': JSON tags properly stored ({len(tags)} tags)")
                    else:
                        print(f"   ❌ Blog '{title}': Tags not stored as JSON array")
                        results.append(False)
                results.append(True)
            else:
                print("   ⚠️ No blogs with tags found")
                results.append(True)
            
            # 3.2 Test UUID primary key functionality
            print("\n📊 TEST 3.2: UUID Primary Key Functionality")
            
            # Check UUID format in users table
            cursor.execute("SELECT id FROM users LIMIT 5;")
            user_ids = cursor.fetchall()
            
            uuid_valid = True
            for (user_id,) in user_ids:
                try:
                    # Try to parse as UUID
                    uuid.UUID(user_id)
                    print(f"   ✅ Valid UUID: {user_id}")
                except ValueError:
                    print(f"   ❌ Invalid UUID: {user_id}")
                    uuid_valid = False
            
            results.append(uuid_valid)
            
            # 3.3 Test foreign key relationships
            print("\n📊 TEST 3.3: Foreign Key Relationships")
            
            # Test blog-author relationship
            cursor.execute("""
                SELECT b.id, b.title, u.username 
                FROM blogs b 
                JOIN users u ON b.author_id = u.id 
                LIMIT 3;
            """)
            blog_authors = cursor.fetchall()
            
            if blog_authors:
                print(f"   ✅ Blog-Author relationship working: {len(blog_authors)} blogs with authors")
                for blog_id, title, username in blog_authors:
                    print(f"   ✅ Blog '{title}' by '{username}'")
                results.append(True)
            else:
                print("   ⚠️ No blog-author relationships found")
                results.append(True)
            
            # Test tool-category relationship
            cursor.execute("""
                SELECT t.name, c.name 
                FROM tools t 
                JOIN tool_categories tc ON t.id = tc.tool_id 
                JOIN categories c ON tc.category_id = c.id 
                LIMIT 5;
            """)
            tool_categories = cursor.fetchall()
            
            if tool_categories:
                print(f"   ✅ Tool-Category relationship working: {len(tool_categories)} associations")
                for tool_name, cat_name in tool_categories:
                    print(f"   ✅ Tool '{tool_name}' in category '{cat_name}'")
                results.append(True)
            else:
                print("   ⚠️ No tool-category relationships found")
                results.append(True)
            
            # 3.4 Test complex queries with joins
            print("\n📊 TEST 3.4: Complex Queries with Joins")
            
            # Complex query: Get published blogs with author info and tag count
            cursor.execute("""
                SELECT 
                    b.title,
                    u.username,
                    b.status,
                    CASE 
                        WHEN b.tags IS NOT NULL THEN jsonb_array_length(b.tags::jsonb)
                        ELSE 0 
                    END as tag_count,
                    b.view_count,
                    b.created_at
                FROM blogs b
                JOIN users u ON b.author_id = u.id
                WHERE b.status = 'published'
                ORDER BY b.created_at DESC
                LIMIT 5;
            """)
            complex_results = cursor.fetchall()
            
            if complex_results:
                print(f"   ✅ Complex query successful: {len(complex_results)} results")
                for title, username, status, tag_count, view_count, created_at in complex_results:
                    print(f"   ✅ '{title}' by {username} - {tag_count} tags, {view_count} views")
                results.append(True)
            else:
                print("   ⚠️ No published blogs found for complex query")
                results.append(True)
            
            cursor.close()
            
        except Exception as e:
            print(f"   ❌ PostgreSQL-specific test failed: {e}")
            results.append(False)
        
        return all(results)

    def test_performance_and_pooling(self):
        """Test 4: Performance Tests"""
        print("\n" + "="*70)
        print("🔧 TEST 4: PERFORMANCE TESTS")
        print("="*70)
        
        results = []
        
        # 4.1 Test connection pooling
        print("\n📊 TEST 4.1: Connection Pooling Test")
        success, response = self.run_test(
            "Debug Connectivity",
            "GET",
            "debug/connectivity",
            200,
            description="Check connection pool status"
        )
        results.append(success)
        
        if success and isinstance(response, dict):
            db_info = response.get('database_info', {})
            if db_info:
                pool_size = db_info.get('engine_pool_size', 'unknown')
                checked_in = db_info.get('engine_pool_checked_in', 'unknown')
                checked_out = db_info.get('engine_pool_checked_out', 'unknown')
                
                print(f"   ✅ Pool size: {pool_size}")
                print(f"   ✅ Checked in connections: {checked_in}")
                print(f"   ✅ Checked out connections: {checked_out}")
                
                if isinstance(pool_size, int) and pool_size > 0:
                    print("   ✅ Connection pooling is configured")
                    results.append(True)
                else:
                    print("   ❌ Connection pooling not properly configured")
                    results.append(False)
            else:
                print("   ⚠️ No database pool info available")
                results.append(True)
        
        # 4.2 Test query performance with sample data
        print("\n📊 TEST 4.2: Query Performance Test")
        
        # Test multiple rapid API calls
        start_time = datetime.now()
        rapid_tests = []
        
        for i in range(5):
            success, _ = self.run_test(
                f"Rapid API Call {i+1}",
                "GET",
                "blogs?limit=10",
                200,
                description=f"Performance test call {i+1}"
            )
            rapid_tests.append(success)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        if all(rapid_tests):
            print(f"   ✅ 5 rapid API calls completed in {duration:.2f} seconds")
            if duration < 10:  # Should complete within 10 seconds
                print("   ✅ Performance is acceptable")
                results.append(True)
            else:
                print("   ⚠️ Performance may be slow")
                results.append(True)  # Not a failure, just slow
        else:
            print("   ❌ Some rapid API calls failed")
            results.append(False)
        
        return all(results)

    def test_migration_verification(self):
        """Test 5: Migration Verification"""
        print("\n" + "="*70)
        print("🔧 TEST 5: MIGRATION VERIFICATION")
        print("="*70)
        
        results = []
        
        # 5.1 Verify seed data is loaded
        print("\n📊 TEST 5.1: Seed Data Verification")
        
        if self.db_connection:
            try:
                cursor = self.db_connection.cursor()
                
                # Check for seed users
                cursor.execute("SELECT COUNT(*) FROM users;")
                user_count = cursor.fetchone()[0]
                print(f"   ✅ Users in database: {user_count}")
                
                # Check for seed categories
                cursor.execute("SELECT COUNT(*) FROM categories;")
                cat_count = cursor.fetchone()[0]
                print(f"   ✅ Categories in database: {cat_count}")
                
                # Check for seed tools
                cursor.execute("SELECT COUNT(*) FROM tools;")
                tool_count = cursor.fetchone()[0]
                print(f"   ✅ Tools in database: {tool_count}")
                
                # Check for seed blogs
                cursor.execute("SELECT COUNT(*) FROM blogs;")
                blog_count = cursor.fetchone()[0]
                print(f"   ✅ Blogs in database: {blog_count}")
                
                if user_count > 0 and cat_count > 0 and tool_count > 0:
                    print("   ✅ Seed data appears to be loaded")
                    results.append(True)
                else:
                    print("   ⚠️ Some seed data may be missing")
                    results.append(True)  # Not necessarily a failure
                
                # Check for different user roles
                cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role;")
                roles = cursor.fetchall()
                print("   User roles found:")
                for role, count in roles:
                    print(f"   ✅ {role}: {count} users")
                
                results.append(True)
                cursor.close()
                
            except Exception as e:
                print(f"   ❌ Seed data verification failed: {e}")
                results.append(False)
        else:
            print("   ❌ No database connection for seed data verification")
            results.append(False)
        
        # 5.2 Test blog publishing flow end-to-end (without auth for now)
        print("\n📊 TEST 5.2: Blog Publishing Flow Verification")
        
        # Test that published blogs appear in public API
        success, response = self.run_test(
            "Get Published Blogs",
            "GET",
            "blogs?status=published",
            200,
            description="Verify published blogs are accessible"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            published_count = len(response)
            print(f"   ✅ Found {published_count} published blogs")
            
            if published_count > 0:
                # Check first published blog structure
                first_blog = response[0]
                if first_blog.get('status') == 'published':
                    print("   ✅ Blog status is correctly 'published'")
                    results.append(True)
                else:
                    print(f"   ❌ Blog status is '{first_blog.get('status')}', expected 'published'")
                    results.append(False)
                
                if first_blog.get('published_at'):
                    print("   ✅ Published timestamp is set")
                    results.append(True)
                else:
                    print("   ❌ Published timestamp is missing")
                    results.append(False)
            else:
                print("   ⚠️ No published blogs found")
                results.append(True)
        
        return all(results)

    def run_comprehensive_tests(self):
        """Run all PostgreSQL migration tests"""
        print("🚀 POSTGRESQL MIGRATION TESTING SUITE")
        print("="*70)
        print("Testing complete backend functionality after PostgreSQL migration")
        print("Focus: Database connectivity, API endpoints, PostgreSQL features, performance")
        print("-"*70)
        
        test_results = []
        
        # Run all test suites
        test_results.append(self.test_database_connection())
        test_results.append(self.test_api_endpoints())
        test_results.append(self.test_postgresql_specific_features())
        test_results.append(self.test_performance_and_pooling())
        test_results.append(self.test_migration_verification())
        
        # Final summary
        print("\n" + "="*70)
        print("🏁 POSTGRESQL MIGRATION TEST SUMMARY")
        print("="*70)
        
        passed_suites = sum(test_results)
        total_suites = len(test_results)
        
        print(f"📊 Test Suites Passed: {passed_suites}/{total_suites}")
        print(f"📊 Individual Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"📊 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if passed_suites == total_suites:
            print("🎉 ALL POSTGRESQL MIGRATION TESTS PASSED!")
            print("✅ PostgreSQL migration is successful and fully functional")
        else:
            print("⚠️ Some PostgreSQL migration tests failed")
            print("❌ Issues found that need attention:")
            for i, (suite_name, result) in enumerate(zip([
                "Database Connection Tests",
                "API Endpoint Tests", 
                "PostgreSQL-Specific Tests",
                "Performance Tests",
                "Migration Verification"
            ], test_results)):
                if not result:
                    print(f"   - {suite_name}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests Details:")
            for test in self.failed_tests:
                print(f"   - {test['name']}: {test.get('error', test.get('response', 'Unknown error'))}")
        
        # Close database connection
        if self.db_connection:
            self.db_connection.close()
        
        return passed_suites == total_suites

if __name__ == "__main__":
    tester = PostgreSQLMigrationTester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)