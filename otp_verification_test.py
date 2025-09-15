#!/usr/bin/env python3
"""
Advanced OTP Verification Testing
Tests the enhanced email verification system with actual OTP verification
"""

import requests
import sys
import json
import sqlite3
from datetime import datetime
import time

class AdvancedOTPTester:
    def __init__(self, base_url="https://admin-verify-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.db_path = "/app/backend/marketmind.db"
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

    def get_user_otp_from_db(self, email):
        """Get OTP code from database for testing"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT email_otp_code, email_otp_expires, is_email_verified 
                FROM users 
                WHERE email = ?
            """, (email,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                otp_code, otp_expires, is_verified = result
                return {
                    'otp_code': otp_code,
                    'otp_expires': otp_expires,
                    'is_verified': bool(is_verified)
                }
            return None
        except Exception as e:
            print(f"   Database error: {e}")
            return None

    def get_user_verification_token_from_db(self, email):
        """Get verification token from database for testing"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT email_verification_token, email_verification_expires, is_email_verified 
                FROM users 
                WHERE email = ?
            """, (email,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                token, expires, is_verified = result
                return {
                    'token': token,
                    'expires': expires,
                    'is_verified': bool(is_verified)
                }
            return None
        except Exception as e:
            print(f"   Database error: {e}")
            return None

    def test_complete_otp_verification_flow(self):
        """Test complete OTP verification flow with real database data"""
        print("\n🔐 COMPLETE OTP VERIFICATION FLOW TESTING")
        print("=" * 60)
        
        results = []
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test 1: Register user with OTP method
        test_email = f"real_otp_test_{timestamp}@example.com"
        test_username = f"realotp_{timestamp}"
        
        success, response = self.run_test(
            "Register User for Real OTP Test",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "username": test_username,
                "password": "RealOTP123!",
                "full_name": "Real OTP Test User",
                "verification_method": "otp"
            },
            description="Register user with OTP verification method"
        )
        results.append(success)
        
        if not success:
            print("❌ Registration failed - cannot continue with OTP verification test")
            return False
        
        # Wait a moment for database to be updated
        time.sleep(1)
        
        # Test 2: Get real OTP from database
        print(f"\n🔍 Retrieving real OTP from database for {test_email}")
        user_data = self.get_user_otp_from_db(test_email)
        
        if not user_data:
            print("❌ Could not retrieve user data from database")
            results.append(False)
            return False
        
        print(f"   Database OTP Code: {user_data['otp_code']}")
        print(f"   OTP Expires: {user_data['otp_expires']}")
        print(f"   Is Verified: {user_data['is_verified']}")
        
        if not user_data['otp_code']:
            print("❌ No OTP code found in database")
            results.append(False)
            return False
        
        # Verify OTP code is 6 digits
        if len(user_data['otp_code']) == 6 and user_data['otp_code'].isdigit():
            print("   ✅ OTP code is 6 digits")
            results.append(True)
        else:
            print(f"   ❌ OTP code format incorrect: {user_data['otp_code']}")
            results.append(False)
        
        # Test 3: Verify with correct OTP
        success, response = self.run_test(
            "Verify with Real OTP Code",
            "POST",
            "auth/verify-otp",
            200,
            data={
                "email": test_email,
                "otp_code": user_data['otp_code']
            },
            description="Verify email using real OTP code from database"
        )
        results.append(success)
        
        if success:
            print("   ✅ OTP verification successful!")
            
            # Test 4: Check that user is now verified
            time.sleep(1)
            updated_user_data = self.get_user_otp_from_db(test_email)
            if updated_user_data and updated_user_data['is_verified']:
                print("   ✅ User is now verified in database")
                results.append(True)
                
                # Check that OTP data is cleared
                if not updated_user_data['otp_code']:
                    print("   ✅ OTP code cleared from database after verification")
                    results.append(True)
                else:
                    print(f"   ⚠️ OTP code still in database: {updated_user_data['otp_code']}")
                    results.append(False)
            else:
                print("   ❌ User verification status not updated in database")
                results.append(False)
            
            # Test 5: Try to login (should now work)
            success, response = self.run_test(
                "Login After OTP Verification",
                "POST",
                "auth/login",
                200,
                data={
                    "email": test_email,
                    "password": "RealOTP123!"
                },
                description="Test login after successful OTP verification"
            )
            results.append(success)
            
            if success and isinstance(response, dict) and 'access_token' in response:
                print("   ✅ Login successful after OTP verification")
                print(f"   User role: {response.get('user', {}).get('role', 'unknown')}")
            else:
                print("   ❌ Login failed after OTP verification")
        
        return all(results)

    def test_complete_link_verification_flow(self):
        """Test complete link verification flow with real database data"""
        print("\n🔗 COMPLETE LINK VERIFICATION FLOW TESTING")
        print("=" * 60)
        
        results = []
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test 1: Register user with link method
        test_email = f"real_link_test_{timestamp}@example.com"
        test_username = f"reallink_{timestamp}"
        
        success, response = self.run_test(
            "Register User for Real Link Test",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "username": test_username,
                "password": "RealLink123!",
                "full_name": "Real Link Test User",
                "verification_method": "link"
            },
            description="Register user with link verification method"
        )
        results.append(success)
        
        if not success:
            print("❌ Registration failed - cannot continue with link verification test")
            return False
        
        # Wait a moment for database to be updated
        time.sleep(1)
        
        # Test 2: Get real verification token from database
        print(f"\n🔍 Retrieving real verification token from database for {test_email}")
        user_data = self.get_user_verification_token_from_db(test_email)
        
        if not user_data:
            print("❌ Could not retrieve user data from database")
            results.append(False)
            return False
        
        print(f"   Database Token: {user_data['token'][:20]}..." if user_data['token'] else "None")
        print(f"   Token Expires: {user_data['expires']}")
        print(f"   Is Verified: {user_data['is_verified']}")
        
        if not user_data['token']:
            print("❌ No verification token found in database")
            results.append(False)
            return False
        
        # Test 3: Verify with correct token
        success, response = self.run_test(
            "Verify with Real Token",
            "POST",
            f"auth/verify-email/{user_data['token']}",
            200,
            description="Verify email using real token from database"
        )
        results.append(success)
        
        if success:
            print("   ✅ Link verification successful!")
            
            # Test 4: Check that user is now verified
            time.sleep(1)
            updated_user_data = self.get_user_verification_token_from_db(test_email)
            if updated_user_data and updated_user_data['is_verified']:
                print("   ✅ User is now verified in database")
                results.append(True)
                
                # Check that token data is cleared
                if not updated_user_data['token']:
                    print("   ✅ Verification token cleared from database after verification")
                    results.append(True)
                else:
                    print(f"   ⚠️ Verification token still in database")
                    results.append(False)
            else:
                print("   ❌ User verification status not updated in database")
                results.append(False)
            
            # Test 5: Try to login (should now work)
            success, response = self.run_test(
                "Login After Link Verification",
                "POST",
                "auth/login",
                200,
                data={
                    "email": test_email,
                    "password": "RealLink123!"
                },
                description="Test login after successful link verification"
            )
            results.append(success)
            
            if success and isinstance(response, dict) and 'access_token' in response:
                print("   ✅ Login successful after link verification")
                print(f"   User role: {response.get('user', {}).get('role', 'unknown')}")
            else:
                print("   ❌ Login failed after link verification")
        
        return all(results)

    def test_cross_method_verification(self):
        """Test cross-method verification (both link and OTP)"""
        print("\n🔄 CROSS-METHOD VERIFICATION TESTING")
        print("=" * 60)
        
        results = []
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Test 1: Register user with both methods
        test_email = f"cross_method_test_{timestamp}@example.com"
        test_username = f"crossmethod_{timestamp}"
        
        success, response = self.run_test(
            "Register User for Cross-Method Test",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "username": test_username,
                "password": "CrossMethod123!",
                "full_name": "Cross Method Test User",
                "verification_method": "both"
            },
            description="Register user with both verification methods"
        )
        results.append(success)
        
        if not success:
            print("❌ Registration failed - cannot continue with cross-method test")
            return False
        
        # Wait a moment for database to be updated
        time.sleep(1)
        
        # Test 2: Get both OTP and token from database
        print(f"\n🔍 Retrieving both OTP and token from database for {test_email}")
        otp_data = self.get_user_otp_from_db(test_email)
        token_data = self.get_user_verification_token_from_db(test_email)
        
        if not otp_data or not token_data:
            print("❌ Could not retrieve user data from database")
            results.append(False)
            return False
        
        print(f"   Database OTP Code: {otp_data['otp_code']}")
        print(f"   Database Token: {token_data['token'][:20]}..." if token_data['token'] else "None")
        print(f"   Is Verified: {otp_data['is_verified']}")
        
        # Verify both OTP and token exist
        if otp_data['otp_code'] and token_data['token']:
            print("   ✅ Both OTP and verification token present in database")
            results.append(True)
        else:
            print("   ❌ Missing OTP or verification token in database")
            results.append(False)
            return False
        
        # Test 3: Verify using OTP (should clear both OTP and token)
        success, response = self.run_test(
            "Verify Cross-Method User with OTP",
            "POST",
            "auth/verify-otp",
            200,
            data={
                "email": test_email,
                "otp_code": otp_data['otp_code']
            },
            description="Verify user with both methods using OTP"
        )
        results.append(success)
        
        if success:
            print("   ✅ OTP verification successful!")
            
            # Test 4: Check that both OTP and token are cleared
            time.sleep(1)
            updated_otp_data = self.get_user_otp_from_db(test_email)
            updated_token_data = self.get_user_verification_token_from_db(test_email)
            
            if updated_otp_data and updated_otp_data['is_verified']:
                print("   ✅ User is now verified in database")
                results.append(True)
                
                # Check that both OTP and token data are cleared
                if not updated_otp_data['otp_code'] and not updated_token_data['token']:
                    print("   ✅ Both OTP and verification token cleared after verification")
                    results.append(True)
                else:
                    print(f"   ⚠️ Verification data not fully cleared:")
                    print(f"      OTP: {updated_otp_data['otp_code']}")
                    print(f"      Token: {updated_token_data['token']}")
                    results.append(False)
            else:
                print("   ❌ User verification status not updated in database")
                results.append(False)
        
        return all(results)

def main():
    print("🚀 Advanced OTP Verification Testing")
    print("=" * 60)
    print("🎯 FOCUS: Testing real OTP verification with database integration")
    print("=" * 60)
    
    tester = AdvancedOTPTester()
    
    # Test complete OTP verification flow
    otp_success = tester.test_complete_otp_verification_flow()
    
    # Test complete link verification flow
    link_success = tester.test_complete_link_verification_flow()
    
    # Test cross-method verification
    cross_success = tester.test_cross_method_verification()
    
    # Print comprehensive results
    print("\n" + "=" * 60)
    print("📊 ADVANCED OTP VERIFICATION TEST RESULTS")
    print("=" * 60)
    print(f"Total Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\nFlow Test Results:")
    print(f"  OTP Flow: {'✅ PASSED' if otp_success else '❌ FAILED'}")
    print(f"  Link Flow: {'✅ PASSED' if link_success else '❌ FAILED'}")
    print(f"  Cross-Method Flow: {'✅ PASSED' if cross_success else '❌ FAILED'}")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests Details:")
        for test in tester.failed_tests:
            print(f"   - {test['name']}")
            if 'expected' in test:
                print(f"     Expected: {test['expected']}, Got: {test['actual']}")
            if 'error' in test:
                print(f"     Error: {test['error']}")
            if 'response' in test:
                print(f"     Response: {test['response'][:200]}...")
    
    print("\n" + "=" * 60)
    
    # Return exit code based on results
    all_success = otp_success and link_success and cross_success
    if all_success:
        print("🎉 All advanced OTP verification tests PASSED!")
        return 0
    else:
        print("❌ Some advanced OTP verification tests FAILED!")
        return 1

if __name__ == "__main__":
    sys.exit(main())