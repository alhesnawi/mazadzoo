const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const config = require('./config/environment');

// Import utilities and middleware
const connectDB = require('./utils/database');
const errorHandler = require('./middleware/error');
const { initializeSocket } = require('./utils/socket');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const bidRoutes = require('./routes/bids');
const paymentRoutes = require('./routes/payments');
const chatRoutes = require('./routes/chats');
const notificationRoutes = require('./routes/notifications');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy for Replit environment
app.set('trust proxy', 1);

// Initialize Socket.IO
const socketUtils = initializeSocket(server);

// Security middleware
app.use(helmet());

// CORS configuration - Allow all localhost ports for development and Replit domains
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    // Allow Replit domains
    if (origin.match(/^https:\/\/.*\.replit\.dev$/)) {
      return callback(null, true);
    }

    // Allow specific origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً'
  }
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make socket utils available to routes
app.use((req, res, next) => {
  req.socketUtils = socketUtils;
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بشكل طبيعي',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.PORT;

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`, { 
    port: PORT, 
    environment: config.NODE_ENV, 
    corsOrigin: config.SOCKET_CORS_ORIGIN 
  });
  logger.info('Socket.IO server initialized');
  logger.info(`CORS origin: ${config.SOCKET_CORS_ORIGIN}`, { corsOrigin: config.SOCKET_CORS_ORIGIN });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`, { error: err.message, stack: err.stack });
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { error: err.message, stack: err.stack });
  logger.error('Shutting down the server due to uncaught exception');
  process.exit(1);
});

module.exports = app;

