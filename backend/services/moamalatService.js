/**
 * Moamalat NPG (National Payment Gateway) Service for Libya
 * Based on: https://docs.moamalat.net/lightBox.html
 * Package reference: https://github.com/alifaraun/laravel-moamalat-pay
 * 
 * Integration Method: Lightbox (popup modal for card payment)
 * 
 * Test Credentials (from official docs):
 * - Merchant ID: 10081014649
 * - Terminal ID: 99179395
 * - Secure Key: 3a488a89b3f7993476c252f017c488bb
 * 
 * Test Cards:
 * - Card: 6395043835180860 or 6395043165725698 or 6395043170446256
 * - EXP: 01/27
 * - OTP: 111111
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

class MoamalatService {
  constructor() {
    // Use test environment by default if production not explicitly set
    this.isProduction = process.env.MOAMALAT_PRODUCTION === 'true';
    
    // NPG API URLs
    this.apiURL = this.isProduction 
      ? 'https://npg.moamalat.net/cube/paylink.svc/api'
      : 'https://tnpg.moamalat.net/cube/paylink.svc/api';
    
    // Lightbox script URLs
    this.lightboxURL = this.isProduction
      ? 'https://npg.moamalat.net:6006/js/lightbox.js'
      : 'https://tnpg.moamalat.net:6006/js/lightbox.js';
    
    // Configuration
    this.merchantId = process.env.MOAMALAT_MERCHANT_ID || '10081014649'; // Test MID
    this.terminalId = process.env.MOAMALAT_TERMINAL_ID || '99179395'; // Test TID
    this.secureKey = process.env.MOAMALAT_SECURE_KEY || '3a488a89b3f7993476c252f017c488bb'; // Test key
    this.notificationKey = process.env.MOAMALAT_NOTIFICATION_KEY; // For webhook signature validation
    
    // Validate configuration
    if (!this.merchantId || !this.terminalId || !this.secureKey) {
      logger.warn('Moamalat configuration incomplete - using test credentials');
    }
  }

  /**
   * Generate SecureHash for Moamalat transactions
   * Algorithm: HMAC-SHA256
   * 
   * @param {Object} data - Transaction data
   * @returns {string} - Hex encoded hash
   */
  generateSecureHash(data) {
    try {
      // Convert hex key to binary
      const key = Buffer.from(this.secureKey, 'hex');
      
      // Create HMAC-SHA256 hash
      const hmac = crypto.createHmac('sha256', key);
      hmac.update(data);
      
      return hmac.digest('hex').toUpperCase();
    } catch (error) {
      logger.error('Error generating secure hash', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate secure hash for payment initiation
   * Format: Amount={amount}&DateTimeLocalTrxn={timestamp}&MerchantId={mid}&MerchantReference={ref}&TerminalId={tid}
   * 
   * @param {number} amount - Amount in Libyan Dirham (LYD) - smallest unit (1000 = 1 LYD)
   * @param {string} merchantReference - Unique order/transaction reference
   * @returns {Object} - { secureHash, DateTimeLocalTrxn }
   */
  generatePaymentHash(amount, merchantReference = '') {
    const DateTimeLocalTrxn = Math.floor(Date.now() / 1000); // Unix timestamp
    
    const encodeData = `Amount=${amount}&DateTimeLocalTrxn=${DateTimeLocalTrxn}&MerchantId=${this.merchantId}&MerchantReference=${merchantReference}&TerminalId=${this.terminalId}`;
    
    const secureHash = this.generateSecureHash(encodeData);
    
    return {
      secureHash,
      DateTimeLocalTrxn
    };
  }

  /**
   * Generate configuration for Lightbox payment
   * This is used by frontend to initialize Moamalat Lightbox
   * 
   * @param {number} amount - Amount in Libyan Dirham (LYD) smallest unit
   * @param {string} merchantReference - Unique reference for this transaction
   * @returns {Object} - Configuration object for Lightbox
   */
  generatePaymentConfig(amount, merchantReference = '') {
    const { secureHash, DateTimeLocalTrxn } = this.generatePaymentHash(amount, merchantReference);
    
    return {
      MID: this.merchantId,
      TID: this.terminalId,
      AmountTrxn: amount,
      MerchantReference: merchantReference,
      TrxDateTime: DateTimeLocalTrxn,
      SecureHash: secureHash,
      lightboxURL: this.lightboxURL,
      isProduction: this.isProduction
    };
  }

  /**
   * Verify webhook notification from Moamalat
   * Validates SecureHash to ensure request authenticity
   * 
   * @param {Object} webhookData - Data from webhook POST request
   * @returns {Object} - { valid: boolean, data: {...}, error?: string }
   */
  verifyWebhookNotification(webhookData) {
    try {
      const {
        SecureHash,
        Amount,
        Currency,
        DateTimeLocalTrxn,
        MerchantId,
        TerminalId,
        ...otherData
      } = webhookData;

      // Generate expected hash
      const key = this.notificationKey ? Buffer.from(this.notificationKey, 'hex') : Buffer.from(this.secureKey, 'hex');
      const encodeData = `Amount=${Amount}&Currency=${Currency}&DateTimeLocalTrxn=${DateTimeLocalTrxn}&MerchantId=${MerchantId}&TerminalId=${TerminalId}`;
      
      const hmac = crypto.createHmac('sha256', key);
      hmac.update(encodeData);
      const expectedHash = hmac.digest('hex').toUpperCase();

      const isValid = SecureHash === expectedHash;

      if (!isValid) {
        logger.warn('Invalid webhook signature', { 
          receivedHash: SecureHash, 
          expectedHash,
          merchantId: MerchantId,
          terminalId: TerminalId
        });
        return { 
          valid: false, 
          error: 'Invalid webhook signature' 
        };
      }

      logger.info('Valid Moamalat webhook received', {
        merchantReference: otherData.MerchantReference,
        networkReference: otherData.NetworkReference,
        systemReference: otherData.SystemReference,
        amount: Amount,
        actionCode: otherData.ActionCode,
        message: otherData.Message
      });

      return {
        valid: true,
        data: {
          merchantId: MerchantId,
          terminalId: TerminalId,
          dateTimeLocalTrxn: DateTimeLocalTrxn,
          txnType: otherData.TxnType,
          message: otherData.Message,
          paidThrough: otherData.PaidThrough,
          systemReference: otherData.SystemReference,
          networkReference: otherData.NetworkReference,
          merchantReference: otherData.MerchantReference,
          amount: Amount,
          currency: Currency,
          payerAccount: otherData.PayerAccount,
          payerName: otherData.PayerName,
          actionCode: otherData.ActionCode,
          // ActionCode '00' means approved
          isApproved: otherData.ActionCode === '00',
          status: otherData.ActionCode === '00' ? 'approved' : 'declined'
        }
      };

    } catch (error) {
      logger.error('Webhook verification failed', { error: error.message });
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get transaction details from Moamalat NPG
   * Uses FilterTransactions API
   * 
   * @param {string} networkReference - Network reference from webhook
   * @param {string} merchantReference - Merchant reference from order
   * @returns {Object} - Transaction details or error
   */
  async getTransaction(networkReference, merchantReference = '') {
    try {
      const DateTimeLocalTrxn = Math.floor(Date.now() / 1000);
      const encodeData = `DateTimeLocalTrxn=${DateTimeLocalTrxn}&MerchantId=${this.merchantId}&TerminalId=${this.terminalId}`;
      const secureHash = this.generateSecureHash(encodeData);

      const requestData = {
        NetworkReference: networkReference,
        MerchantReference: merchantReference,
        TerminalId: this.terminalId,
        MerchantId: this.merchantId,
        DisplayLength: 1,
        DisplayStart: 0,
        DateTimeLocalTrxn: DateTimeLocalTrxn,
        SecureHash: secureHash
      };

      logger.info('Fetching transaction from Moamalat', { networkReference, merchantReference });

      const response = await axios.post(`${this.apiURL}/FilterTransactions`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.status !== 200 || response.data.TotalCountAllTransaction !== 1) {
        throw new Error(response.data?.Message || 'Transaction not found');
      }

      const transactionData = response.data.Transactions[0].DateTransactions[0];

      return {
        success: true,
        transaction: {
          transactionChannel: transactionData.TransactionChannel,
          cardNo: transactionData.CardNo,
          senderName: transactionData.SenderName,
          amount: transactionData.Amnt,
          amountTrxn: transactionData.AmountTrxn,
          feeAmnt: transactionData.FeeAmnt,
          status: transactionData.Status,
          currency: transactionData.Currency,
          transType: transactionData.TransType,
          merchantReference: transactionData.MerchantReference,
          networkReference: transactionData.NetworkReference,
          systemReference: transactionData.SystemReference,
          receiptNo: transactionData.ReceiptNo,
          isApproved: transactionData.Status === 'Approved'
        }
      };

    } catch (error) {
      logger.error('Failed to get transaction', {
        error: error.message,
        networkReference,
        merchantReference
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund a transaction
   * Uses RefundTransaction API
   * 
   * @param {string} networkReference - Network reference from original transaction
   * @param {number} amount - Amount to refund (optional, full refund if not specified)
   * @returns {Object} - Refund result
   */
  async refundTransaction(networkReference, amount = null) {
    try {
      const DateTimeLocalTrxn = Math.floor(Date.now() / 1000);
      const encodeData = `DateTimeLocalTrxn=${DateTimeLocalTrxn}&MerchantId=${this.merchantId}&TerminalId=${this.terminalId}`;
      const secureHash = this.generateSecureHash(encodeData);

      const requestData = {
        NetworkReference: networkReference,
        TerminalId: this.terminalId,
        MerchantId: this.merchantId,
        DateTimeLocalTrxn: DateTimeLocalTrxn,
        SecureHash: secureHash
      };

      // Add amount if partial refund
      if (amount !== null) {
        requestData.Amount = amount;
      }

      logger.info('Initiating refund', { networkReference, amount });

      const response = await axios.post(`${this.apiURL}/RefundTransaction`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.status !== 200 || response.data.Success !== true) {
        throw new Error(response.data?.Message || 'Refund failed');
      }

      logger.info('Refund successful', { 
        networkReference, 
        refNumber: response.data.RefNumber,
        message: response.data.Message
      });

      return {
        success: true,
        message: response.data.Message,
        refNumber: response.data.RefNumber, // System reference for refund transaction
        actionCode: response.data.ActionCode,
        authCode: response.data.AuthCode,
        networkReference: response.data.NetworkReference
      };

    } catch (error) {
      logger.error('Refund failed', {
        error: error.message,
        networkReference,
        amount
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if service is properly configured
   * @returns {Object} - { configured: boolean, message: string }
   */
  isConfigured() {
    const isTest = this.merchantId === '10081014649' && 
                   this.terminalId === '99179395' && 
                   this.secureKey === '3a488a89b3f7993476c252f017c488bb';

    if (isTest) {
      return {
        configured: true,
        mode: 'test',
        message: 'Using Moamalat TEST credentials - replace with production credentials before going live'
      };
    }

    const hasConfig = this.merchantId && this.terminalId && this.secureKey;
    
    return {
      configured: hasConfig,
      mode: this.isProduction ? 'production' : 'test',
      message: hasConfig 
        ? `Moamalat configured in ${this.isProduction ? 'PRODUCTION' : 'TEST'} mode`
        : 'Moamalat not configured - set MOAMALAT_MERCHANT_ID, MOAMALAT_TERMINAL_ID, MOAMALAT_SECURE_KEY'
    };
  }
}

module.exports = new MoamalatService();