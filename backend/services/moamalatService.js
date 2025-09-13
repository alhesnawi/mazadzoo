const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class MoamalatService {
  constructor() {
    this.baseURL = process.env.MOAMALAT_API_URL || 'https://api.moamalat.ly';
    this.merchantId = process.env.MOAMALAT_MERCHANT_ID;
    this.terminalId = process.env.MOAMALAT_TERMINAL_ID;
    this.secretKey = process.env.MOAMALAT_SECRET_KEY;
    this.returnUrl = process.env.MOAMALAT_RETURN_URL || `${process.env.DOMAIN}/payment/callback`;
    this.webhookUrl = process.env.MOAMALAT_WEBHOOK_URL || `${process.env.DOMAIN}/api/payments/webhook`;
  }

  // Generate secure hash for Moamalat API
  generateHash(data) {
    const hashString = Object.values(data).join('') + this.secretKey;
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  // Create payment request
  async createPayment(amount, currency = 'LYD', description = '', orderId = null) {
    try {
      if (!this.merchantId || !this.terminalId || !this.secretKey) {
        throw new Error('Moamalat configuration is missing');
      }

      const paymentData = {
        MerchantId: this.merchantId,
        TerminalId: this.terminalId,
        Amount: amount,
        Currency: currency,
        OrderId: orderId || `ORDER_${Date.now()}`,
        Description: description,
        ReturnUrl: this.returnUrl,
        WebhookUrl: this.webhookUrl,
        Timestamp: new Date().toISOString()
      };

      // Generate hash
      paymentData.Hash = this.generateHash(paymentData);

      logger.info('Creating Moamalat payment', { orderId: paymentData.OrderId, amount });

      const response = await axios.post(`${this.baseURL}/payment/initiate`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        },
        timeout: 30000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          paymentUrl: response.data.paymentUrl,
          transactionId: response.data.transactionId,
          orderId: paymentData.OrderId
        };
      } else {
        throw new Error(response.data?.message || 'Payment initiation failed');
      }

    } catch (error) {
      logger.error('Moamalat payment creation failed', {
        error: error.message,
        stack: error.stack,
        amount,
        orderId
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      const verifyData = {
        MerchantId: this.merchantId,
        TerminalId: this.terminalId,
        TransactionId: transactionId,
        Timestamp: new Date().toISOString()
      };

      verifyData.Hash = this.generateHash(verifyData);

      const response = await axios.post(`${this.baseURL}/payment/verify`, verifyData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        },
        timeout: 30000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          status: response.data.status,
          amount: response.data.amount,
          currency: response.data.currency,
          transactionId: response.data.transactionId,
          orderId: response.data.orderId
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: response.data?.message || 'Verification failed'
        };
      }

    } catch (error) {
      logger.error('Moamalat payment verification failed', {
        error: error.message,
        transactionId
      });
      return {
        success: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Process refund
  async processRefund(transactionId, amount, reason = '') {
    try {
      const refundData = {
        MerchantId: this.merchantId,
        TerminalId: this.terminalId,
        TransactionId: transactionId,
        Amount: amount,
        Reason: reason,
        Timestamp: new Date().toISOString()
      };

      refundData.Hash = this.generateHash(refundData);

      const response = await axios.post(`${this.baseURL}/payment/refund`, refundData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        },
        timeout: 30000
      });

      if (response.data && response.data.success) {
        return {
          success: true,
          refundId: response.data.refundId,
          status: 'processed'
        };
      } else {
        throw new Error(response.data?.message || 'Refund failed');
      }

    } catch (error) {
      logger.error('Moamalat refund failed', {
        error: error.message,
        transactionId,
        amount
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle webhook notifications
  handleWebhook(webhookData) {
    try {
      // Verify webhook signature
      const { hash, ...data } = webhookData;
      const expectedHash = this.generateHash(data);

      if (hash !== expectedHash) {
        logger.warn('Invalid webhook signature', { receivedHash: hash, expectedHash });
        return { valid: false, error: 'Invalid signature' };
      }

      logger.info('Valid webhook received', {
        transactionId: data.transactionId,
        status: data.status,
        amount: data.amount
      });

      return {
        valid: true,
        transactionId: data.transactionId,
        status: data.status,
        amount: data.amount,
        orderId: data.orderId,
        timestamp: data.timestamp
      };

    } catch (error) {
      logger.error('Webhook processing failed', { error: error.message });
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new MoamalatService();