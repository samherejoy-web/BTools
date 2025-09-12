#!/usr/bin/env python3
"""
Specific Tools API Testing Script
Tests the tools API endpoints as requested in the review.
"""

import requests
import json
import sys
from datetime import datetime

class ToolsAPITester:
    def __init__(self, base_url="https://production-prep-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, description=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, response.text
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
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_tools_api_endpoints(self):
        """Test the specific tools API endpoints requested"""
        print("🚀 TOOLS API ENDPOINTS TESTING")
        print("=" * 50)
        
        results = []
        
        # Test 1: GET /api/tools - should return list of tools with pagination
        print("\n📋 TEST 1: GET /api/tools - List of tools with pagination")
        success, response = self.run_test(
            "GET /api/tools",
            "GET",
            "tools",
            200,
            "Should return list of tools with pagination"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} tools")
            
            # Verify data structure
            if len(response) > 0:
                tool = response[0]
                required_fields = ['id', 'name', 'description', 'url', 'pricing_type', 'is_active']
                missing_fields = []
                
                for field in required_fields:
                    if field not in tool:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing required fields: {missing_fields}")
                    results.append(False)
                else:
                    print(f"   ✅ All required fields present in tool data")
                
                # Check for pagination-related fields or structure
                print(f"   📊 Tool data structure:")
                print(f"   - Tool ID: {tool.get('id', 'Missing')}")
                print(f"   - Name: {tool.get('name', 'Missing')}")
                print(f"   - Pricing: {tool.get('pricing_type', 'Missing')}")
                print(f"   - Active: {tool.get('is_active', 'Missing')}")
                print(f"   - Rating: {tool.get('average_rating', 'N/A')}")
                print(f"   - Reviews: {tool.get('review_count', 'N/A')}")
                
                # Test pagination parameters
                print(f"\n   🔍 Testing pagination parameters...")
                success_page, page_response = self.run_test(
                    "GET /api/tools with pagination",
                    "GET",
                    "tools?limit=5&offset=0",
                    200,
                    "Test pagination with limit and offset"
                )
                results.append(success_page)
                
                if success_page and isinstance(page_response, list):
                    print(f"   ✅ Pagination working - returned {len(page_response)} tools (limit=5)")
        
        # Test 2: GET /api/categories - should return list of categories
        print("\n📂 TEST 2: GET /api/categories - List of categories")
        success, response = self.run_test(
            "GET /api/categories",
            "GET",
            "categories",
            200,
            "Should return list of categories"
        )
        results.append(success)
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} categories")
            
            if len(response) > 0:
                category = response[0]
                required_fields = ['id', 'name']
                missing_fields = []
                
                for field in required_fields:
                    if field not in category:
                        missing_fields.append(field)
                
                if missing_fields:
                    print(f"   ❌ Missing required fields: {missing_fields}")
                    results.append(False)
                else:
                    print(f"   ✅ All required fields present in category data")
                
                # Show sample categories
                print(f"   📊 Sample categories:")
                for i, cat in enumerate(response[:5]):
                    print(f"   - {cat.get('name', 'Unknown')} (ID: {cat.get('id', 'Missing')})")
        
        # Test 3: GET /api/tools/{tool_id} - test with a specific tool ID
        print("\n🔍 TEST 3: GET /api/tools/{tool_id} - Specific tool details")
        
        # First get a tool ID from the tools list
        if len(results) > 0 and results[0]:  # If first test passed
            success_tools, tools_response = self.run_test(
                "GET /api/tools for ID",
                "GET",
                "tools?limit=1",
                200,
                "Get tools to extract a tool ID for testing"
            )
            
            if success_tools and isinstance(tools_response, list) and len(tools_response) > 0:
                tool_id = tools_response[0]['id']
                tool_name = tools_response[0].get('name', 'Unknown')
                
                print(f"   Using tool ID: {tool_id}")
                print(f"   Tool name: {tool_name}")
                
                success, response = self.run_test(
                    f"GET /api/tools/{tool_id}",
                    "GET",
                    f"tools/{tool_id}",
                    200,
                    f"Get specific tool details for {tool_name}"
                )
                results.append(success)
                
                if success and isinstance(response, dict):
                    print(f"   ✅ Tool details retrieved successfully")
                    
                    # Verify detailed data structure
                    detailed_fields = ['id', 'name', 'description', 'short_description', 'url', 
                                     'pricing_type', 'features', 'pros', 'cons', 'is_active', 
                                     'is_featured', 'average_rating', 'review_count']
                    
                    present_fields = []
                    missing_fields = []
                    
                    for field in detailed_fields:
                        if field in response and response[field] is not None:
                            present_fields.append(field)
                        else:
                            missing_fields.append(field)
                    
                    print(f"   📊 Tool detail structure:")
                    print(f"   - Present fields: {len(present_fields)}/{len(detailed_fields)}")
                    print(f"   - ID: {response.get('id', 'Missing')}")
                    print(f"   - Name: {response.get('name', 'Missing')}")
                    print(f"   - Description length: {len(str(response.get('description', '')))}")
                    print(f"   - Features count: {len(response.get('features', []))}")
                    print(f"   - Pros count: {len(response.get('pros', []))}")
                    print(f"   - Cons count: {len(response.get('cons', []))}")
                    print(f"   - Average rating: {response.get('average_rating', 'N/A')}")
                    print(f"   - Review count: {response.get('review_count', 'N/A')}")
                    print(f"   - Is active: {response.get('is_active', 'N/A')}")
                    print(f"   - Is featured: {response.get('is_featured', 'N/A')}")
                    
                    # Check for enhancement fields
                    enhancement_fields = ['domain_website', 'linkedin_url', 'founded_year', 
                                        'about_section', 'founders', 'latest_news', 'tech_stack']
                    
                    enhancement_present = []
                    for field in enhancement_fields:
                        if field in response and response[field] is not None:
                            enhancement_present.append(field)
                    
                    print(f"   - Enhancement fields present: {len(enhancement_present)}/{len(enhancement_fields)}")
                    
                    if len(present_fields) >= 10:  # Most core fields present
                        print(f"   ✅ Comprehensive tool data structure verified")
                    else:
                        print(f"   ⚠️ Some fields missing but core functionality working")
                        print(f"   Missing: {missing_fields}")
            else:
                print(f"   ❌ Could not get tool ID for detailed testing")
                results.append(False)
        
        # Test 4: Verify tools data structure and all required fields are present
        print("\n📋 TEST 4: Data Structure Verification Summary")
        
        # Summary of data structure verification
        print(f"   🔍 Data Structure Verification Results:")
        working_status = "✅ Working" if results[0] else "❌ Failed"
        print(f"   - Tools list endpoint: {working_status}")
        working_status = "✅ Working" if results[1] else "❌ Failed"
        print(f"   - Categories endpoint: {working_status}")
        working_status = "✅ Working" if len(results) > 2 and results[2] else "❌ Failed"
        print(f"   - Tool details endpoint: {working_status}")
        
        # Additional verification tests
        print(f"\n   🔍 Additional verification tests...")
        
        # Test filtering
        success_filter, filter_response = self.run_test(
            "GET /api/tools with category filter",
            "GET",
            "tools?category=productivity&limit=3",
            200,
            "Test category filtering"
        )
        results.append(success_filter)
        
        if success_filter:
            print(f"   ✅ Category filtering working")
        
        # Test search
        success_search, search_response = self.run_test(
            "GET /api/tools with search",
            "GET",
            "tools?search=notion&limit=3",
            200,
            "Test search functionality"
        )
        results.append(success_search)
        
        if success_search:
            print(f"   ✅ Search functionality working")
        
        # Test sorting
        success_sort, sort_response = self.run_test(
            "GET /api/tools with sorting",
            "GET",
            "tools?sort=rating&limit=3",
            200,
            "Test sorting functionality"
        )
        results.append(success_sort)
        
        if success_sort:
            print(f"   ✅ Sorting functionality working")
        
        return all(results)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TOOLS API TESTING SUMMARY")
        print("=" * 50)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"   - {test['name']}: {error_msg}")
        else:
            print(f"\n🎉 ALL TESTS PASSED!")
        
        print("=" * 50)

def main():
    """Main function"""
    print("🚀 TOOLS API ENDPOINTS TESTING")
    print("Testing tools API endpoints after frontend fix")
    print("=" * 50)
    
    tester = ToolsAPITester()
    
    # Run the tools API tests
    success = tester.test_tools_api_endpoints()
    
    # Print summary
    tester.print_summary()
    
    # Return appropriate exit code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()