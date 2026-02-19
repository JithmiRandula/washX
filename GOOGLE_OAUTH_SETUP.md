# Google OAuth Setup Guide for WashX

This guide will help you set up Google OAuth authentication for the WashX application.

## Prerequisites
- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "WashX")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Project, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and then click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - App name: WashX
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Update" and then "Save and Continue"
9. Skip the "Test users" section by clicking "Save and Continue"
10. Review and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "WashX Web Client")
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Add your production frontend URL when deployed
6. Add Authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (for development)
   - Add your production backend URL when deployed (e.g., `https://api.yourdomain.com/api/auth/google/callback`)
7. Click "Create"
8. You'll see a modal with your Client ID and Client Secret - **save these securely!**

## Step 5: Configure Backend Environment Variables

1. Navigate to the backend folder: `cd backend`
2. Create a `.env` file (if it doesn't exist) by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and update the following variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-from-step-4
   GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   ```

## Step 6: Configure Frontend Environment Variables

1. Navigate to the frontend folder: `cd frontend`
2. Create a `.env` file (if it doesn't exist) by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and ensure it has:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

## Step 7: Restart Your Application

1. Stop your backend server (if running)
2. Restart the backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Stop your frontend server (if running)
4. Restart the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Step 8: Test Google OAuth

1. Open your browser and go to `http://localhost:5173/login`
2. Click the "Google" button
3. You should be redirected to Google's login page
4. Sign in with your Google account
5. Grant permission to the application
6. You should be redirected back to the application and logged in

## Troubleshooting

### "Redirect URI mismatch" Error
- Make sure the redirect URI in your Google Cloud Console matches exactly with your backend callback URL
- Check that there are no trailing slashes or typos

### "Access blocked: This app's request is invalid"
- Make sure you've completed the OAuth consent screen configuration
- Verify that the required scopes are added

### "Invalid client" Error
- Check that your Client ID and Client Secret are correct in the `.env` file
- Make sure there are no extra spaces or quotes around the values

### User redirected to login page after Google authentication
- Check the browser console for errors
- Verify that the frontend callback route is properly configured
- Ensure the token is being properly stored in localStorage

## Production Deployment

When deploying to production:

1. Update the Authorized JavaScript origins in Google Cloud Console with your production frontend URL
2. Update the Authorized redirect URIs with your production backend callback URL
3. Update your `.env` files with production URLs:
   ```env
   # Backend .env
   FRONTEND_URL=https://yourdomain.com
   GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
   
   # Frontend .env
   VITE_API_URL=https://api.yourdomain.com
   ```
4. Set `NODE_ENV=production` in your backend `.env`

## Security Best Practices

1. **Never commit** `.env` files to version control
2. Keep your Client Secret secure and never expose it in frontend code
3. Use HTTPS in production
4. Regularly rotate your secrets
5. Monitor OAuth usage in Google Cloud Console

## Support

For more information about Google OAuth, visit:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
