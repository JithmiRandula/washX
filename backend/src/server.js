const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// Load environment variables FIRST before requiring other modules
dotenv.config();

// Now require modules that depend on environment variables
const connectDB = require('./config/database');
const passport = require('./config/passport');

// Connect to database
connectDB();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/providers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Session configuration (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'washx-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/providers', require('./routes/provider.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WashX API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 WashX Backend Server`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  
  const googleClientID = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const googleConfigured = googleClientID && 
                          googleClientSecret &&
                          googleClientID.length > 20 &&
                          /^\d/.test(googleClientID) && // Real client IDs start with numbers
                          googleClientSecret.startsWith('GOCSPX-'); // Real secrets start with GOCSPX-
  
  if (googleConfigured) {
    console.log(`🔐 Google OAuth: ✅ Configured`);
  } else {
    console.log(`🔐 Google OAuth: ⚠️  NOT CONFIGURED`);
    console.log(`   ⚠️  To enable Google login:`);
    console.log(`   1. Get credentials from https://console.cloud.google.com/`);
    console.log(`   2. Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env`);
    console.log(`   3. Restart server`);
    console.log(`   📖 See SETUP_NOW.md for detailed instructions`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
});
