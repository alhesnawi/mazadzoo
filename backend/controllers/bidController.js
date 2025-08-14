const Bid = require('../models/Bid');
const Animal = require('../models/Animal');
const User = require('../models/User');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { sendResponse, sendError, getPagination, generateTransactionId } = require('../utils/helpers');

// @desc    Place a bid on an animal
// @route   POST /api/bids
// @access  Private
const placeBid = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const { animalId, bidAmount, maxAutoBidAmount } = req.body;
    const bidderId = req.user.id;

    // Get animal
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Check if auction is active
    if (animal.status !== 'active') {
      return sendError(res, 400, 'المزاد غير نشط');
    }

    // Check if auction has ended
    if (new Date() > animal.auctionEndTime) {
      return sendError(res, 400, 'انتهى وقت المزاد');
    }

    // Check if user is not the seller
    if (animal.sellerId.toString() === bidderId) {
      return sendError(res, 400, 'لا يمكنك المزايدة على حيوانك الخاص');
    }

    // Check if bid amount is higher than current bid
    if (bidAmount <= animal.currentBid) {
      return sendError(res, 400, `يجب أن تكون المزايدة أكبر من ${animal.currentBid} دينار ليبي`);
    }

    // Check if user has sufficient balance for bidding fee
    const user = await User.findById(bidderId);
    const biddingFee = parseFloat(process.env.BIDDING_FEE_LYD) || 40;
    
    if (user.balance < biddingFee) {
      return sendError(res, 400, `رصيدك غير كافي. تحتاج إلى ${biddingFee} دينار ليبي كرسوم مزايدة`);
    }

    // Check for buy it now
    if (animal.buyItNowPrice && bidAmount >= animal.buyItNowPrice) {
      // Instant purchase
      animal.currentBid = animal.buyItNowPrice;
      animal.highestBidderId = bidderId;
      animal.status = 'sold';
      animal.bidCount += 1;
      await animal.save();

      // Create the winning bid
      const bid = await Bid.create({
        animalId,
        bidderId,
        bidAmount: animal.buyItNowPrice,
        isWinningBid: true
      });

      // Deduct bidding fee
      user.balance -= biddingFee;
      await user.save();

      // Create payment record for bidding fee
      await Payment.create({
        userId: bidderId,
        animalId,
        amount: biddingFee,
        type: 'bidding_fee',
        status: 'completed',
        paymentMethod: 'balance',
        transactionId: generateTransactionId(),
        description: 'رسوم المزايدة - شراء فوري'
      });

      await bid.populate('bidderId', 'username');
      await bid.populate('animalId', 'name');

      return sendResponse(res, 201, true, 'تم شراء الحيوان فوراً!', { bid, animal });
    }

    // Regular bid
    const previousHighestBidderId = animal.highestBidderId;

    // Update animal with new bid
    const bidPlaced = animal.placeBid(bidderId, bidAmount);
    if (!bidPlaced) {
      return sendError(res, 400, 'فشل في وضع المزايدة');
    }

    await animal.save();

    // Create bid record
    const bid = await Bid.create({
      animalId,
      bidderId,
      bidAmount,
      maxAutoBidAmount: maxAutoBidAmount || null,
      isAutoBid: !!maxAutoBidAmount
    });

    // Deduct bidding fee from user balance
    user.balance -= biddingFee;
    await user.save();

    // Create payment record for bidding fee
    await Payment.create({
      userId: bidderId,
      animalId,
      amount: biddingFee,
      type: 'bidding_fee',
      status: 'completed',
      paymentMethod: 'balance',
      transactionId: generateTransactionId(),
      description: 'رسوم المزايدة'
    });

    // Refund previous highest bidder if exists
    if (previousHighestBidderId && previousHighestBidderId.toString() !== bidderId) {
      const previousBidder = await User.findById(previousHighestBidderId);
      if (previousBidder) {
        previousBidder.balance += biddingFee;
        await previousBidder.save();

        // Create refund payment record
        await Payment.create({
          userId: previousHighestBidderId,
          animalId,
          amount: biddingFee,
          type: 'refund',
          status: 'completed',
          paymentMethod: 'balance',
          transactionId: generateTransactionId(),
          description: 'استرداد رسوم المزايدة'
        });
      }
    }

    await bid.populate('bidderId', 'username');
    await bid.populate('animalId', 'name');

    sendResponse(res, 201, true, 'تم وضع المزايدة بنجاح', { bid, animal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bids for an animal
// @route   GET /api/bids/animal/:animalId
// @access  Public
const getAnimalBids = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    const bids = await Bid.find({ animalId: req.params.animalId })
      .populate('bidderId', 'username')
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Bid.countDocuments({ animalId: req.params.animalId });

    sendResponse(res, 200, true, 'تم جلب المزايدات بنجاح', {
      bids,
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

// @desc    Get user's bids
// @route   GET /api/bids/my-bids
// @access  Private
const getUserBids = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    let query = { bidderId: req.user.id };

    // Filter by status if provided
    if (status) {
      const animals = await Animal.find({ status }).select('_id');
      const animalIds = animals.map(animal => animal._id);
      query.animalId = { $in: animalIds };
    }

    const bids = await Bid.find(query)
      .populate('animalId', 'name status currentBid auctionEndTime images')
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Bid.countDocuments(query);

    sendResponse(res, 200, true, 'تم جلب مزايداتك بنجاح', {
      bids,
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

// @desc    Get bid statistics
// @route   GET /api/bids/stats
// @access  Private
const getBidStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total bids by user
    const totalBids = await Bid.countDocuments({ bidderId: userId });

    // Get winning bids
    const winningBids = await Bid.countDocuments({ 
      bidderId: userId, 
      isWinningBid: true 
    });

    // Get active bids (on active auctions)
    const activeAnimals = await Animal.find({ status: 'active' }).select('_id');
    const activeAnimalIds = activeAnimals.map(animal => animal._id);
    const activeBids = await Bid.countDocuments({ 
      bidderId: userId, 
      animalId: { $in: activeAnimalIds } 
    });

    // Get total amount spent on bidding fees
    const totalSpent = await Payment.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          type: 'bidding_fee',
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

    const stats = {
      totalBids,
      winningBids,
      activeBids,
      totalSpent: totalSpent[0]?.total || 0,
      winRate: totalBids > 0 ? ((winningBids / totalBids) * 100).toFixed(2) : 0
    };

    sendResponse(res, 200, true, 'تم جلب إحصائيات المزايدات بنجاح', { stats });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const placeBidValidation = [
  body('animalId')
    .isMongoId()
    .withMessage('معرف الحيوان غير صحيح'),
  body('bidAmount')
    .isFloat({ min: 1 })
    .withMessage('مبلغ المزايدة يجب أن يكون أكبر من صفر'),
  body('maxAutoBidAmount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('الحد الأقصى للمزايدة التلقائية يجب أن يكون أكبر من صفر')
];

module.exports = {
  placeBid,
  getAnimalBids,
  getUserBids,
  getBidStats,
  placeBidValidation
};

