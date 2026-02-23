# 🚀 Quick Start Guide - Provider Features

## 📋 Overview

Your WashX application now has:
1. **Unique Provider URLs** - Each provider has their own dashboard URL
2. **Complete Profile Management** - Create, view, update profiles with image upload

---

## 🔐 Login Flow

### When a Provider Logs In:

1. **Using Email/Password:**
   ```
   POST http://localhost:5001/api/auth/login
   {
     "email": "provider@example.com",
     "password": "password123"
   }
   ```
   
   **Response:**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1...",
     "user": {
       "id": "user_id_here",
       "name": "John's Laundry",
       "email": "provider@example.com",
       "role": "provider"
     },
     "providerId": "provider_mongo_id_here"
   }
   ```

2. **Redirect:**
   - Frontend redirects to: `/provider/{providerId}/dashboard`
   - Example: `/provider/65abc123def456/dashboard`

3. **Stored in LocalStorage:**
   ```javascript
   {
     ...user,
     token: "jwt_token",
     providerId: "provider_mongo_id"
   }
   ```

---

## 🌐 URL Structure

### Provider Routes (All require authentication):

```
Dashboard:   /provider/:providerId/dashboard
Services:    /provider/:providerId/services
Orders:      /provider/:providerId/orders
Analytics:   /provider/:providerId/analytics
Profile:     /provider/:providerId/profile
```

### Example:
```
http://localhost:5173/provider/65abc123def456/dashboard
http://localhost:5173/provider/65abc123def456/profile
```

---

## 👤 Provider Profile Management

### 1. View Profile

**Frontend:**
- Navigate to `/provider/{providerId}/profile`
- Profile component fetches data automatically

**Backend API:**
```
GET /api/providers/{providerId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "providerId",
    "userId": "userId",
    "businessName": "Clean & Fresh Laundry",
    "description": "Professional laundry service...",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "coordinates": { "lat": 40.7128, "lng": -74.0060 }
    },
    "phone": "+1234567890",
    "email": "provider@example.com",
    "images": ["/uploads/providers/logo-123.jpg"],
    "operatingHours": {
      "monday": { "open": "09:00", "close": "18:00", "isClosed": false },
      ...
    },
    "rating": { "average": 4.5, "count": 25 }
  }
}
```

### 2. Update Profile

**Frontend:**
- Click "Edit Profile" button
- Modify fields
- Click "Save Changes"

**Backend API:**
```
PUT /api/providers/{providerId}/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessName": "Updated Name",
  "description": "Updated description...",
  "address": {
    "street": "456 New St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101"
  },
  "phone": "+1987654321",
  "email": "newemail@example.com",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "20:00", "isClosed": false },
    ...
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* updated provider object */ }
}
```

### 3. Upload Logo/Image

**Frontend:**
- Click "Upload Logo" or logo placeholder
- Select image file
- File uploads automatically

**Backend API:**
```
POST /api/providers/{providerId}/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  image: [file]
```

**File Requirements:**
- Type: Images only (jpg, png, gif, etc.)
- Max Size: 5MB
- Stored in: `backend/uploads/providers/`

**Response:**
```json
{
  "success": true,
  "data": "/uploads/providers/provider-1234567890-logo.jpg"
}
```

**Access Image:**
```
http://localhost:5001/uploads/providers/provider-1234567890-logo.jpg
```

---

## 🔒 Security Features

### Route Protection

1. **Authentication Required:**
   - All provider routes require valid JWT token
   - Token sent in Authorization header: `Bearer {token}`

2. **ProviderId Validation:**
   - Frontend checks: logged-in providerId matches URL providerId
   - Backend checks: user owns the provider profile

3. **Example Protected Flow:**
   ```
   User A (providerId: ABC123) tries to access:
   /provider/XYZ789/dashboard
   
   Result: Redirected to home (unauthorized)
   ```

### Authorization Checks

**Backend Middleware:**
```javascript
router.put('/:providerId/profile', 
  protect,                              // Verify JWT token
  authorize('provider', 'admin'),       // Verify role
  providerController.updateProvider     // Verify ownership
);
```

**Inside Controller:**
```javascript
// Verify user owns this provider profile
if (provider.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Not authorized' });
}
```

---

## 📱 Testing the Implementation

### Test 1: Register New Provider

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Laundry",
    "email": "test@laundry.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "provider"
  }'
```

**Expected:**
- User created
- Provider profile auto-created
- Response includes `providerId`

### Test 2: Login as Provider

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@laundry.com",
    "password": "password123"
  }'
```

**Expected:**
- Successful login
- JWT token returned
- `providerId` included in response

### Test 3: Get Provider Profile

```bash
curl -X GET http://localhost:5001/api/providers/{providerId} \
  -H "Authorization: Bearer {your_jwt_token}"
```

**Expected:**
- Complete provider profile returned
- All fields populated

### Test 4: Update Profile

```bash
curl -X PUT http://localhost:5001/api/providers/{providerId}/profile \
  -H "Authorization: Bearer {your_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Updated Laundry Name",
    "description": "We provide the best service!"
  }'
```

**Expected:**
- Profile updated successfully
- Changes reflected in database

### Test 5: Upload Image

```bash
curl -X POST http://localhost:5001/api/providers/{providerId}/upload \
  -H "Authorization: Bearer {your_jwt_token}" \
  -F "image=@/path/to/logo.jpg"
```

**Expected:**
- Image uploaded to `backend/uploads/providers/`
- Image URL returned
- Provider's images array updated

---

## 🐛 Troubleshooting

### Issue: "Provider profile not found"

**Cause:** ProviderId missing or incorrect  
**Solution:**
1. Check localStorage: `washx_user` should have `providerId`
2. Re-login to get fresh token with `providerId`
3. Check database: Provider collection should have document

### Issue: "Not authorized to access this route"

**Cause:** Token invalid or providerId mismatch  
**Solution:**
1. Check JWT token is being sent
2. Verify token hasn't expired
3. Ensure URL providerId matches logged-in user's providerId

### Issue: "Image upload failed"

**Cause:** File validation or storage issue  
**Solution:**
1. Check file is an image (jpg, png, etc.)
2. Ensure file size < 5MB
3. Verify `backend/uploads/providers/` directory exists
4. Check file permissions

### Issue: "Profile data not loading"

**Cause:** API call failing or data format issue  
**Solution:**
1. Open browser DevTools → Network tab
2. Check API call to `/api/providers/{providerId}`
3. Verify response status and data
4. Check console for errors

---

## 📚 Code Examples

### Getting ProviderId in Components

```javascript
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MyComponent() {
  const { providerId } = useParams();  // From URL
  const { user } = useAuth();          // From context
  
  console.log('URL ProviderId:', providerId);
  console.log('User ProviderId:', user.providerId);
  
  // They should match for security
  if (providerId !== user.providerId) {
    // Unauthorized access
  }
}
```

### Making API Calls

```javascript
import api from '../../utils/api';

// Get profile
const response = await api.get(`/providers/${providerId}`);

// Update profile
const response = await api.put(`/providers/${providerId}/profile`, {
  businessName: 'New Name',
  description: 'New Description'
});

// Upload image
const formData = new FormData();
formData.append('image', file);
const response = await api.post(`/providers/${providerId}/upload`, formData);
```

### Navigation with ProviderId

```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navigation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const providerId = user?.providerId;
  
  const goToDashboard = () => {
    navigate(`/provider/${providerId}/dashboard`);
  };
  
  const goToProfile = () => {
    navigate(`/provider/${providerId}/profile`);
  };
}
```

---

## ✅ Quick Checklist

Before testing, ensure:

- [ ] MongoDB is running
- [ ] Backend server is running (port 5001)
- [ ] Frontend is running (port 5173)
- [ ] `.env` file has `JWT_SECRET`
- [ ] `uploads/providers/` directory exists
- [ ] No console errors in browser
- [ ] No errors in backend terminal

---

## 🎯 Expected User Flow

1. **Provider Registers** → Profile auto-created
2. **Provider Logs In** → Redirected to unique dashboard
3. **Visits Profile Page** → Data loads from database
4. **Uploads Logo** → Image saved and displayed
5. **Edits Information** → Changes saved to database
6. **Logs Out & Back In** → All data persists

---

## 📞 Need Help?

Common endpoints to test:

```
Backend:  http://localhost:5001
Frontend: http://localhost:5173

Register: POST /api/auth/register
Login:    POST /api/auth/login
Profile:  GET  /api/providers/:providerId
Update:   PUT  /api/providers/:providerId/profile
Upload:   POST /api/providers/:providerId/upload
```

Check these on errors:
1. Browser Console (F12)
2. Network Tab (API calls)
3. Backend Terminal (Server logs)
4. MongoDB (Database entries)

---

**Happy Testing! 🚀**
