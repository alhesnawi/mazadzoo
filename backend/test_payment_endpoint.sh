#!/bin/bash

echo "🧪 Testing Moamalat Payment Integration"
echo ""

# Get buyer token
BUYER_TOKEN=$(cat ../buyer_token.txt 2>/dev/null || echo "")

if [ -z "$BUYER_TOKEN" ]; then
  echo "❌ Buyer token not found. Please run authentication tests first."
  exit 1
fi

echo "1️⃣ Testing POST /api/payments/add-funds - إضافة رصيد بمزايدة Moamalat"
echo "Amount: 10000 (smallest unit) = 10 LYD"
echo ""

RESPONSE=$(curl -s -X POST "http://localhost:5000/api/payments/add-funds" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "amount": 10000
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract payment details
SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
if [ "$SUCCESS" == "true" ]; then
  echo "✅ Payment creation successful"
  
  # Check if moamalat config is present
  HAS_MOAMALAT=$(echo "$RESPONSE" | jq -r '.data.moamalat.MID' 2>/dev/null)
  if [ "$HAS_MOAMALAT" != "null" ] && [ -n "$HAS_MOAMALAT" ]; then
    echo "✅ Moamalat configuration included"
    echo ""
    echo "📋 Moamalat Config:"
    echo "$RESPONSE" | jq '.data.moamalat' 2>/dev/null
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Use this config in frontend Lightbox.Checkout.configure"
    echo "2. Test with card: 6395043835180860"
    echo "3. Expiry: 01/27, OTP: 111111"
  else
    echo "⚠️  Moamalat configuration missing in response"
  fi
else
  echo "❌ Payment creation failed"
  echo "Error:", $(echo "$RESPONSE" | jq -r '.message' 2>/dev/null)
fi

echo ""
echo "2️⃣ Testing Payment History"
HISTORY=$(curl -s -X GET "http://localhost:5000/api/payments/history" \
  -H "Authorization: Bearer $BUYER_TOKEN")

echo "Recent payments:"
echo "$HISTORY" | jq '.data.payments | map({transactionId, amount, status, type, createdAt}) | .[:3]' 2>/dev/null || echo "$HISTORY"
echo ""

echo "✅ Payment Integration Test Complete"
