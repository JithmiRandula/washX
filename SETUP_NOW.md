# 🚀 SETUP INSTRUCTIONS - Google OAuth with Port 5001

## ✅ Code Updates Complete!

All code has been updated to use **port 5001** and the Google OAuth flow is ready.

## 📋 What You Need to Do Now

### Step 1: Get Google OAuth Credentials (Required)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "WashX" and click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click it and then click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - Fill in:
     - App name: **WashX**
     - User support email: **your email**
     - Developer contact: **your email**
   - Click "Save and Continue"
   - Add scopes: `userinfo.email` and `userinfo.profile`
   - Click "Save and Continue" → Skip test users → "Back to Dashboard"

5. **Create OAuth 2.0 Credentials** ⚠️ IMPORTANT
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: **WashX Web Client**
   
   **Add these URIs EXACTLY:**
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     ```
   
   - **Authorized redirect URIs:**
     ```
     http://localhost:5001/api/auth/google/callback
     ```
   
   - Click "Create"
   - **📋 COPY the Client ID and Client Secret** (you'll need these next!)

### Step 2: Update Backend .env File

Open `backend/.env` and replace these lines:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**With your actual credentials from Step 1:**

```env
GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
```

⚠️ **Do NOT add quotes or spaces!**

### Step 3: Restart Your Servers

You **MUST** restart both servers for the changes to take effect:

**Backend:**
```bash
# Stop the current backend server (Ctrl+C)
cd backend
npm run dev
```

**Frontend:**
```bash
# Stop the current frontend server (Ctrl+C)
cd frontend
npm run dev
```

### Step 4: Test Google Login! 🎉

1. Open your browser: http://localhost:5173/login
2. Click the **"Google"** button
3. Sign in with your Google account
4. You should be logged in and redirected to your dashboard!

## 🔍 Verify It's Working

When you click the Google button, you should be redirected to:
```
http://localhost:5001/api/auth/google
```

Then Google will redirect you to its login page, and after login, back to your app.

## ⚠️ Common Issues

### "Route not found" Error
**Cause:** Backend server not restarted or not running
**Fix:** Stop and restart the backend server with `npm run dev`

### "Redirect URI mismatch"
**Cause:** The redirect URI in Google Console doesn't match exactly
**Fix:** Make sure it's exactly: `http://localhost:5001/api/auth/google/callback`

### "Invalid Client ID"
**Cause:** Wrong credentials in .env or not restarted
**Fix:** 
1. Check your .env file has the correct Client ID (no quotes, no spaces)
2. Restart the backend server
3. Clear browser cache

### Google button does nothing
**Cause:** Frontend not restarted or using old cached version
**Fix:**
1. Stop and restart frontend server
2. Hard refresh browser (Ctrl+Shift+R)
3. Check browser console for errors

## ✅ Current Configuration

- **Backend Port:** 5001
- **Frontend Port:** 5173
- **Google OAuth Callback:** http://localhost:5001/api/auth/google/callback
- **Frontend API URL:** http://localhost:5001

## 📝 Files Updated

✅ Backend:
- `.env` - Added Google OAuth credentials placeholders
- `src/server.js` - Updated default port to 5001
- `src/config/passport.js` - Google OAuth configuration
- `src/controllers/auth.controller.js` - OAuth callback handler
- `src/routes/auth.routes.js` - OAuth routes
- `src/models/User.js` - Support for Google authentication

✅ Frontend:
- `.env` - Backend URL set to http://localhost:5001
- `src/utils/api.js` - Fixed API base URL
- `src/pages/Auth/Login.jsx` - Google login button
- `src/pages/Auth/Register.jsx` - Google signup button
- `src/pages/Auth/GoogleCallback.jsx` - OAuth callback handler
- `src/context/AuthContext.jsx` - Google login function
- `src/App.jsx` - OAuth callback route

## 🎯 Next Steps After Setup

Once Google OAuth is working:
1. Test with multiple Google accounts
2. Test account linking (create account with email, then login with Google)
3. Test role-based redirects (customer/provider/admin)
4. Add your production domain when you deploy

## 📚 Need More Help?

Check these files:
- `QUICK_START_GOOGLE_OAUTH.md` - Quick reference
- `GOOGLE_OAUTH_SETUP.md` - Detailed setup guide
- `GOOGLE_OAUTH_IMPLEMENTATION.md` - Technical documentation

**If you're still stuck, check:**
1. Browser console for JavaScript errors
2. Backend terminal for server errors
3. Network tab in browser DevTools to see the actual requests
