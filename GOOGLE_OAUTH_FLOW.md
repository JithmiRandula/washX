# 🔐 Google OAuth Flow - Visual Guide

## Complete Authentication Flow with Port 5001

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "GOOGLE" BUTTON                      │
│                  on http://localhost:5173/login                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend redirects to:                                             │
│  http://localhost:5001/api/auth/google                              │
│                                                                      │
│  (Backend Express Server - Port 5001)                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend (Passport) redirects to:                                   │
│  https://accounts.google.com/o/oauth2/v2/auth?                      │
│    client_id=YOUR_CLIENT_ID                                         │
│    redirect_uri=http://localhost:5001/api/auth/google/callback      │
│    scope=profile email                                              │
│                                                                      │
│  (Google's OAuth Server)                                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GOOGLE LOGIN PAGE                                │
│  User enters email and password                                     │
│  User grants permission to WashX                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Google redirects back to:                                          │
│  http://localhost:5001/api/auth/google/callback?code=AUTH_CODE      │
│                                                                      │
│  (Backend receives authorization code)                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend (Passport):                                                │
│  1. Exchanges code for access token with Google                     │
│  2. Gets user profile from Google                                   │
│  3. Checks if user exists in MongoDB:                               │
│     - If exists: Login user                                         │
│     - If not: Create new user                                       │
│  4. Generates JWT token                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Backend redirects to:                                              │
│  http://localhost:5173/auth/google/callback?                        │
│    token=JWT_TOKEN&                                                 │
│    userId=USER_ID&                                                  │
│    role=customer                                                    │
│                                                                      │
│  (Frontend callback page)                                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend (GoogleCallback component):                               │
│  1. Extracts token, userId, role from URL                           │
│  2. Calls googleLogin() in AuthContext                              │
│  3. Fetches full user data from /api/auth/me                        │
│  4. Stores user in localStorage                                     │
│  5. Updates authentication state                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend redirects based on role:                                  │
│  - Admin    → http://localhost:5173/admin/dashboard                 │
│  - Provider → http://localhost:5173/provider/dashboard              │
│  - Customer → http://localhost:5173/customer/dashboard              │
│                                                                      │
│  ✅ USER IS NOW LOGGED IN!                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## Key URLs and Ports

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | `http://localhost:5173` | React app (Vite) |
| Backend API | `http://localhost:5001/api/*` | Express REST API |
| Google OAuth Start | `http://localhost:5001/api/auth/google` | Initiates OAuth |
| Google Callback | `http://localhost:5001/api/auth/google/callback` | Receives OAuth response |
| Frontend Callback | `http://localhost:5173/auth/google/callback` | Completes login |

## What Happens in the Database

```
┌─────────────────────────────────────────────────────────────────────┐
│  MongoDB: washx database → users collection                         │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: NEW USER (doesn't exist)
────────────────────────────────────
Google returns: {
  id: "1234567890",
  name: "John Doe",
  email: "john@gmail.com",
  picture: "https://..."
}

Database creates:
{
  googleId: "1234567890",
  name: "John Doe",
  email: "john@gmail.com",
  avatar: "https://...",
  role: "customer",
  isVerified: true,
  createdAt: "2024-01-01..."
}

Scenario 2: EXISTING USER (has account with same email)
───────────────────────────────────────────────────────
Database finds: {
  email: "john@gmail.com",
  password: "hashed_password",
  ...
}

Database updates:
{
  email: "john@gmail.com",
  password: "hashed_password",
  googleId: "1234567890",  ← LINKED!
  avatar: "https://...",    ← UPDATED!
  isVerified: true,         ← UPDATED!
  ...
}

Scenario 3: RETURNING GOOGLE USER
──────────────────────────────────
Database finds by googleId:
{
  googleId: "1234567890",
  email: "john@gmail.com",
  ...
}
→ User is logged in immediately!
```

## Error Handling Flow

```
ERROR: Redirect URI Mismatch
──────────────────────────────
Google rejects callback because URI doesn't match
↓
User sees Google error page
↓
Fix: Update Google Console with correct URI:
     http://localhost:5001/api/auth/google/callback


ERROR: Invalid Client
──────────────────────
Backend can't authenticate with Google
↓
Backend redirects to: http://localhost:5173/login?error=auth_failed
↓
Fix: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env


ERROR: Route Not Found
──────────────────────
Backend /api/auth/google returns 404
↓
Fix: Restart backend server (npm run dev)
     Check backend is running on port 5001


ERROR: Token Not Received
─────────────────────────
Frontend callback doesn't get token
↓
Check browser URL has: ?token=...&userId=...&role=...
↓
Fix: Check backend googleCallback function
     Check backend redirect URL in controller
```

## Environment Variables Reference

### Backend (.env)
```bash
PORT=5001                              # ⚠️ Must match redirect URIs
NODE_ENV=development
MONGODB_URI=mongodb://...
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
SESSION_SECRET=your-session-secret     # Required for passport
FRONTEND_URL=http://localhost:5173     # ⚠️ For CORS
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz...
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback  # ⚠️ Must match Google Console
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5001    # ⚠️ WITHOUT /api suffix!
```

## Testing Commands

### Test Backend Health
```bash
# PowerShell
Invoke-RestMethod http://localhost:5001/api/health

# Should return:
{
  "success": true,
  "message": "WashX API is running",
  "timestamp": "2024-..."
}
```

### Test Google OAuth Endpoint (Browser)
```
Open: http://localhost:5001/api/auth/google

Should redirect to: https://accounts.google.com/o/oauth2/v2/auth?...
```

### Check Backend Logs
```bash
cd backend
npm run dev

# Should show:
🚀 Server is running on port 5001
🔐 Google OAuth: ✅ Configured
🌐 Frontend URL: http://localhost:5173
```

## Security Notes

🔒 **What's Secure:**
- Client Secret is never exposed to frontend
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- CORS is configured to only allow requests from frontend URL
- Passwords are not required for Google OAuth users

⚠️ **Production Checklist:**
- Use HTTPS for all URLs
- Update Google Console with production URLs
- Set NODE_ENV=production
- Use strong SESSION_SECRET
- Consider using secure, httpOnly cookies instead of localStorage
- Implement token refresh mechanism
- Add rate limiting

## Summary

✅ **Port Configuration:**
- Backend: 5001
- Frontend: 5173
- All URLs updated consistently

✅ **OAuth Flow:**
- Click button → Backend → Google → Backend → Frontend → Dashboard

✅ **Database:**
- Auto-creates users
- Links existing accounts
- Stores Google profile data

✅ **Error Handling:**
- Redirect URI validation
- Token validation
- User-friendly error messages

🎉 **Result:** One-click Google authentication!
