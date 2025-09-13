const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Animal = require('../models/Animal');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Create new chat
const createChat = async (req, res) => {
  try {
    const { animalId, sellerId } = req.body;
    const buyerId = req.user.id;

    // Check if animal exists
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'الحيوان غير موجود'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      animalId,
      participants: { $all: [buyerId, sellerId] }
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        data: existingChat
      });
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [buyerId, sellerId],
      animalId
    });

    await chat.populate('participants', 'username profilePicture');
    await chat.populate('animal', 'name images');

    res.status(201).json({
      success: true,
      data: chat
    });

  } catch (error) {
    logger.error('Create chat error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المحادثة'
    });
  }
};

// Get user chats
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const chats = await Chat.find({
      participants: userId,
      status: 'active'
    })
    .populate('participants', 'username profilePicture')
    .populate('animal', 'name images status')
    .populate('lastMessage')
    .sort({ lastMessageTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Chat.countDocuments({
      participants: userId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get chats error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحادثات'
    });
  }
};

// Get single chat
const getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    })
    .populate('participants', 'username profilePicture')
    .populate('animal', 'name images status');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    logger.error('Get chat error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحادثة'
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { content, type = 'text', replyTo } = req.body;
    const senderId = req.user.id;

    // Check if chat exists and user is participant
    const chat = await Chat.findOne({
      _id: id,
      participants: senderId,
      status: 'active'
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة أو محظورة'
      });
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/chats/${file.filename}`
      }));
    }

    // Create message
    const message = await Message.create({
      chatId: id,
      senderId,
      content,
      type,
      attachments,
      replyTo
    });

    await message.populate('sender', 'username profilePicture');
    if (replyTo) {
      await message.populate('replyTo');
    }

    // Update chat
    chat.lastMessage = message._id;
    chat.lastMessageTime = new Date();
    
    // Update unread count for other participant
    const otherParticipant = chat.participants.find(p => p.toString() !== senderId);
    const userRole = chat.participants[0].toString() === senderId ? 'seller' : 'buyer';
    chat.unreadCount[userRole]++;
    
    await chat.save();

    // Emit real-time message
    if (req.socketUtils) {
      req.socketUtils.getIO().to(`chat-${id}`).emit('new-message', {
        message,
        chatId: id
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    logger.error('Send message error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال الرسالة'
    });
  }
};

// Get messages
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Check if user is participant
    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    const messages = await Message.find({ chatId: id })
      .populate('sender', 'username profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ chatId: id });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get messages error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الرسائل'
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    // Mark unread messages as read
    await Message.updateMany(
      {
        chatId: id,
        senderId: { $ne: userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Reset unread count
    chat.markAsRead(userId);
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'تم تعليم الرسائل كمقروءة'
    });

  } catch (error) {
    logger.error('Mark as read error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في تعليم الرسائل كمقروءة'
    });
  }
};

// Delete chat
const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    chat.status = 'closed';
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'تم حذف المحادثة'
    });

  } catch (error) {
    logger.error('Delete chat error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المحادثة'
    });
  }
};

// Block chat
const blockChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: id,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    chat.status = 'blocked';
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'تم حظر المحادثة'
    });

  } catch (error) {
    logger.error('Block chat error:', { error: error.message, userId: req.user.id });
    res.status(500).json({
      success: false,
      message: 'خطأ في حظر المحادثة'
    });
  }
};

// Validation middleware
const sendMessageValidation = [
  body('content')
    .notEmpty()
    .withMessage('محتوى الرسالة مطلوب')
    .isLength({ max: 1000 })
    .withMessage('الرسالة يجب أن تكون 1000 حرف على الأكثر'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('نوع الرسالة غير صحيح')
];

module.exports = {
  createChat,
  getChats,
  getChat,
  sendMessage,
  getMessages,
  markAsRead,
  deleteChat,
  blockChat,
  sendMessageValidation
};