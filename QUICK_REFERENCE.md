# WashX - Quick Reference Guide

## 🚀 Start Application
```bash
cd frontend
npm run dev
```
**Access at:** http://localhost:5174

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@washx.com | password123 |
| Provider | provider@washx.com | password123 |
| Admin | admin@washx.com | password123 |

---

## 📍 Main Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration
- `/services` - Services overview
- `/how-it-works` - How it works guide
- `/providers` - Browse providers
- `/provider/:id` - Provider details

### Customer Routes (Protected)
- `/customer/dashboard` - Customer dashboard
- `/customer/orders` - Order history
- `/customer/profile` - Profile settings

### Provider Routes (Protected)
- `/provider/dashboard` - Provider dashboard
- `/provider/orders` - Manage orders
- `/provider/services` - Manage services

### Admin Routes (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/providers` - Provider verification

---

## 🎨 Color Palette

```css
Primary Blue: #2563eb
Secondary Purple: #764ba2
Success Green: #10b981
Warning Amber: #f59e0b
Error Red: #dc2626
Text Dark: #1f2937
Text Light: #6b7280
Background: #f9fafb
```

---

## 📦 Key Components

### Location: `src/components/`
- `Navbar/` - Navigation bar
- `Footer/` - Footer section
- `ProviderCard/` - Provider display card
- `LoadingSpinner/` - Loading indicator
- `ProtectedRoute/` - Route protection

---

## 🔧 Context Providers

### AuthContext
```jsx
import { useAuth } from './context/AuthContext';

const { user, login, logout, isCustomer, isProvider, isAdmin } = useAuth();
```

### BookingContext
```jsx
import { useBooking } from './context/BookingContext';

const { currentBooking, createBooking, updateBooking } = useBooking();
```

---

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app & routing |
| `src/main.jsx` | Entry point |
| `src/utils/api.js` | API utilities & mock data |
| `.env.example` | Environment variables template |
| `vite.config.js` | Vite configuration |

---

## 🔍 Mock Data

Mock providers available in: `src/utils/api.js`
- 3 sample providers
- Multiple service types
- Ratings and reviews
- Location data

---

## 🎯 Testing Checklist

### Customer Flow
- [ ] Register new account
- [ ] Login with credentials
- [ ] Browse providers
- [ ] Filter by rating/distance
- [ ] View provider details
- [ ] Select services
- [ ] Check dashboard

### Provider Flow
- [ ] Login as provider
- [ ] View dashboard stats
- [ ] Check order list
- [ ] Update order status
- [ ] View analytics

### Admin Flow
- [ ] Login as admin
- [ ] View platform stats
- [ ] Check pending providers
- [ ] View activity feed
- [ ] Access management tools

---

## 💡 Tips

1. **Clear browser cache** if styles don't update
2. **Check console** for any runtime errors
3. **Use demo accounts** for quick testing
4. **Mobile responsive** - test on different screen sizes
5. **Protected routes** automatically redirect to login

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 5173/5174
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Styles not loading
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check CSS file imports

---

## 📚 Additional Resources

- **Documentation**: `DOCUMENTATION.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Frontend README**: `frontend/README.md`

---

## 🔗 Useful Links

- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- React Router: https://reactrouter.com
- Lucide Icons: https://lucide.dev

---

**Last Updated:** December 8, 2025
**Version:** 1.0.0
