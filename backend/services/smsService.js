const axios = require('axios');
const logger = require('../utils/logger');

/**
 * خدمة إرسال الرسائل النصية عبر iSend
 * iSend SMS Service for Libya
 * API Documentation: https://isend.com.ly/api/v3/sms/send
 */

class SMSService {
  constructor() {
    this.apiUrl = process.env.ISEND_API_URL || 'https://isend.com.ly/api/v3/sms/send';
    this.apiToken = process.env.ISEND_API_TOKEN;
    this.senderId = process.env.ISEND_SENDER_ID || 'MazadZoo';
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  /**
   * إرسال رسالة نصية
   * @param {string} phoneNumber - رقم الهاتف (218XXXXXXXXX)
   * @param {string} message - نص الرسالة
   * @returns {Promise<Object>} نتيجة الإرسال
   */
  async sendSMS(phoneNumber, message) {
    try {
      // إذا كانت الخدمة غير مفعلة، نسجل في logs فقط
      if (!this.enabled) {
        logger.info('[SMS - DEV MODE] SMS not sent (service disabled)', {
          phoneNumber,
          message
        });
        return {
          success: true,
          message: 'SMS service disabled in development',
          dev: true
        };
      }

      // التحقق من وجود API Token
      if (!this.apiToken) {
        logger.error('SMS API Token not configured');
        throw new Error('SMS service not properly configured');
      }

      // تنسيق رقم الهاتف (إزالة + وأي مسافات)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // إعداد البيانات
      const payload = {
        recipient: formattedPhone,
        message: message,
        sender_id: this.senderId,
        type: 'unicode' // لدعم اللغة العربية
      };

      logger.info('Sending SMS via iSend', {
        recipient: formattedPhone,
        messageLength: message.length
      });

      // إرسال الطلب
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      logger.info('SMS sent successfully', {
        recipient: formattedPhone,
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        message: 'SMS sent successfully',
        data: response.data
      };

    } catch (error) {
      logger.error('Failed to send SMS', {
        phoneNumber,
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      // في حالة الخطأ، لا نفشل التسجيل - فقط نسجل الخطأ
      return {
        success: false,
        message: 'Failed to send SMS',
        error: error.message
      };
    }
  }

  /**
   * إرسال رمز التحقق
   * @param {string} phoneNumber - رقم الهاتف
   * @param {string} code - رمز التحقق
   */
  async sendVerificationCode(phoneNumber, code) {
    const message = `رمز التحقق الخاص بك في مزاد الحيوانات هو: ${code}\nالرمز صالح لمدة 10 دقائق.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * إرسال إشعار مزايدة جديدة
   * @param {string} phoneNumber - رقم الهاتف
   * @param {string} animalName - اسم الحيوان
   * @param {number} bidAmount - مبلغ المزايدة
   */
  async sendBidNotification(phoneNumber, animalName, bidAmount) {
    const message = `مزايدة جديدة على ${animalName}!\nالمبلغ: ${bidAmount} دينار ليبي`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * إرسال إشعار فوز بالمزاد
   * @param {string} phoneNumber - رقم الهاتف
   * @param {string} animalName - اسم الحيوان
   * @param {number} finalPrice - السعر النهائي
   */
  async sendAuctionWinNotification(phoneNumber, animalName, finalPrice) {
    const message = `تهانينا! فزت بمزاد ${animalName}\nالسعر النهائي: ${finalPrice} دينار ليبي\nيرجى إتمام الدفع خلال 24 ساعة.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * إرسال إشعار انتهاء المزاد للبائع
   * @param {string} phoneNumber - رقم الهاتف
   * @param {string} animalName - اسم الحيوان
   * @param {number} finalPrice - السعر النهائي
   * @param {string} winnerName - اسم الفائز
   */
  async sendAuctionEndNotification(phoneNumber, animalName, finalPrice, winnerName) {
    const message = `انتهى مزاد ${animalName}\nالسعر النهائي: ${finalPrice} دينار\nالفائز: ${winnerName}`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * إرسال إشعار دفعة جديدة
   * @param {string} phoneNumber - رقم الهاتف
   * @param {number} amount - المبلغ
   * @param {string} type - نوع الدفعة
   */
  async sendPaymentNotification(phoneNumber, amount, type) {
    const typeText = type === 'deposit' ? 'إيداع' : type === 'withdrawal' ? 'سحب' : 'دفعة';
    const message = `تم ${typeText} ${amount} دينار ليبي في محفظتك بنجاح.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * تنسيق رقم الهاتف
   * @param {string} phoneNumber - رقم الهاتف
   * @returns {string} رقم منسق (218XXXXXXXXX)
   */
  formatPhoneNumber(phoneNumber) {
    // إزالة + ومسافات وأقواس
    let formatted = phoneNumber.replace(/[\s+()-]/g, '');
    
    // إذا كان يبدأ بـ 0، استبدله بـ 218
    if (formatted.startsWith('0')) {
      formatted = '218' + formatted.substring(1);
    }
    
    // إذا لم يبدأ بـ 218، أضفه
    if (!formatted.startsWith('218')) {
      formatted = '218' + formatted;
    }
    
    return formatted;
  }

  /**
   * اختبار الاتصال بخدمة SMS
   */
  async testConnection() {
    try {
      if (!this.enabled) {
        return {
          success: true,
          message: 'SMS service is disabled',
          configured: false
        };
      }

      if (!this.apiToken) {
        return {
          success: false,
          message: 'SMS API Token not configured',
          configured: false
        };
      }

      return {
        success: true,
        message: 'SMS service is configured',
        configured: true,
        apiUrl: this.apiUrl,
        senderId: this.senderId
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        configured: false
      };
    }
  }
}

// تصدير instance واحد
module.exports = new SMSService();
