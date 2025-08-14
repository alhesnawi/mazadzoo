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

// Import routes
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const bidRoutes = require('./routes/bids');
const paymentRoutes = require('./routes/payments');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const socketUtils = initializeSocket(server);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.SOCKET_CORS_ORIGIN,
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
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
  console.log(`CORS origin: ${config.SOCKET_CORS_ORIGIN}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

module.exports = app;

