# Quick Start Guide - Google OAuth

## Fastest Way to Get Started

### 1. Get Google Credentials (5 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Add these URIs:
   - **Authorized JavaScript origins:** `http://localhost:5173`
   - **Authorized redirect URIs:** `http://localhost:5001/api/auth/google/callback`
6. Copy your Client ID and Client Secret

### 2. Configure Backend

Create `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/washx
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
SESSION_SECRET=your-session-secret-key
FRONTEND_URL=http://localhost:5173

# Add your Google credentials here
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### 3. Configure Frontend

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001
```

### 4. Restart Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Test It!

1. Open http://localhost:5173/login
2. Click the "Google" button
3. Sign in with your Google account
4. You should be logged in! 🎉

## That's It!

The implementation handles:
- ✅ New user registration
- ✅ Existing user login
- ✅ Account linking
- ✅ Token generation
- ✅ Role-based routing
- ✅ Error handling

## Need Help?

- Full setup guide: `GOOGLE_OAUTH_SETUP.md`
- Implementation details: `GOOGLE_OAUTH_IMPLEMENTATION.md`

## Common Issues

**"Redirect URI mismatch"**
→ Make sure the callback URL in Google Console is exactly: `http://localhost:5001/api/auth/google/callback`

**"Invalid client"**
→ Check that your Client ID and Secret are correct in `.env` (no quotes, no spaces)

**Button doesn't work**
→ Check that `VITE_API_URL=http://localhost:5001` is set in frontend/.env
