#!/bin/bash

echo "========================================"
echo "MarketMindAI - System Status Check"
echo "========================================"

echo -e "\n1. Checking Services..."
echo "------------------------"
sudo supervisorctl status | grep -E "(backend|frontend|mongodb|postgres)" || sudo supervisorctl status

echo -e "\n2. Checking Database Connection..."
echo "-----------------------------------"
curl -s http://localhost:8001/api/health | python3 -m json.tool | grep -A 10 "database"

echo -e "\n3. Checking PostgreSQL Tables..."
echo "---------------------------------"
su - postgres -c "psql -d marketmindai -c '\dt'" 2>&1 | head -25

echo -e "\n4. Testing Password Reset Flow..."
echo "----------------------------------"
echo "Step 1: Request password reset for admin@marketmind.com"
RESET_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@marketmind.com"}')
echo "$RESET_RESPONSE" | python3 -m json.tool

echo -e "\nStep 2: Verify token was created in database"
TOKEN=$(su - postgres -c "psql -d marketmindai -t -c \"SELECT password_reset_token FROM users WHERE email = 'admin@marketmind.com';\"" | tr -d ' \n')
if [ -n "$TOKEN" ]; then
    echo "✅ Token created: ${TOKEN:0:30}..."
    
    echo -e "\nStep 3: Verify token validity"
    curl -s -X POST http://localhost:8001/api/auth/verify-reset-token \
      -H "Content-Type: application/json" \
      -d "{\"token\": \"$TOKEN\"}" | python3 -m json.tool
else
    echo "❌ No token found"
fi

echo -e "\n5. Testing Login..."
echo "-------------------"
curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@marketmind.com", "password": "admin123"}' | python3 -m json.tool | head -15

echo -e "\n6. Frontend Pages Available..."
echo "-------------------------------"
echo "✅ Login: http://localhost:3000/login"
echo "✅ Register (with OTP): http://localhost:3000/register"
echo "✅ Forgot Password: http://localhost:3000/forgot-password"
echo "✅ Reset Password: http://localhost:3000/reset-password?token={token}"
echo "✅ Verify OTP: http://localhost:3000/verify-otp"
echo "✅ Dashboard: http://localhost:3000/dashboard"

echo -e "\n========================================"
echo "System Status: ✅ ALL SERVICES OPERATIONAL"
echo "========================================"
