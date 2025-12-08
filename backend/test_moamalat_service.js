const moamalatService = require('./services/moamalatService');

console.log('🧪 Testing Moamalat Service Integration\n');

// 1. Check configuration
console.log('1️⃣ Configuration Status:');
const config = moamalatService.isConfigured();
console.log(JSON.stringify(config, null, 2));
console.log('');

// 2. Test payment hash generation
console.log('2️⃣ Generate Payment Configuration:');
const amount = 10000; // 10 LYD in smallest unit
const merchantRef = 'TEST_' + Date.now();
const paymentConfig = moamalatService.generatePaymentConfig(amount, merchantRef);
console.log('Amount:', amount, '(smallest unit) =', amount/1000, 'LYD');
console.log('Merchant Reference:', merchantRef);
console.log('Config:', JSON.stringify(paymentConfig, null, 2));
console.log('');

// 3. Test webhook signature verification
console.log('3️⃣ Test Webhook Verification:');
const testWebhook = {
  MerchantId: '10081014649',
  TerminalId: '99179395',
  DateTimeLocalTrxn: '1701234567',
  TxnType: '1',
  Message: 'Approved',
  PaidThrough: 'Card',
  SystemReference: '1234567',
  NetworkReference: '223414600869',
  MerchantReference: 'TXN_TEST_123',
  Amount: '10.000',
  Currency: 'LYD',
  PayerAccount: '639504XXXXXX0860',
  PayerName: 'TEST USER',
  ActionCode: '00',
  SecureHash: 'INVALID_HASH_FOR_TESTING' // This should fail
};

const verification = moamalatService.verifyWebhookNotification(testWebhook);
console.log('Verification Result:', JSON.stringify(verification, null, 2));
console.log('');

// 4. Generate valid hash for webhook
console.log('4️⃣ Generate Valid Webhook Hash:');
const crypto = require('crypto');
const key = Buffer.from('3a488a89b3f7993476c252f017c488bb', 'hex');
const encodeData = `Amount=${testWebhook.Amount}&Currency=${testWebhook.Currency}&DateTimeLocalTrxn=${testWebhook.DateTimeLocalTrxn}&MerchantId=${testWebhook.MerchantId}&TerminalId=${testWebhook.TerminalId}`;
const hmac = crypto.createHmac('sha256', key);
hmac.update(encodeData);
const validHash = hmac.digest('hex').toUpperCase();

console.log('Generated Valid Hash:', validHash);
testWebhook.SecureHash = validHash;

const validVerification = moamalatService.verifyWebhookNotification(testWebhook);
console.log('Valid Verification:', JSON.stringify(validVerification, null, 2));
console.log('');

console.log('✅ Moamalat Service Test Complete!');
console.log('');
console.log('📝 Summary:');
console.log('- Configuration:', config.configured ? '✅ OK' : '❌ NOT CONFIGURED');
console.log('- Mode:', config.mode);
console.log('- Payment Hash Generation:', paymentConfig.SecureHash ? '✅ OK' : '❌ FAILED');
console.log('- Webhook Verification:', validVerification.valid ? '✅ OK' : '❌ FAILED');
