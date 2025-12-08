# Moamalat NPG Payment Gateway Integration Guide

## 📋 Overview

This guide explains how to integrate Moamalat's National Payment Gateway (NPG) for Libya into the MazadZoo animal auction platform.

**Integration Method:** Lightbox (Popup Modal)  
**Official Documentation:** https://docs.moamalat.net/lightBox.html  
**Reference Package:** https://github.com/alifaraun/laravel-moamalat-pay

---

## 🔧 Configuration

### Backend Configuration

Add these environment variables to `/backend/.env`:

```bash
# Moamalat NPG Payment Gateway
MOAMALAT_PRODUCTION=false                    # Set to 'true' for production
MOAMALAT_MERCHANT_ID=10081014649            # Your merchant ID
MOAMALAT_TERMINAL_ID=99179395               # Your terminal ID
MOAMALAT_SECURE_KEY=3a488a89b3f7993476c252f017c488bb  # Your secure key (hex)
MOAMALAT_NOTIFICATION_KEY=                  # Optional separate webhook key
```

### Test Credentials

**Merchant Details:**
- Merchant ID: `10081014649`
- Terminal ID: `99179395`
- Secure Key: `3a488a89b3f7993476c252f017c488bb`

**Test Cards:**
- Card Number: `6395043835180860` or `6395043165725698` or `6395043170446256`
- Expiry: `01/27`
- OTP: `111111`

---

## 🏗️ Architecture

### Backend Service

**File:** `/backend/services/moamalatService.js`

#### Key Methods:

1. **`generatePaymentConfig(amount, merchantReference)`**
   - Generates Lightbox configuration for frontend
   - Returns: MID, TID, Amount, SecureHash, DateTime, LightboxURL

2. **`verifyWebhookNotification(webhookData)`**
   - Validates webhook signature from Moamalat
   - Returns: { valid: boolean, data: {...} }

3. **`getTransaction(networkReference, merchantReference)`**
   - Fetches transaction details from Moamalat API
   - Returns: Transaction status, amount, card details

4. **`refundTransaction(networkReference, amount)`**
   - Processes full or partial refund
   - Returns: Refund reference number

5. **`isConfigured()`**
   - Checks if service is properly configured
   - Returns: { configured: boolean, mode: 'test'|'production', message }

---

## 🔄 Payment Flow

### 1. User Initiates Payment

**Endpoint:** `POST /api/payments/add-funds`

```javascript
// Request
{
  "amount": 10000  // Amount in smallest unit (10000 = 10 LYD)
}

// Response
{
  "success": true,
  "message": "تم إنشاء طلب الدفع بنجاح",
  "data": {
    "payment": {
      "_id": "...",
      "transactionId": "TXN_1234567890",
      "amount": 10,
      "status": "pending"
    },
    "moamalat": {
      "MID": "10081014649",
      "TID": "99179395",
      "AmountTrxn": 10000,
      "MerchantReference": "TXN_1234567890",
      "TrxDateTime": 1701234567,
      "SecureHash": "ABC123...",
      "lightboxURL": "https://tnpg.moamalat.net:6006/js/lightbox.js",
      "isProduction": false
    }
  }
}
```

### 2. Frontend Shows Lightbox

**Load Lightbox Script:**

```html
<script src="https://tnpg.moamalat.net:6006/js/lightbox.js"></script>
<!-- For production: https://npg.moamalat.net:6006/js/lightbox.js -->
```

**Initialize Payment:**

```javascript
// Configure Lightbox
Lightbox.Checkout.configure = {
  MID: moamalat.MID,
  TID: moamalat.TID,
  AmountTrxn: moamalat.AmountTrxn,
  MerchantReference: moamalat.MerchantReference,
  TrxDateTime: moamalat.TrxDateTime,
  SecureHash: moamalat.SecureHash,
  
  completeCallback: function(data) {
    console.log('Payment completed:', data);
    // data contains: Amount, MerchantReference, DateTimeLocalTrxn, SecureHash
    // Check payment status via API
  },
  
  errorCallback: function(error) {
    console.error('Payment error:', error);
    // error contains error details
  },
  
  cancelCallback: function() {
    console.log('Payment cancelled by user');
  }
};

// Show payment modal
Lightbox.Checkout.showLightbox();
```

### 3. Moamalat Processes Payment

- User enters card details in Lightbox modal
- Moamalat validates card and processes payment
- Moamalat sends webhook notification to your server
- Lightbox triggers `completeCallback` or `errorCallback`

### 4. Webhook Notification

**Endpoint:** `POST /api/payments/webhook/moamalat` (Public, no auth)

**Webhook Data:**
```javascript
{
  "MerchantId": "10081014649",
  "TerminalId": "99179395",
  "DateTimeLocalTrxn": "1701234567",
  "TxnType": "1",  // 1=Sale, 2=Refund, 3=Void
  "Message": "Approved",
  "PaidThrough": "Card",
  "SystemReference": "1234567",
  "NetworkReference": "223414600869",
  "MerchantReference": "TXN_1234567890",
  "Amount": "10.000",
  "Currency": "LYD",
  "PayerAccount": "639504XXXXXX0860",
  "PayerName": "JOHN DOE",
  "ActionCode": "00",  // "00" = Approved
  "SecureHash": "ABCD1234..."
}
```

**Backend Processing:**
1. Verify `SecureHash` to ensure authenticity
2. Find payment by `MerchantReference`
3. Check `ActionCode`: "00" = approved
4. Update payment status to `completed`
5. Add funds to user wallet
6. Return `{ Message: "Success", Success: true }`

### 5. Frontend Checks Status

After callback is triggered, query payment status:

```javascript
// GET /api/payments/history?transactionId=TXN_1234567890
fetch('/api/payments/history?transactionId=' + txnId)
  .then(res => res.json())
  .then(data => {
    if (data.payment.status === 'completed') {
      // Show success message
      // Redirect to wallet or thank you page
    }
  });
```

---

## 🔐 Security

### SecureHash Generation

**Algorithm:** HMAC-SHA256

**For Payment:**
```
Data = "Amount={amount}&DateTimeLocalTrxn={timestamp}&MerchantId={mid}&MerchantReference={ref}&TerminalId={tid}"
Key = hex2bin(MOAMALAT_SECURE_KEY)
SecureHash = HMAC-SHA256(Data, Key).toUpperCase()
```

**For Webhook Verification:**
```
Data = "Amount={amount}&Currency={currency}&DateTimeLocalTrxn={timestamp}&MerchantId={mid}&TerminalId={tid}"
Key = hex2bin(MOAMALAT_NOTIFICATION_KEY || MOAMALAT_SECURE_KEY)
ExpectedHash = HMAC-SHA256(Data, Key).toUpperCase()
Valid = (ReceivedHash === ExpectedHash)
```

### Important Security Notes:

1. **Never expose secure key in frontend code**
2. **Always verify webhook signatures**
3. **Use HTTPS in production**
4. **Validate amounts server-side**
5. **Implement idempotency for webhooks** (same webhook may arrive multiple times)

---

## 📊 Transaction Types

| TxnType | Description |
|---------|-------------|
| 1 | Sale (Regular payment) |
| 2 | Refund |
| 3 | Void Sale |
| 4 | Void Refund |

## 🎯 Action Codes

| Code | Status | Description |
|------|--------|-------------|
| 00 | Approved | Transaction successful |
| 01 | Declined | Card declined |
| 05 | Declined | Do not honor |
| 14 | Declined | Invalid card number |
| 51 | Declined | Insufficient funds |
| 54 | Declined | Expired card |
| 55 | Declined | Incorrect PIN |

---

## 🧪 Testing

### Test Payment Flow

```bash
# 1. Start backend server
cd backend
npm run dev

# 2. Test payment creation
curl -X POST http://localhost:5000/api/payments/add-funds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 10000}'

# 3. Use returned moamalat config in frontend Lightbox
# 4. Use test card: 6395043835180860, EXP: 01/27, OTP: 111111
```

### Test Webhook

```bash
# Simulate Moamalat webhook notification
curl -X POST http://localhost:5000/api/payments/webhook/moamalat \
  -H "Content-Type: application/json" \
  -d '{
    "MerchantId": "10081014649",
    "TerminalId": "99179395",
    "DateTimeLocalTrxn": "1701234567",
    "TxnType": "1",
    "Message": "Approved",
    "SystemReference": "1234567",
    "NetworkReference": "223414600869",
    "MerchantReference": "TXN_1234567890",
    "Amount": "10.000",
    "Currency": "LYD",
    "PayerAccount": "639504XXXXXX0860",
    "PayerName": "TEST USER",
    "ActionCode": "00",
    "SecureHash": "GENERATE_VALID_HASH"
  }'
```

---

## 🔧 Refunds

### Process Refund (Admin Only)

**Endpoint:** `POST /api/payments/:paymentId/refund`

```javascript
// Request
{
  "reason": "Customer requested refund",
  "amount": 5000  // Optional: partial refund (5 LYD)
}

// Backend calls moamalatService.refundTransaction(networkReference, amount)
// Moamalat processes refund and sends webhook notification
```

---

## 📱 Frontend Integration Example

```javascript
async function initiatePayment(amount) {
  try {
    // 1. Call backend to create payment
    const response = await fetch('/api/payments/add-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ amount })
    });
    
    const { data } = await response.json();
    const { moamalat, payment } = data;
    
    // 2. Load Lightbox script if not already loaded
    if (!window.Lightbox) {
      await loadScript(moamalat.lightboxURL);
    }
    
    // 3. Configure Lightbox
    Lightbox.Checkout.configure = {
      MID: moamalat.MID,
      TID: moamalat.TID,
      AmountTrxn: moamalat.AmountTrxn,
      MerchantReference: moamalat.MerchantReference,
      TrxDateTime: moamalat.TrxDateTime,
      SecureHash: moamalat.SecureHash,
      
      completeCallback: async function(callbackData) {
        // Wait a moment for webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check payment status
        const status = await checkPaymentStatus(payment.transactionId);
        if (status === 'completed') {
          showSuccess('تم إضافة الرصيد بنجاح');
          updateWalletBalance();
        }
      },
      
      errorCallback: function(error) {
        showError('فشلت عملية الدفع: ' + error.error);
      },
      
      cancelCallback: function() {
        showInfo('تم إلغاء عملية الدفع');
      }
    };
    
    // 4. Show payment modal
    Lightbox.Checkout.showLightbox();
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    showError('فشل في إنشاء طلب الدفع');
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

---

## 🚀 Production Deployment

### Before Going Live:

1. **Get Production Credentials:**
   - Contact Moamalat to get your production MID, TID, and Secure Key
   - Update `.env`:
     ```bash
     MOAMALAT_PRODUCTION=true
     MOAMALAT_MERCHANT_ID=your_production_mid
     MOAMALAT_TERMINAL_ID=your_production_tid
     MOAMALAT_SECURE_KEY=your_production_key
     ```

2. **Configure Webhook URL:**
   - Provide Moamalat with your webhook URL:
     ```
     https://yourdomain.com/api/payments/webhook/moamalat
     ```
   - Ensure it's publicly accessible
   - Use HTTPS (required for production)

3. **Set Up IP Whitelist (Optional but Recommended):**
   - Ask Moamalat for their webhook IP addresses
   - Add middleware to verify webhook source:
     ```javascript
     const moamalatIPs = ['1.2.3.4', '5.6.7.8'];
     if (!moamalatIPs.includes(req.ip)) {
       return res.status(403).json({ error: 'Forbidden' });
     }
     ```

4. **Test in Production:**
   - Use small amounts for initial testing
   - Verify webhook delivery
   - Check refund functionality
   - Monitor logs for errors

5. **Enable Monitoring:**
   - Log all webhook notifications
   - Set up alerts for failed payments
   - Monitor SecureHash verification failures

---

## 📞 Support

- **Moamalat Documentation:** https://docs.moamalat.net
- **Technical Support:** Contact Moamalat support team
- **GitHub Reference:** https://github.com/alifaraun/laravel-moamalat-pay

---

## ✅ Checklist

- [ ] Backend service configured (`moamalatService.js`)
- [ ] Environment variables set (`.env`)
- [ ] Payment controller updated
- [ ] Webhook endpoint accessible
- [ ] Frontend Lightbox integration implemented
- [ ] Test payment successful with test card
- [ ] Webhook signature verification working
- [ ] Production credentials obtained
- [ ] Webhook URL registered with Moamalat
- [ ] HTTPS enabled for production
- [ ] Monitoring and logging set up
