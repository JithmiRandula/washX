# WashX Backend & Frontend Setup Guide

## Quick Start Guide

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Setup Backend Environment

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. Edit the `.env` file with your configuration (you can use MongoDB local or Atlas):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/washx
JWT_SECRET=washx_secret_key_2024
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Step 3: Start MongoDB (if using local MongoDB)

```powershell
# Make sure MongoDB is installed and running
mongod
```

Or use MongoDB Atlas (cloud database) - update MONGODB_URI in .env

### Step 4: Start Backend Server

```powershell
# Still in backend directory
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
✅ MongoDB Connected: localhost
```

### Step 5: Install Frontend Dependencies

Open a new terminal:
```powershell
cd frontend
npm install
```

### Step 6: Setup Frontend Environment

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. The `.env` file should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 7: Start Frontend Server

```powershell
# Still in frontend directory
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 8: Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Testing the API

### Health Check
```powershell
curl http://localhost:5000/api/health
```

### Register a User
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"password123","phone":"1234567890"}'
```

### Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```

## Project Structure

```
washX/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── utils/          # API & utilities
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
└── .gitignore              # Shared gitignore
```

## Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution**: Make sure MongoDB is running or check your MONGODB_URI in .env

### Issue: Port already in use
**Solution**: Change PORT in backend/.env or kill the process using the port:
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000
# Kill the process
Stop-Process -Id <PID>
```

### Issue: Frontend can't connect to backend
**Solution**: 
1. Verify backend is running on port 5000
2. Check VITE_API_URL in frontend/.env
3. Check CORS settings in backend/src/server.js

### Issue: Dependencies installation fails
**Solution**: 
1. Delete node_modules folder
2. Delete package-lock.json
3. Run `npm install` again

## Development Workflow

1. **Backend Development**:
   - Modify files in `backend/src/`
   - Server auto-restarts with nodemon
   - Test with Postman or curl

2. **Frontend Development**:
   - Modify files in `frontend/src/`
   - Browser hot-reloads automatically
   - API calls go through axios in `utils/api.js`

3. **Database Changes**:
   - Modify models in `backend/src/models/`
   - Restart backend server
   - Test with sample data

## Next Steps

1. **Install MongoDB Compass** (GUI for MongoDB):
   - Download from: https://www.mongodb.com/try/download/compass
   - Connect to: mongodb://localhost:27017

2. **Install Postman** (API testing):
   - Download from: https://www.postman.com/downloads/
   - Import API collection for testing

3. **Setup MongoDB Atlas** (Cloud Database):
   - Create free account at: https://www.mongodb.com/cloud/atlas
   - Create cluster and get connection string
   - Update MONGODB_URI in .env

4. **Implement Controllers**:
   - Replace placeholder controllers with actual implementation
   - Follow the pattern in `auth.controller.js`

## Useful Commands

### Backend
```powershell
cd backend
npm run dev       # Development mode
npm start         # Production mode
```

### Frontend
```powershell
cd frontend
npm run dev       # Development mode
npm run build     # Build for production
npm run preview   # Preview production build
```

### Database
```powershell
mongosh           # MongoDB shell
mongod            # Start MongoDB server
```

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | Database connection | mongodb://localhost:27017/washx |
| JWT_SECRET | JWT secret key | your_secret_key |
| JWT_EXPIRE | Token expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Support

If you encounter any issues:
1. Check this guide first
2. Review backend/README.md
3. Check console logs for errors
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly
