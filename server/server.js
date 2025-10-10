const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import services
const emailService = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const creatorRoutes = require('./routes/creators');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscriptions');
const profileRoutes = require('./routes/profile');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');


const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fanview API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server (robust with error handling)
const server = app.listen(PORT, () => {
  console.log(`🚀 Fanview API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`💳 PayPal Plan ID: ${process.env.PAYPAL_PLAN_ID || 'Not configured'}`);

  // Initialize email service after server is listening
  (async () => {
    try {
      const isEmailConnected = await emailService.verifyConnection();
      if (isEmailConnected) {
        console.log('📧 Email service initialized successfully');
      } else {
        console.log('⚠️ Email service initialization failed, but server will continue');
      }
    } catch (error) {
      console.log('❌ Email service error:', error && error.message ? error.message : error);
      console.log('⚠️ Server will continue without email service');
    }
  })();
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the process using this port or change PORT in your .env.`);
    console.error('You can run (Windows PowerShell):');
    console.error(`  Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess`);
    console.error('Then stop it with:');
    console.error('  Stop-Process -Id <PID> -Force');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

module.exports = app;