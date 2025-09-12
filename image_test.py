#!/usr/bin/env python3
"""
Focused Image Upload and Serving Test Script
Tests the specific image upload and serving functionality as requested.
"""

import requests
import sys
import json
import uuid
import io
from datetime import datetime

try:
    from PIL import Image
except ImportError:
    Image = None

class ImageUploadTester:
    def __init__(self, base_url="https://production-prep-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.uploaded_images = []

    def login_test_user(self):
        """Login with a test user to get authentication token"""
        print("🔐 Logging in to get authentication token...")
        
        # Try to login with existing test user
        login_data = {"email": "user1@example.com", "password": "password123"}
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                if 'access_token' in response_data:
                    self.token = response_data['access_token']
                    print(f"✅ Login successful")
                    return True
                else:
                    print(f"❌ Login response missing access_token: {response_data}")
                    return False
            else:
                print(f"❌ Login failed with status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False

    def create_test_image(self, format='PNG', size=(100, 100), color='red'):
        """Create a test image in memory"""
        if Image is None:
            # Fallback: create a simple text file
            content = f"Test image content - {datetime.now().isoformat()}"
            return io.BytesIO(content.encode()), 'test_image.txt', 'text/plain'
        
        # Create actual image
        img = Image.new('RGB', size, color=color)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format=format)
        img_bytes.seek(0)
        
        filename = f'test_image_{uuid.uuid4().hex[:8]}.{format.lower()}'
        content_type = f'image/{format.lower()}'
        
        return img_bytes, filename, content_type

    def test_image_upload(self):
        """Test POST /api/blogs/upload-image"""
        print("\n🔍 Testing Image Upload (POST /api/blogs/upload-image)")
        print("-" * 60)
        
        if not self.token:
            print("❌ No authentication token - skipping test")
            return False, None
        
        # Create test image
        img_bytes, filename, content_type = self.create_test_image()
        
        try:
            url = f"{self.base_url}/blogs/upload-image"
            headers = {'Authorization': f'Bearer {self.token}'}
            files = {'file': (filename, img_bytes, content_type)}
            
            print(f"   URL: {url}")
            print(f"   File: {filename} ({content_type})")
            
            response = requests.post(url, files=files, headers=headers, timeout=30)
            
            self.tests_run += 1
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"✅ Upload successful - Status: {response.status_code}")
                
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    
                    # Check response structure
                    if 'image_url' in response_data:
                        image_url = response_data['image_url']
                        print(f"   Image URL: {image_url}")
                        
                        # Verify URL format
                        if image_url.startswith('/api/uploads/blog-images/'):
                            print(f"   ✅ URL format correct: starts with '/api/uploads/blog-images/'")
                            self.uploaded_images.append(image_url)
                            return True, image_url
                        else:
                            print(f"   ❌ URL format incorrect: expected '/api/uploads/blog-images/', got '{image_url}'")
                            return False, image_url
                    else:
                        print(f"   ❌ Response missing 'image_url' field")
                        return False, None
                        
                except json.JSONDecodeError:
                    print(f"   ❌ Invalid JSON response: {response.text[:200]}")
                    return False, None
                    
            else:
                print(f"❌ Upload failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    'name': 'Image Upload',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })
                return False, None
                
        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
            self.failed_tests.append({
                'name': 'Image Upload',
                'error': str(e)
            })
            self.tests_run += 1
            return False, None

    def test_image_serving(self, image_url):
        """Test GET /api/uploads/blog-images/{filename}"""
        print(f"\n🔍 Testing Image Serving (GET {image_url})")
        print("-" * 60)
        
        if not image_url:
            print("❌ No image URL to test - skipping")
            return False
        
        try:
            # Extract filename from URL
            filename = image_url.split('/')[-1]
            full_url = f"{self.base_url}/uploads/blog-images/{filename}"
            
            print(f"   URL: {full_url}")
            print(f"   Filename: {filename}")
            
            response = requests.get(full_url, timeout=30)
            
            self.tests_run += 1
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"✅ Image serving successful - Status: {response.status_code}")
                
                # Check Content-Type header
                content_type = response.headers.get('content-type', '')
                print(f"   Content-Type: {content_type}")
                
                if content_type.startswith('image/') or content_type == 'text/plain':
                    print(f"   ✅ Content-Type header is appropriate")
                else:
                    print(f"   ⚠️ Content-Type may not be optimal: {content_type}")
                
                # Check content length
                content_length = len(response.content)
                print(f"   Content-Length: {content_length} bytes")
                
                if content_length > 0:
                    print(f"   ✅ Image data received successfully")
                    return True
                else:
                    print(f"   ❌ No image data received")
                    return False
                    
            else:
                print(f"❌ Image serving failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    'name': 'Image Serving',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })
                return False
                
        except Exception as e:
            print(f"❌ Image serving error: {str(e)}")
            self.failed_tests.append({
                'name': 'Image Serving',
                'error': str(e)
            })
            self.tests_run += 1
            return False

    def test_image_display_frontend(self, image_url):
        """Test if images can be accessed through the frontend URL"""
        print(f"\n🔍 Testing Frontend Image Access")
        print("-" * 60)
        
        if not image_url:
            print("❌ No image URL to test - skipping")
            return False
        
        try:
            # Construct full frontend URL
            frontend_base = self.base_url.replace('/api', '')
            full_frontend_url = f"{frontend_base}{image_url}"
            
            print(f"   Frontend URL: {full_frontend_url}")
            
            response = requests.get(full_frontend_url, timeout=30)
            
            self.tests_run += 1
            
            if response.status_code == 200:
                self.tests_passed += 1
                print(f"✅ Frontend image access successful - Status: {response.status_code}")
                
                # Check headers for CORS
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
                    'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
                    'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers')
                }
                
                print(f"   CORS Headers:")
                for header, value in cors_headers.items():
                    if value:
                        print(f"     {header}: {value}")
                
                # Check content
                content_length = len(response.content)
                content_type = response.headers.get('content-type', '')
                print(f"   Content-Type: {content_type}")
                print(f"   Content-Length: {content_length} bytes")
                
                if content_length > 0:
                    print(f"   ✅ Image accessible from frontend")
                    return True
                else:
                    print(f"   ❌ No content received from frontend")
                    return False
                    
            else:
                print(f"❌ Frontend image access failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    'name': 'Frontend Image Access',
                    'expected': 200,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })
                return False
                
        except Exception as e:
            print(f"❌ Frontend image access error: {str(e)}")
            self.failed_tests.append({
                'name': 'Frontend Image Access',
                'error': str(e)
            })
            self.tests_run += 1
            return False

    def test_multiple_image_formats(self):
        """Test uploading different image formats"""
        print(f"\n🔍 Testing Multiple Image Formats")
        print("-" * 60)
        
        if not self.token:
            print("❌ No authentication token - skipping test")
            return False
        
        formats = ['PNG', 'JPEG']
        results = []
        
        for format_type in formats:
            print(f"\n   Testing {format_type} format...")
            
            # Create test image in specific format
            img_bytes, filename, content_type = self.create_test_image(format=format_type)
            
            try:
                url = f"{self.base_url}/blogs/upload-image"
                headers = {'Authorization': f'Bearer {self.token}'}
                files = {'file': (filename, img_bytes, content_type)}
                
                response = requests.post(url, files=files, headers=headers, timeout=30)
                
                self.tests_run += 1
                
                if response.status_code == 200:
                    self.tests_passed += 1
                    response_data = response.json()
                    image_url = response_data.get('image_url')
                    print(f"   ✅ {format_type} upload successful: {image_url}")
                    
                    if image_url:
                        self.uploaded_images.append(image_url)
                        results.append(True)
                    else:
                        results.append(False)
                else:
                    print(f"   ❌ {format_type} upload failed: {response.status_code}")
                    results.append(False)
                    
            except Exception as e:
                print(f"   ❌ {format_type} upload error: {str(e)}")
                results.append(False)
                self.tests_run += 1
        
        return all(results)

    def run_comprehensive_image_tests(self):
        """Run all image-related tests"""
        print("🚀 Starting Comprehensive Image Upload and Serving Tests")
        print("=" * 70)
        
        # Step 1: Login
        if not self.login_test_user():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Test basic image upload
        upload_success, image_url = self.test_image_upload()
        
        # Step 3: Test image serving (if upload succeeded)
        serving_success = False
        if upload_success and image_url:
            serving_success = self.test_image_serving(image_url)
        
        # Step 4: Test frontend access (if serving succeeded)
        frontend_success = False
        if serving_success and image_url:
            frontend_success = self.test_image_display_frontend(image_url)
        
        # Step 5: Test multiple formats
        formats_success = self.test_multiple_image_formats()
        
        # Print results
        print("\n" + "=" * 70)
        print("📊 IMAGE TESTING RESULTS SUMMARY")
        print("=" * 70)
        print(f"Total Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print(f"\n📋 SPECIFIC TEST RESULTS:")
        print(f"   Image Upload: {'✅ PASS' if upload_success else '❌ FAIL'}")
        print(f"   Image Serving: {'✅ PASS' if serving_success else '❌ FAIL'}")
        print(f"   Frontend Access: {'✅ PASS' if frontend_success else '❌ FAIL'}")
        print(f"   Multiple Formats: {'✅ PASS' if formats_success else '❌ FAIL'}")
        
        if self.uploaded_images:
            print(f"\n📁 Uploaded Images ({len(self.uploaded_images)}):")
            for img_url in self.uploaded_images:
                print(f"   - {img_url}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests Details:")
            for test in self.failed_tests:
                print(f"   - {test['name']}")
                if 'expected' in test:
                    print(f"     Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"     Error: {test['error']}")
                if 'response' in test:
                    print(f"     Response: {test['response']}")
        
        # Overall success criteria
        critical_tests_passed = upload_success and serving_success
        
        if critical_tests_passed:
            print(f"\n🎉 CRITICAL IMAGE FUNCTIONALITY WORKING!")
            print(f"   ✅ Images can be uploaded via POST /api/blogs/upload-image")
            print(f"   ✅ Images can be served via GET /api/uploads/blog-images/{{filename}}")
            print(f"   ✅ Image URLs have correct format: /api/uploads/blog-images/{{filename}}")
            
            if frontend_success:
                print(f"   ✅ Images are accessible from frontend")
            else:
                print(f"   ⚠️ Frontend access may have issues (check CORS/routing)")
                
            return True
        else:
            print(f"\n❌ CRITICAL IMAGE FUNCTIONALITY ISSUES FOUND!")
            if not upload_success:
                print(f"   ❌ Image upload is not working")
            if not serving_success:
                print(f"   ❌ Image serving is not working")
            return False

def main():
    tester = ImageUploadTester()
    success = tester.run_comprehensive_image_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())