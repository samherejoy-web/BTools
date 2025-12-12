import requests
import sys
import json
import os
from datetime import datetime

class LogoManagementTester:
    def __init__(self, base_url="https://seo-semantic-sync.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []
        self.superadmin_credentials = {
            "email": "superadmin@marketmind.com",
            "password": "admin123"
        }

    def log_result(self, test_name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED - {message}")
        else:
            self.errors.append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED - {message}")
            if response_data:
                print(f"   Response: {response_data}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if files:
                # Remove Content-Type for file uploads
                headers.pop('Content-Type', None)
                
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text[:200]}

            if success:
                self.log_result(name, True, f"Status: {response.status_code}")
                return True, response_data
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}", response_data)
                return False, response_data

        except Exception as e:
            self.log_result(name, False, f"Error: {str(e)}")
            return False, {}

    def test_superadmin_login(self):
        """Test SuperAdmin login"""
        success, response = self.run_test(
            "SuperAdmin Login",
            "POST",
            "auth/login",
            200,
            data=self.superadmin_credentials
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_site_settings(self):
        """Test getting site settings"""
        success, response = self.run_test(
            "Get Site Settings",
            "GET",
            "superadmin/settings",
            200
        )
        return success, response

    def test_public_site_settings(self):
        """Test public site settings endpoint"""
        success, response = self.run_test(
            "Get Public Site Settings",
            "GET",
            "public/site-settings",
            200
        )
        return success, response

    def test_logo_upload_validation(self):
        """Test logo upload with invalid file"""
        # Test with invalid file type
        test_file_content = b"This is not an image"
        files = {'file': ('test.txt', test_file_content, 'text/plain')}
        data = {'alt_text': 'Test Logo'}
        
        success, response = self.run_test(
            "Logo Upload - Invalid File Type",
            "POST",
            "superadmin/settings/upload-logo",
            400,
            data=data,
            files=files
        )
        return success

    def test_logo_upload_size_validation(self):
        """Test logo upload with oversized file"""
        # Create a large fake image file (over 2MB)
        large_content = b"fake_image_data" * 200000  # ~3MB
        files = {'file': ('large_image.png', large_content, 'image/png')}
        data = {'alt_text': 'Large Logo'}
        
        success, response = self.run_test(
            "Logo Upload - Size Validation",
            "POST",
            "superadmin/settings/upload-logo",
            400,
            data=data,
            files=files
        )
        return success

    def test_logo_url_setting(self):
        """Test setting logo via URL"""
        test_logo_url = "https://example.com/test-logo.png"
        success, response = self.run_test(
            "Set Logo URL",
            "PUT",
            "superadmin/settings/site_logo_url",
            200,
            data={
                "value": test_logo_url,
                "description": "Test logo URL"
            }
        )
        return success

    def test_logo_alt_text_setting(self):
        """Test setting logo alt text"""
        test_alt_text = "Test MarketMind Logo"
        success, response = self.run_test(
            "Set Logo Alt Text",
            "PUT",
            "superadmin/settings/site_logo_alt_text",
            200,
            data={
                "value": test_alt_text,
                "description": "Alt text for site logo (SEO and accessibility)"
            }
        )
        return success

    def test_delete_logo(self):
        """Test logo deletion"""
        success, response = self.run_test(
            "Delete Logo",
            "DELETE",
            "superadmin/settings/delete-logo",
            200
        )
        return success

    def test_social_urls_initialization(self):
        """Test social URLs initialization"""
        success, response = self.run_test(
            "Initialize Social URLs",
            "POST",
            "superadmin/settings/initialize-social-urls",
            200
        )
        return success

    def test_social_url_update(self):
        """Test updating social media URLs"""
        test_twitter_url = "https://twitter.com/testmarketmind"
        success, response = self.run_test(
            "Update Twitter URL",
            "PUT",
            "superadmin/settings/social_twitter_url",
            200,
            data={
                "value": test_twitter_url,
                "description": "X (Twitter) profile URL"
            }
        )
        return success

    def test_create_small_valid_image(self):
        """Test logo upload with a small valid image"""
        # Create a minimal PNG file (1x1 pixel)
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test_logo.png', png_data, 'image/png')}
        data = {'alt_text': 'Test Logo Upload'}
        
        success, response = self.run_test(
            "Logo Upload - Valid Small PNG",
            "POST",
            "superadmin/settings/upload-logo",
            200,
            data=data,
            files=files
        )
        return success, response

def main():
    print("🚀 Starting Logo Management Backend Tests")
    print("=" * 60)
    
    tester = LogoManagementTester()
    
    # Test SuperAdmin authentication
    if not tester.test_superadmin_login():
        print("\n❌ SuperAdmin login failed. Cannot proceed with protected endpoints.")
        print("Please ensure SuperAdmin user exists with credentials:")
        print(f"Email: {tester.superadmin_credentials['email']}")
        print(f"Password: {tester.superadmin_credentials['password']}")
        return 1

    print(f"\n📊 Testing Logo Management APIs...")
    print("-" * 40)

    # Test site settings endpoints
    tester.test_get_site_settings()
    tester.test_public_site_settings()
    
    # Test logo management functionality
    tester.test_logo_url_setting()
    tester.test_logo_alt_text_setting()
    
    # Test logo upload validations
    tester.test_logo_upload_validation()
    tester.test_logo_upload_size_validation()
    
    # Test valid logo upload
    tester.test_create_small_valid_image()
    
    # Test logo deletion
    tester.test_delete_logo()
    
    # Test social media settings
    tester.test_social_urls_initialization()
    tester.test_social_url_update()

    # Print final results
    print("\n" + "=" * 60)
    print("📊 FINAL TEST RESULTS")
    print("=" * 60)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {len(tester.errors)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.errors:
        print(f"\n❌ Failed Tests:")
        for error in tester.errors:
            print(f"   • {error}")
    
    return 0 if len(tester.errors) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())