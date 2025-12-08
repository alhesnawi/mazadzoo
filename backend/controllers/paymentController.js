const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Animal = require('../models/Animal');
const { body, validationResult } = require('express-validator');
const { sendResponse, sendError, getPagination, generateTransactionId } = require('../utils/helpers');
const moamalatService = require('../services/moamalatService');

// @desc    Add funds to user balance
// @route   POST /api/payments/add-funds
// @access  Private
const addFunds = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { amount } = req.body;
    const userId = req.user.id;

    // Validate amount (minimum 1 LYD = 1000 smallest unit)
    if (amount < 1000) {
      return sendError(res, 400, 'الحد الأدنى للإيداع هو 1 دينار ليبي');
    }

    // Create payment record
    const transactionId = generateTransactionId();
    const payment = await Payment.create({
      userId,
      amount: amount / 1000, // Convert to LYD (from smallest unit)
      type: 'deposit',
      status: 'pending',
      paymentMethod: 'moamalat',
      transactionId,
      description: 'إضافة رصيد إلى المحفظة'
    });

    // Generate Moamalat payment configuration
    const paymentConfig = moamalatService.generatePaymentConfig(amount, transactionId);

    // Return config for frontend Lightbox
    sendResponse(res, 200, true, 'تم إنشاء طلب الدفع بنجاح', { 
      payment: {
        _id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status
      },
      moamalat: paymentConfig 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw funds from user balance
// @route   POST /api/payments/withdraw
// @access  Private
const withdrawFunds = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return sendError(res, 400, 'رصيدك غير كافي');
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      paymentMethod,
      transactionId: generateTransactionId(),
      description: 'سحب رصيد من المحفظة'
    });

    // Deduct from user balance
    user.balance -= amount;
    await user.save();

    // In a real implementation, you would process the withdrawal here
    // For now, we'll mark it as completed
    payment.status = 'completed';
    await payment.save();

    await payment.populate('userId', 'username email');

    sendResponse(res, 201, true, 'تم سحب الرصيد بنجاح', { payment, newBalance: user.balance });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay listing fee for animal
// @route   POST /api/payments/listing-fee/:animalId
// @access  Private
const payListingFee = async (req, res, next) => {
  try {
    const { animalId } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    const animal = await Animal.findById(animalId);
    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Check if user owns the animal
    if (animal.sellerId.toString() !== userId) {
      return sendError(res, 403, 'غير مصرح لك بدفع رسوم هذا الحيوان');
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      userId,
      animalId,
      type: 'listing_fee',
      status: 'completed'
    });

    if (existingPayment) {
      return sendError(res, 400, 'تم دفع رسوم العرض مسبقاً');
    }

    const listingFee = parseFloat(process.env.LISTING_FEE_LYD) || 10;
    const user = await User.findById(userId);

    // Check payment method
    if (paymentMethod === 'balance') {
      if (user.balance < listingFee) {
        return sendError(res, 400, `رصيدك غير كافي. تحتاج إلى ${listingFee} دينار ليبي`);
      }

      // Deduct from balance
      user.balance -= listingFee;
      await user.save();
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      animalId,
      amount: listingFee,
      type: 'listing_fee',
      status: 'completed',
      paymentMethod,
      transactionId: generateTransactionId(),
      description: 'رسوم عرض الحيوان'
    });

    // Mark animal as paid
    animal.isPaid = true;
    await animal.save();

    await payment.populate('userId', 'username email');
    await payment.populate('animalId', 'name');

    sendResponse(res, 201, true, 'تم دفع رسوم العرض بنجاح', { payment, newBalance: user.balance });
  } catch (error) {
    next(error);
  }
};

// @desc    Process final payment for won auction
// @route   POST /api/payments/final-payment/:animalId
// @access  Private
const processFinalPayment = async (req, res, next) => {
  try {
    const { animalId } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    const animal = await Animal.findById(animalId).populate('sellerId', 'username balance');
    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Check if user won the auction
    if (animal.highestBidderId.toString() !== userId || animal.status !== 'sold') {
      return sendError(res, 403, 'لم تفز بهذا المزاد');
    }

    // Check if already paid
    const existingPayment = await Payment.findOne({
      userId,
      animalId,
      type: 'final_payment',
      status: 'completed'
    });

    if (existingPayment) {
      return sendError(res, 400, 'تم دفع المبلغ النهائي مسبقاً');
    }

    const finalAmount = animal.currentBid;
    const user = await User.findById(userId);

    // Check payment method
    if (paymentMethod === 'balance') {
      if (user.balance < finalAmount) {
        return sendError(res, 400, `رصيدك غير كافي. تحتاج إلى ${finalAmount} دينار ليبي`);
      }

      // Deduct from buyer balance
      user.balance -= finalAmount;
      await user.save();
    }

    // Create payment record
    const payment = await Payment.create({
      userId,
      animalId,
      amount: finalAmount,
      type: 'final_payment',
      status: 'completed',
      paymentMethod,
      transactionId: generateTransactionId(),
      description: 'الدفع النهائي للمزاد'
    });

    // Transfer money to seller (minus platform commission)
    const platformCommission = finalAmount * 0.05; // 5% commission
    const sellerAmount = finalAmount - platformCommission;

    const seller = await User.findById(animal.sellerId._id);
    seller.balance += sellerAmount;
    await seller.save();

    // Create seller payment record
    await Payment.create({
      userId: seller._id,
      animalId,
      amount: sellerAmount,
      type: 'sale_proceeds',
      status: 'completed',
      paymentMethod: 'balance',
      transactionId: generateTransactionId(),
      description: 'عائدات بيع الحيوان'
    });

    await payment.populate('userId', 'username email');
    await payment.populate('animalId', 'name');

    sendResponse(res, 201, true, 'تم الدفع النهائي بنجاح', { 
      payment, 
      newBalance: user.balance,
      sellerReceived: sellerAmount,
      platformCommission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    const { page, limit, type, status } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    let query = { userId: req.user.id };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('animalId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments(query);

    sendResponse(res, 200, true, 'تم جلب تاريخ المدفوعات بنجاح', {
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
const getPaymentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total spent
    const totalSpent = await Payment.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: { $in: ['listing_fee', 'bidding_fee', 'final_payment'] },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total earned (for sellers)
    const totalEarned = await Payment.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: 'sale_proceeds',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total refunds
    const totalRefunds = await Payment.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: 'refund',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get current balance
    const user = await User.findById(userId);

    const stats = {
      currentBalance: user.balance,
      totalSpent: totalSpent[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0,
      totalRefunds: totalRefunds[0]?.total || 0,
      netAmount: (totalEarned[0]?.total || 0) - (totalSpent[0]?.total || 0) + (totalRefunds[0]?.total || 0)
    };

    sendResponse(res, 200, true, 'تم جلب إحصائيات المدفوعات بنجاح', { stats });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Moamalat payment webhook
// @route   POST /api/payments/webhook
// @access  Public
// @desc    Handle Moamalat webhook notifications
// @route   POST /api/payments/webhook/moamalat
// @access  Public (with signature verification)
const handlePaymentWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;

    // Verify webhook signature with Moamalat service
    const verification = moamalatService.verifyWebhookNotification(webhookData);

    if (!verification.valid) {
      return res.status(400).json({ 
        Message: 'Invalid webhook signature',
        Success: false 
      });
    }

    const { data } = verification;

    // Find payment by merchant reference (our transactionId)
    const payment = await Payment.findOne({
      transactionId: data.merchantReference
    });

    if (!payment) {
      // Return success even if payment not found (idempotency)
      return res.status(200).json({ 
        Message: 'Payment not found, but webhook accepted',
        Success: true 
      });
    }

    // Update payment with Moamalat details
    payment.gatewayTransactionId = data.networkReference;
    payment.gatewayResponse = {
      systemReference: data.systemReference,
      networkReference: data.networkReference,
      actionCode: data.actionCode,
      message: data.message,
      payerAccount: data.payerAccount,
      payerName: data.payerName,
      paidThrough: data.paidThrough,
      dateTimeLocalTrxn: data.dateTimeLocalTrxn
    };

    // Update payment status based on approval
    if (data.isApproved && payment.status === 'pending') {
      payment.status = 'completed';

      // Add funds to user balance for deposit payments
      if (payment.type === 'deposit') {
        const user = await User.findById(payment.userId);
        if (user) {
          user.balance += payment.amount;
          await user.save();
        }
      }
    } else if (!data.isApproved) {
      payment.status = 'failed';
      payment.errorMessage = data.message || 'Payment declined';
    }

    await payment.save();

    // Return Moamalat expected response format
    return res.status(200).json({ 
      Message: 'Success', 
      Success: true 
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return success to prevent Moamalat retries on our errors
    return res.status(200).json({ 
      Message: 'Error processed', 
      Success: true 
    });
  }
};

// @desc    Process refund (Admin only)
// @route   POST /api/payments/:paymentId/refund
// @access  Private (Admin)
const processRefund = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بمعالجة الاستردادات');
    }

    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return sendError(res, 404, 'المعاملة غير موجودة');
    }

    if (payment.status === 'refunded') {
      return sendError(res, 400, 'تم استرداد هذه المعاملة مسبقاً');
    }

    if (payment.status !== 'completed') {
      return sendError(res, 400, 'لا يمكن استرداد معاملة غير مكتملة');
    }

    // Process refund
    payment.processRefund(reason);
    payment.processedBy = req.user.id;
    await payment.save();

    // Add refund amount to user balance
    const user = await User.findById(payment.userId);
    user.balance += payment.amount;
    await user.save();

    // Create refund payment record
    const refundPayment = await Payment.create({
      userId: payment.userId,
      animalId: payment.animalId,
      amount: payment.amount,
      type: 'refund',
      status: 'completed',
      paymentMethod: 'balance',
      transactionId: generateTransactionId(),
      description: `استرداد: ${payment.description}`,
      refundReason: reason
    });

    await refundPayment.populate('userId', 'username email');

    sendResponse(res, 200, true, 'تم معالجة الاسترداد بنجاح', { 
      originalPayment: payment, 
      refundPayment,
      newUserBalance: user.balance
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const addFundsValidation = [
  body('amount')
    .isInt({ min: 1000 })
    .withMessage('المبلغ يجب أن يكون 1000 على الأقل (1 دينار ليبي)')
];

const withdrawFundsValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('المبلغ يجب أن يكون أكبر من صفر'),
  body('paymentMethod')
    .isIn(['bank_transfer', 'e_wallet'])
    .withMessage('طريقة السحب غير صحيحة')
];

const paymentMethodValidation = [
  body('paymentMethod')
    .isIn(['balance', 'card', 'e_wallet', 'bank_transfer'])
    .withMessage('طريقة الدفع غير صحيحة')
];

module.exports = {
  addFunds,
  withdrawFunds,
  payListingFee,
  processFinalPayment,
  getPaymentHistory,
  getPaymentStats,
  processRefund,
  handlePaymentWebhook,
  addFundsValidation,
  withdrawFundsValidation,
  paymentMethodValidation
};

