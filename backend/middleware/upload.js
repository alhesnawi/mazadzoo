const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/environment');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'images') {
      uploadPath += 'images/';
    } else if (file.fieldname === 'video') {
      uploadPath += 'videos/';
    } else if (file.fieldname === 'healthCertificate') {
      uploadPath += 'certificates/';
    } else if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'attachments') {
      uploadPath += 'chats/';
    } else {
      uploadPath += 'others/';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور'), false);
    }
  } else if (file.fieldname === 'video') {
    // Allow only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الفيديو'), false);
    }
  } else if (file.fieldname === 'healthCertificate') {
    // Allow PDF and image files
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات PDF أو الصور للشهادة الصحية'), false);
    }
  } else if (file.fieldname === 'profilePicture') {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور لصورة الملف الشخصي'), false);
    }
  } else if (file.fieldname === 'attachments') {
    // السماح بالصور والملفات النصية والمستندات
    const allowedTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم في الدردشة'), false);
    }
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

// Multer configuration with improved limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for videos
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Configuration for images only (smaller limit)
const uploadImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for images
    files: 6
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور'), false);
    }
  }
});

// Upload configurations for different endpoints
const uploadAnimalFiles = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'video', maxCount: 1 },
  { name: 'healthCertificate', maxCount: 1 }
]);

const uploadProfilePicture = upload.single('profilePicture');

// إضافة دالة رفع ملفات الدردشة
const uploadChatFiles = upload.array('attachments', 5); // السماح برفع 5 ملفات كحد أقصى

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات كبير جداً'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير متوقع'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadAnimalFiles,
  uploadProfilePicture,
  uploadChatFiles,
  handleMulterError
};

