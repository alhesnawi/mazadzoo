const express = require('express');
const {
  createChat,
  getChats,
  getChat,
  sendMessage,
  getMessages,
  markAsRead,
  deleteChat,
  blockChat,
  sendMessageValidation
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadChatFiles, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Chat routes
router.post('/', createChat);
router.get('/', getChats);
router.get('/:id', getChat);
router.delete('/:id', deleteChat);
router.post('/:id/block', blockChat);

// Message routes
router.post('/:id/messages', uploadChatFiles, handleMulterError, sendMessageValidation, sendMessage);
router.get('/:id/messages', getMessages);
router.post('/:id/mark-read', markAsRead);

module.exports = router;