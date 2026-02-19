# ✅ Google OAuth Checklist - Port 5001

Use this checklist to verify your setup!

## 🔧 Configuration Checklist

### Google Cloud Console
- [ ] Created a Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 credentials
- [ ] Added JavaScript origin: `http://localhost:5173`
- [ ] Added redirect URI: `http://localhost:5001/api/auth/google/callback` ⚠️ Must be exact!
- [ ] Copied Client ID and Client Secret

### Backend Configuration
- [ ] File `backend/.env` exists
- [ ] `PORT=5001` is set in backend/.env
- [ ] `GOOGLE_CLIENT_ID=<your-actual-client-id>` (no quotes!)
- [ ] `GOOGLE_CLIENT_SECRET=<your-actual-secret>` (no quotes!)
- [ ] `GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback`
- [ ] `SESSION_SECRET=<any-random-string>`
- [ ] `FRONTEND_URL=http://localhost:5173`
- [ ] Backend server restarted after changing .env

### Frontend Configuration
- [ ] File `frontend/.env` exists
- [ ] `VITE_API_URL=http://localhost:5001` (without /api!)
- [ ] Frontend server restarted after changing .env

### Testing
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 5173
- [ ] Can access http://localhost:5173/login
- [ ] Google button is visible on login page
- [ ] Clicking Google button redirects to http://localhost:5001/api/auth/google
- [ ] Google login page appears
- [ ] After Google login, redirected back to app
- [ ] Successfully logged in and redirected to dashboard

## 🎯 Quick Test

1. **Open terminal and check backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Should see:
   ```
   🚀 Server is running on port 5001
   🔐 Google OAuth: ✅ Configured
   ```

2. **Open another terminal for frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **In browser:**
   - Go to: http://localhost:5173/login
   - Click "Google" button
   - Should redirect to Google login

## 🔍 Troubleshooting

### Backend shows "Google OAuth: ❌ Not configured"
→ Check backend/.env has GOOGLE_CLIENT_ID set correctly (no quotes, no spaces)
→ Restart backend server

### "Route not found" error
→ Backend not running or wrong port
→ Check backend/.env has PORT=5001
→ Restart backend server

### "Redirect URI mismatch"
→ Google Console redirect URI must be: `http://localhost:5001/api/auth/google/callback`
→ Check for typos, trailing slashes, http vs https

### Button doesn't work
→ Check browser console for errors (F12)
→ Check frontend/.env has: `VITE_API_URL=http://localhost:5001`
→ Restart frontend server
→ Hard refresh browser (Ctrl+Shift+R)

### Still not working?
1. Check browser DevTools → Network tab → See what URL is being called
2. Check backend terminal for error messages
3. Clear browser cache and cookies
4. Try incognito/private mode

## ✅ Success Indicators

When everything is working correctly:

**Backend logs:**
```
🚀 Server is running on port 5001
🔐 Google OAuth: ✅ Configured
🌐 Frontend URL: http://localhost:5173
```

**Browser console:**
- No red errors
- Successful redirect to Google
- Token received after Google login

**User experience:**
- Click Google button → Google login page appears
- After Google login → Redirected to dashboard
- User is logged in (can see user menu/profile)

## 📞 Need Help?

Check these files in order:
1. **SETUP_NOW.md** - Current setup instructions
2. **QUICK_START_GOOGLE_OAUTH.md** - Quick reference
3. **GOOGLE_OAUTH_SETUP.md** - Detailed Google Console setup
4. **GOOGLE_OAUTH_IMPLEMENTATION.md** - Technical details

## 🎉 All Done?

If all checkboxes are checked and tests pass, you're ready to use Google OAuth!

Try these scenarios:
- [ ] Sign up new user with Google
- [ ] Login existing user with Google
- [ ] Login with email, then connect Google account
- [ ] Multiple Google accounts
- [ ] Different user roles (customer/provider/admin)
