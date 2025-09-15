#!/usr/bin/env python3
"""
Comprehensive SuperAdmin Functionality Testing Script for Production
Tests all superadmin features after PostgreSQL migration
"""

import requests
import json
import time
import sys
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SuperAdminProductionTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.superadmin_credentials = {
            "email": "superadmin@marketmind.com",
            "password": "admin123"
        }
        
    def login_superadmin(self):
        """Login as superadmin and get authentication token"""
        logger.info("🔐 Attempting superadmin login...")
        
        login_data = {
            "email": self.superadmin_credentials["email"],
            "password": self.superadmin_credentials["password"]
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                self.auth_token = result.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                logger.info("✅ Superadmin login successful")
                return True
            else:
                logger.error(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False

    def test_health_check(self):
        """Test backend health check"""
        logger.info("🏥 Testing backend health check...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            if response.status_code == 200:
                health = response.json()
                logger.info(f"✅ Backend healthy - Status: {health.get('status')}")
                logger.info(f"   Database: {health.get('database')}")
                logger.info(f"   Version: {health.get('version')}")
                return True
            else:
                logger.error(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
            return False

    def test_database_info(self):
        """Test database connectivity and get info"""
        logger.info("🗄️ Testing database connectivity...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/debug/connectivity")
            if response.status_code == 200:
                debug_info = response.json()
                logger.info(f"✅ Database connectivity test passed")
                logger.info(f"   Database test: {debug_info.get('database_test')}")
                if 'database_info' in debug_info:
                    db_info = debug_info['database_info']
                    logger.info(f"   User count: {db_info.get('user_count')}")
                return True
            else:
                logger.error(f"❌ Database connectivity test failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Database connectivity error: {e}")
            return False

    def test_superadmin_users(self):
        """Test superadmin users management"""
        logger.info("👥 Testing superadmin users management...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/superadmin/users")
            if response.status_code == 200:
                users = response.json()
                total_users = len(users)
                
                # Count users by role
                role_counts = {}
                for user in users:
                    role = user.get('role', 'user')
                    role_counts[role] = role_counts.get(role, 0) + 1
                
                logger.info(f"✅ Users management working - Total users: {total_users}")
                for role, count in role_counts.items():
                    logger.info(f"   {role}: {count}")
                return True
            else:
                logger.error(f"❌ Users management failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Users management error: {e}")
            return False

    def test_superadmin_tools(self):
        """Test superadmin tools management"""
        logger.info("🛠️ Testing superadmin tools management...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/superadmin/tools")
            if response.status_code == 200:
                tools = response.json()
                total_tools = len(tools)
                
                # Count active/inactive and featured tools
                active_tools = sum(1 for tool in tools if tool.get('is_active', True))
                featured_tools = sum(1 for tool in tools if tool.get('is_featured', False))
                
                logger.info(f"✅ Tools management working - Total tools: {total_tools}")
                logger.info(f"   Active: {active_tools}, Featured: {featured_tools}")
                return True
            else:
                logger.error(f"❌ Tools management failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Tools management error: {e}")
            return False

    def test_superadmin_categories(self):
        """Test superadmin categories management"""
        logger.info("📂 Testing superadmin categories management...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/superadmin/categories")
            if response.status_code == 200:
                categories = response.json()
                total_categories = len(categories)
                
                # Count categories with SEO data
                seo_categories = sum(1 for cat in categories if cat.get('seo_title'))
                
                logger.info(f"✅ Categories management working - Total categories: {total_categories}")
                logger.info(f"   With SEO data: {seo_categories}")
                return True
            else:
                logger.error(f"❌ Categories management failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Categories management error: {e}")
            return False

    def test_seo_overview(self):
        """Test SEO overview functionality"""
        logger.info("🔍 Testing SEO overview...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/superadmin/seo/overview")
            if response.status_code == 200:
                seo_data = response.json()
                logger.info(f"✅ SEO overview working")
                logger.info(f"   SEO health score: {seo_data.get('seo_health_score', 0)}%")
                logger.info(f"   Total pages: {seo_data.get('total_pages', 0)}")
                logger.info(f"   SEO optimized: {seo_data.get('seo_optimized_pages', 0)}")
                return True
            else:
                logger.error(f"❌ SEO overview failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ SEO overview error: {e}")
            return False

    def test_seo_issues(self):
        """Test SEO issues analysis"""
        logger.info("⚠️ Testing SEO issues analysis...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/superadmin/seo/issues")
            if response.status_code == 200:
                issues_data = response.json()
                total_issues = issues_data.get('total_issues', 0)
                
                # Count by severity
                severity_counts = {}
                for issue in issues_data.get('issues', []):
                    severity = issue.get('severity', 'unknown')
                    severity_counts[severity] = severity_counts.get(severity, 0) + 1
                
                logger.info(f"✅ SEO issues analysis working - Total issues: {total_issues}")
                for severity, count in severity_counts.items():
                    logger.info(f"   {severity}: {count}")
                return True
            else:
                logger.error(f"❌ SEO issues analysis failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ SEO issues analysis error: {e}")
            return False

    def test_seo_template_generation(self):
        """Test SEO template generation"""
        logger.info("📝 Testing SEO template generation...")
        
        try:
            # Test tools template generation
            response = self.session.post(
                f"{self.base_url}/api/superadmin/seo/generate-templates",
                json={"page_type": "tools", "count": 2}
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ SEO template generation working")
                logger.info(f"   Generated for: {result.get('generated_count', 0)} items")
                logger.info(f"   Page type: {result.get('page_type', 'unknown')}")
                return True
            else:
                logger.error(f"❌ SEO template generation failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ SEO template generation error: {e}")
            return False

    def test_tools_api(self):
        """Test public tools API"""
        logger.info("🔧 Testing public tools API...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/tools")
            if response.status_code == 200:
                tools = response.json()
                logger.info(f"✅ Tools API working - Retrieved {len(tools)} tools")
                return True
            else:
                logger.error(f"❌ Tools API failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Tools API error: {e}")
            return False

    def test_blogs_api(self):
        """Test public blogs API"""
        logger.info("📝 Testing public blogs API...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/blogs")
            if response.status_code == 200:
                blogs_data = response.json()
                blogs = blogs_data.get('blogs', [])
                logger.info(f"✅ Blogs API working - Retrieved {len(blogs)} blogs")
                return True
            else:
                logger.error(f"❌ Blogs API failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Blogs API error: {e}")
            return False

    def test_seo_endpoints(self):
        """Test SEO endpoints (sitemap, robots.txt)"""
        logger.info("🕷️ Testing SEO endpoints...")
        
        results = {}
        
        # Test sitemap
        try:
            response = self.session.get(f"{self.base_url}/api/sitemap.xml")
            if response.status_code == 200:
                sitemap_content = response.text
                url_count = sitemap_content.count('<url>')
                logger.info(f"✅ Sitemap working - {url_count} URLs")
                results['sitemap'] = True
            else:
                logger.error(f"❌ Sitemap failed: {response.status_code}")
                results['sitemap'] = False
        except Exception as e:
            logger.error(f"❌ Sitemap error: {e}")
            results['sitemap'] = False

        # Test robots.txt
        try:
            response = self.session.get(f"{self.base_url}/api/robots.txt")
            if response.status_code == 200:
                robots_content = response.text
                logger.info(f"✅ Robots.txt working")
                results['robots'] = True
            else:
                logger.error(f"❌ Robots.txt failed: {response.status_code}")
                results['robots'] = False
        except Exception as e:
            logger.error(f"❌ Robots.txt error: {e}")
            results['robots'] = False

        return all(results.values())

    def run_all_tests(self):
        """Run all superadmin functionality tests"""
        logger.info("🚀 Starting comprehensive superadmin production testing...")
        logger.info("=" * 60)
        
        test_results = {}
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Database Connectivity", self.test_database_info),
            ("SuperAdmin Login", self.login_superadmin),
            ("Users Management", self.test_superadmin_users),
            ("Tools Management", self.test_superadmin_tools),
            ("Categories Management", self.test_superadmin_categories),
            ("SEO Overview", self.test_seo_overview),
            ("SEO Issues Analysis", self.test_seo_issues),
            ("SEO Template Generation", self.test_seo_template_generation),
            ("Public Tools API", self.test_tools_api),
            ("Public Blogs API", self.test_blogs_api),
            ("SEO Endpoints", self.test_seo_endpoints)
        ]
        
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Running test: {test_name}")
            try:
                result = test_func()
                test_results[test_name] = result
                if result:
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {e}")
                test_results[test_name] = False
            
            time.sleep(1)  # Small delay between tests

        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 TEST RESULTS SUMMARY")
        logger.info("=" * 60)
        
        passed_tests = sum(1 for result in test_results.values() if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        for test_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{test_name:<30} {status}")
        
        logger.info("-" * 60)
        logger.info(f"Tests Passed: {passed_tests}/{total_tests}")
        logger.info(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            logger.info("🎉 EXCELLENT! SuperAdmin functionality is production-ready!")
        elif success_rate >= 80:
            logger.info("✅ GOOD! Most superadmin features are working correctly.")
        elif success_rate >= 70:
            logger.info("⚠️ MODERATE. Some issues need attention before production.")
        else:
            logger.error("❌ CRITICAL. Major issues found. Not ready for production.")
        
        return success_rate >= 80

def main():
    """Main testing function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test SuperAdmin functionality in production')
    parser.add_argument('--url', default='http://localhost:8001', 
                       help='Backend URL (default: http://localhost:8001)')
    
    args = parser.parse_args()
    
    tester = SuperAdminProductionTester(args.url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()