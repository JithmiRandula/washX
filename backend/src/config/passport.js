const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Check if real credentials are provided (not placeholders)
const isRealClientID = googleClientID && 
                      googleClientID.length > 20 && 
                      /^\d/.test(googleClientID); // Real client IDs start with numbers

const isRealSecret = googleClientSecret && 
                    googleClientSecret.length > 20 &&
                    googleClientSecret.startsWith('GOCSPX-'); // Real secrets start with GOCSPX-

if (isRealClientID && isRealSecret) {
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists in our database
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if user exists with the same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos[0]?.value;
            user.isVerified = true; // Google accounts are verified
            await user.save();
            return done(null, user);
          }

          // Create new user
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value || '',
            isVerified: true, // Google accounts are verified
            role: 'customer' // Default role
          });

          return done(null, newUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
  )
);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  console.log('✅ Google OAuth configured successfully');
} else {
  console.log('⚠️  Google OAuth NOT configured - Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env');
  console.log('📖 See SETUP_NOW.md for instructions');
}

module.exports = passport;
