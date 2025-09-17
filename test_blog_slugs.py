#!/usr/bin/env python3

import requests
import json
from datetime import datetime

class BlogSlugTester:
    def __init__(self, base_url="https://blog-posting-fix.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, description=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)

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

    def test_blog_retrieval_by_slug_specific_review(self):
        """Test blog retrieval by slug for specific slugs - REVIEW REQUEST"""
        print("\n🔍 BLOG RETRIEVAL BY SLUG SPECIFIC REVIEW - REVIEW REQUEST")
        print("=" * 70)
        print("Testing specific blog slugs for consistency and response structure:")
        print("1. medium-style-blog-test-125914 (known working)")
        print("2. test-blog-publishing-flow-072008")
        print("3. updated-test-blog-for-like-count-095851")
        print("4. top-10-productivity-tools-for-remote-teams-in-2024")
        print("-" * 70)
        
        results = []
        
        # Test specific blog slugs from review request
        test_slugs = [
            'medium-style-blog-test-125914',
            'test-blog-publishing-flow-072008', 
            'updated-test-blog-for-like-count-095851',
            'top-10-productivity-tools-for-remote-teams-in-2024'
        ]
        
        successful_retrievals = []
        failed_retrievals = []
        response_structures = []
        
        print("\n📝 TESTING SPECIFIC BLOG SLUGS")
        
        for i, slug in enumerate(test_slugs, 1):
            print(f"\n   {i}. Testing slug: {slug}")
            
            success, blog_response = self.run_test(
                f"Get Blog by Slug: {slug}",
                "GET",
                f"blogs/by-slug/{slug}",
                200,
                description=f"Test blog retrieval for slug: {slug}"
            )
            
            if success and isinstance(blog_response, dict):
                successful_retrievals.append({
                    'slug': slug,
                    'title': blog_response.get('title', 'N/A'),
                    'status': blog_response.get('status', 'N/A'),
                    'view_count': blog_response.get('view_count', 0),
                    'response': blog_response
                })
                
                # Analyze response structure
                structure = {
                    'slug': slug,
                    'fields_present': list(blog_response.keys()),
                    'field_count': len(blog_response.keys()),
                    'required_fields': {},
                    'seo_fields': {},
                    'json_ld_present': bool(blog_response.get('json_ld'))
                }
                
                # Check required fields
                required_fields = ['id', 'title', 'content', 'excerpt', 'status', 'published_at', 'slug']
                for field in required_fields:
                    structure['required_fields'][field] = {
                        'present': field in blog_response,
                        'has_value': bool(blog_response.get(field)),
                        'type': type(blog_response.get(field)).__name__ if blog_response.get(field) else 'None'
                    }
                
                # Check SEO fields
                seo_fields = ['seo_title', 'seo_description', 'seo_keywords']
                for field in seo_fields:
                    structure['seo_fields'][field] = {
                        'present': field in blog_response,
                        'has_value': bool(blog_response.get(field)),
                        'length': len(str(blog_response.get(field, ''))) if blog_response.get(field) else 0
                    }
                
                response_structures.append(structure)
                
                print(f"      ✅ Successfully retrieved")
                print(f"      Title: {blog_response.get('title', 'N/A')}")
                print(f"      Status: {blog_response.get('status', 'N/A')}")
                print(f"      View Count: {blog_response.get('view_count', 0)}")
                print(f"      Fields Count: {len(blog_response.keys())}")
                
                # Check required fields
                missing_required = [f for f in required_fields if not blog_response.get(f)]
                if missing_required:
                    print(f"      ⚠️ Missing required fields: {missing_required}")
                else:
                    print(f"      ✅ All required fields present")
                
                # Check SEO fields
                seo_present = sum(1 for field in seo_fields if blog_response.get(field))
                print(f"      SEO fields: {seo_present}/{len(seo_fields)} present")
                
                # Check JSON-LD
                json_ld = blog_response.get('json_ld')
                if json_ld and isinstance(json_ld, dict) and json_ld:
                    print(f"      ✅ JSON-LD structured data present ({len(json_ld)} keys)")
                else:
                    print(f"      ⚠️ JSON-LD structured data missing or empty")
                
                results.append(True)
            else:
                failed_retrievals.append(slug)
                print(f"      ❌ Failed to retrieve blog (Status: {success})")
                results.append(False)
        
        # Analyze response structure consistency
        print("\n📊 RESPONSE STRUCTURE CONSISTENCY ANALYSIS")
        if len(response_structures) > 1:
            # Compare field counts
            field_counts = [s['field_count'] for s in response_structures]
            min_fields = min(field_counts)
            max_fields = max(field_counts)
            
            print(f"   Field count range: {min_fields} - {max_fields}")
            
            if min_fields == max_fields:
                print(f"   ✅ All responses have consistent field count ({min_fields})")
                results.append(True)
            else:
                print(f"   ⚠️ Inconsistent field counts detected")
                for s in response_structures:
                    print(f"      {s['slug']}: {s['field_count']} fields")
                results.append(False)
            
            # Compare required fields consistency
            print(f"\n   Required Fields Consistency:")
            required_fields = ['id', 'title', 'content', 'excerpt', 'status', 'published_at', 'slug']
            
            for field in required_fields:
                present_count = sum(1 for s in response_structures if s['required_fields'][field]['present'])
                has_value_count = sum(1 for s in response_structures if s['required_fields'][field]['has_value'])
                
                if present_count == len(response_structures):
                    print(f"      ✅ {field}: Present in all responses")
                else:
                    print(f"      ❌ {field}: Present in {present_count}/{len(response_structures)} responses")
                
                if has_value_count == len(response_structures):
                    print(f"         ✅ Has value in all responses")
                else:
                    print(f"         ⚠️ Has value in {has_value_count}/{len(response_structures)} responses")
            
            # Compare SEO fields consistency
            print(f"\n   SEO Fields Consistency:")
            seo_fields = ['seo_title', 'seo_description', 'seo_keywords']
            
            for field in seo_fields:
                present_count = sum(1 for s in response_structures if s['seo_fields'][field]['present'])
                has_value_count = sum(1 for s in response_structures if s['seo_fields'][field]['has_value'])
                
                if present_count == len(response_structures):
                    print(f"      ✅ {field}: Present in all responses")
                else:
                    print(f"      ❌ {field}: Present in {present_count}/{len(response_structures)} responses")
                
                if has_value_count == len(response_structures):
                    print(f"         ✅ Has value in all responses")
                else:
                    print(f"         ⚠️ Has value in {has_value_count}/{len(response_structures)} responses")
            
            # JSON-LD consistency
            json_ld_count = sum(1 for s in response_structures if s['json_ld_present'])
            print(f"\n   JSON-LD Structured Data:")
            print(f"      Present in {json_ld_count}/{len(response_structures)} responses")
            
            if json_ld_count == len(response_structures):
                print(f"      ✅ All responses have JSON-LD data")
                results.append(True)
            elif json_ld_count == 0:
                print(f"      ⚠️ No responses have JSON-LD data")
                results.append(True)  # Consistent, even if empty
            else:
                print(f"      ❌ Inconsistent JSON-LD presence")
                results.append(False)
        
        # Test 404 handling for non-existent slug
        print("\n📝 TESTING 404 ERROR HANDLING")
        non_existent_slug = "non-existent-blog-slug-12345"
        
        success, error_response = self.run_test(
            "Test Non-existent Slug",
            "GET",
            f"blogs/by-slug/{non_existent_slug}",
            404,
            description="Test 404 error handling for non-existent slug"
        )
        results.append(success)
        
        if success:
            print(f"   ✅ 404 error handling working correctly")
        else:
            print(f"   ❌ 404 error handling failed")
        
        # Overall summary
        passed_tests = sum(results)
        total_tests = len(results)
        
        print(f"\n📊 BLOG RETRIEVAL BY SLUG SPECIFIC REVIEW SUMMARY:")
        print(f"   Tests Passed: {passed_tests}/{total_tests}")
        print(f"   Success Rate: {(passed_tests/total_tests*100):.1f}%")
        print(f"   Successful retrievals: {len(successful_retrievals)}/{len(test_slugs)}")
        print(f"   Failed retrievals: {len(failed_retrievals)}")
        
        if successful_retrievals:
            print(f"\n   ✅ Successfully retrieved blogs:")
            for blog in successful_retrievals:
                print(f"      - {blog['slug']}")
                print(f"        Title: {blog['title']}")
                print(f"        Status: {blog['status']}")
                print(f"        Views: {blog['view_count']}")
        
        if failed_retrievals:
            print(f"\n   ❌ Failed to retrieve blogs:")
            for slug in failed_retrievals:
                print(f"      - {slug}")
        
        # Identify potential frontend rendering issues
        print(f"\n🔍 POTENTIAL FRONTEND RENDERING ISSUES:")
        if len(response_structures) > 1:
            # Check for field inconsistencies that could cause frontend issues
            issues_found = []
            
            # Check if all responses have the same basic structure
            first_structure = response_structures[0]
            for i, structure in enumerate(response_structures[1:], 1):
                if structure['field_count'] != first_structure['field_count']:
                    issues_found.append(f"Field count mismatch: {structure['slug']} has {structure['field_count']} fields vs {first_structure['field_count']}")
                
                # Check for missing required fields
                for field in ['title', 'content', 'excerpt']:
                    if not structure['required_fields'][field]['has_value']:
                        issues_found.append(f"Missing {field} in {structure['slug']}")
            
            if issues_found:
                print(f"   ❌ Issues that could cause frontend rendering problems:")
                for issue in issues_found:
                    print(f"      - {issue}")
            else:
                print(f"   ✅ No obvious frontend rendering issues detected")
        
        if passed_tests == total_tests and len(successful_retrievals) == len(test_slugs):
            print(f"\n   🎉 ALL BLOG RETRIEVAL BY SLUG TESTS PASSED!")
            print(f"   🎉 ALL REQUESTED BLOG SLUGS WORKING CORRECTLY!")
        else:
            print(f"\n   ⚠️ Some blog retrieval by slug tests failed")
        
        return all(results)

if __name__ == "__main__":
    print("🚀 Starting Blog Slug Testing")
    print("=" * 60)
    
    tester = BlogSlugTester()
    success = tester.test_blog_retrieval_by_slug_specific_review()
    
    # Print final summary
    print(f"\n" + "="*80)
    print(f"🏁 TESTING COMPLETED")
    print(f"="*80)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(tester.failed_tests)}")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
            print(f"   - {test['name']}: {error_msg}")
    
    result_text = '✅ PASSED' if success else '❌ FAILED'
    print(f"\n🎯 OVERALL RESULT: {result_text}")