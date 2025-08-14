const Animal = require('../models/Animal');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { sendResponse, sendError, getPagination, generateTransactionId } = require('../utils/helpers');

// @desc    Get all animals with filters and pagination
// @route   GET /api/animals
// @access  Public
const getAnimals = async (req, res, next) => {
  try {
    const { page, limit, category, status, search, sortBy, sortOrder } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    // Build query
    let query = {};

    // Filter by category
    if (category && category !== 'جميع الفئات') {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Default to active auctions for public view
      query.status = { $in: ['active', 'pending'] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute query
    const animals = await Animal.find(query)
      .populate('sellerId', 'username rating totalRatings')
      .populate('highestBidderId', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Animal.countDocuments(query);

    sendResponse(res, 200, true, 'تم جلب الحيوانات بنجاح', {
      animals,
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

// @desc    Get single animal by ID
// @route   GET /api/animals/:id
// @access  Public
const getAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.id)
      .populate('sellerId', 'username rating totalRatings profilePicture address city')
      .populate('highestBidderId', 'username')
      .populate({
        path: 'bids',
        populate: {
          path: 'bidderId',
          select: 'username'
        },
        options: { sort: { bidTime: -1 }, limit: 10 }
      });

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Increment view count if not the owner
    if (!req.user || req.user.id !== animal.sellerId._id.toString()) {
      animal.views += 1;
      await animal.save({ validateBeforeSave: false });
    }

    sendResponse(res, 200, true, 'تم جلب بيانات الحيوان بنجاح', { animal });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new animal listing
// @route   POST /api/animals
// @access  Private (Seller)
const createAnimal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    // Check if user can sell
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بإضافة حيوانات للبيع');
    }

    // Process uploaded files
    const images = req.files?.images?.map(file => file.path) || [];
    const video = req.files?.video?.[0]?.path;
    const healthCertificate = req.files?.healthCertificate?.[0]?.path;

    // Validate required files
    if (images.length < 3) {
      return sendError(res, 400, 'يجب رفع 3 صور على الأقل');
    }
    if (!video) {
      return sendError(res, 400, 'فيديو الحيوان مطلوب');
    }
    if (!healthCertificate) {
      return sendError(res, 400, 'الشهادة الصحية مطلوبة');
    }

    const animalData = {
      ...req.body,
      sellerId: req.user.id,
      images,
      video,
      healthCertificate
    };

    const animal = await Animal.create(animalData);

    // Populate seller info
    await animal.populate('sellerId', 'username rating totalRatings');

    sendResponse(res, 201, true, 'تم إضافة الحيوان بنجاح. في انتظار الموافقة', { animal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update animal listing
// @route   PUT /api/animals/:id
// @access  Private (Owner or Admin)
const updateAnimal = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'بيانات غير صحيحة', errors.array());
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Check ownership or admin
    if (animal.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بتعديل هذا الحيوان');
    }

    // Don't allow updates if auction is active
    if (animal.status === 'active') {
      return sendError(res, 400, 'لا يمكن تعديل الحيوان أثناء المزاد النشط');
    }

    // Process new uploaded files if any
    if (req.files?.images) {
      req.body.images = req.files.images.map(file => file.path);
    }
    if (req.files?.video) {
      req.body.video = req.files.video[0].path;
    }
    if (req.files?.healthCertificate) {
      req.body.healthCertificate = req.files.healthCertificate[0].path;
    }

    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sellerId', 'username rating totalRatings');

    sendResponse(res, 200, true, 'تم تحديث بيانات الحيوان بنجاح', { animal: updatedAnimal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete animal listing
// @route   DELETE /api/animals/:id
// @access  Private (Owner or Admin)
const deleteAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    // Check ownership or admin
    if (animal.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بحذف هذا الحيوان');
    }

    // Don't allow deletion if auction is active or has bids
    if (animal.status === 'active' || animal.bidCount > 0) {
      return sendError(res, 400, 'لا يمكن حذف الحيوان أثناء المزاد النشط أو إذا كان هناك مزايدات');
    }

    await Animal.findByIdAndDelete(req.params.id);

    sendResponse(res, 200, true, 'تم حذف الحيوان بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Start auction for animal
// @route   POST /api/animals/:id/start-auction
// @access  Private (Admin)
const startAuction = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك ببدء المزادات');
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    if (animal.status !== 'pending' || !animal.isApproved) {
      return sendError(res, 400, 'الحيوان غير مؤهل لبدء المزاد');
    }

    // Start the auction
    animal.startAuction();
    await animal.save();

    sendResponse(res, 200, true, 'تم بدء المزاد بنجاح', { animal });
  } catch (error) {
    next(error);
  }
};

// @desc    End auction for animal
// @route   POST /api/animals/:id/end-auction
// @access  Private (Admin)
const endAuction = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'غير مصرح لك بإنهاء المزادات');
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    if (animal.status !== 'active') {
      return sendError(res, 400, 'المزاد غير نشط');
    }

    // End the auction
    animal.endAuction();
    await animal.save();

    sendResponse(res, 200, true, 'تم إنهاء المزاد بنجاح', { animal });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Remove animal from watchlist
// @route   POST /api/animals/:id/watchlist
// @access  Private
const toggleWatchlist = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return sendError(res, 404, 'الحيوان غير موجود');
    }

    const userId = req.user.id;
    const isInWatchlist = animal.watchlist.includes(userId);

    if (isInWatchlist) {
      // Remove from watchlist
      animal.watchlist = animal.watchlist.filter(id => id.toString() !== userId);
      await animal.save();
      sendResponse(res, 200, true, 'تم إزالة الحيوان من المفضلة');
    } else {
      // Add to watchlist
      animal.watchlist.push(userId);
      await animal.save();
      sendResponse(res, 200, true, 'تم إضافة الحيوان إلى المفضلة');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's watchlist
// @route   GET /api/animals/watchlist
// @access  Private
const getWatchlist = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPagination(page, limit);

    const animals = await Animal.find({ watchlist: req.user.id })
      .populate('sellerId', 'username rating totalRatings')
      .populate('highestBidderId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Animal.countDocuments({ watchlist: req.user.id });

    sendResponse(res, 200, true, 'تم جلب المفضلة بنجاح', {
      animals,
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

// Validation rules
const createAnimalValidation = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('اسم الحيوان يجب أن يكون بين 3 و 100 حرف'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('الوصف يجب أن يكون بين 10 و 1000 حرف'),
  body('category')
    .isIn(['طيور', 'زواحف', 'ثدييات', 'أسماك', 'حشرات', 'أخرى'])
    .withMessage('فئة الحيوان غير صحيحة'),
  body('type')
    .isLength({ min: 2, max: 50 })
    .withMessage('نوع الحيوان يجب أن يكون بين 2 و 50 حرف'),
  body('age')
    .notEmpty()
    .withMessage('عمر الحيوان مطلوب'),
  body('gender')
    .isIn(['ذكر', 'أنثى', 'غير محدد'])
    .withMessage('جنس الحيوان غير صحيح'),
  body('healthCondition')
    .isIn(['ممتاز', 'جيد جداً', 'جيد', 'يحتاج رعاية', 'مريض'])
    .withMessage('الحالة الصحية غير صحيحة'),
  body('startPrice')
    .isFloat({ min: 1 })
    .withMessage('سعر الافتتاح يجب أن يكون أكبر من صفر'),
  body('reservePrice')
    .isFloat({ min: 1 })
    .withMessage('سعر التحفظ يجب أن يكون أكبر من صفر'),
  body('buyItNowPrice')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('سعر الشراء الفوري يجب أن يكون أكبر من صفر')
];

const updateAnimalValidation = [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('اسم الحيوان يجب أن يكون بين 3 و 100 حرف'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('الوصف يجب أن يكون بين 10 و 1000 حرف'),
  body('category')
    .optional()
    .isIn(['طيور', 'زواحف', 'ثدييات', 'أسماك', 'حشرات', 'أخرى'])
    .withMessage('فئة الحيوان غير صحيحة'),
  body('healthCondition')
    .optional()
    .isIn(['ممتاز', 'جيد جداً', 'جيد', 'يحتاج رعاية', 'مريض'])
    .withMessage('الحالة الصحية غير صحيحة')
];

module.exports = {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  startAuction,
  endAuction,
  toggleWatchlist,
  getWatchlist,
  createAnimalValidation,
  updateAnimalValidation
};

