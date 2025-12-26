# WashX Backend API

Backend API for WashX - Smart Laundry Service Platform

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/washx
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Route controllers
│   │   └── auth.controller.js
│   ├── middleware/      # Custom middleware
│   │   └── auth.js      # Authentication middleware
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Provider.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── provider.routes.js
│   │   ├── service.routes.js
│   │   ├── booking.routes.js
│   │   └── review.routes.js
│   ├── utils/           # Utility functions
│   │   └── generateToken.js
│   └── server.js        # App entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/nearby` - Get nearby providers
- `GET /api/providers/:id` - Get provider by ID
- `POST /api/providers` - Create provider (Provider/Admin)
- `PUT /api/providers/:id` - Update provider (Provider/Admin)
- `DELETE /api/providers/:id` - Delete provider (Admin only)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/provider/:providerId` - Get services by provider
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Provider/Admin)
- `PUT /api/services/:id` - Update service (Provider/Admin)
- `DELETE /api/services/:id` - Delete service (Provider/Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin only)
- `GET /api/bookings/my-bookings` - Get user's bookings (Protected)
- `GET /api/bookings/provider/:providerId` - Get provider bookings (Provider/Admin)
- `GET /api/bookings/:id` - Get booking by ID (Protected)
- `POST /api/bookings` - Create booking (Protected)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `DELETE /api/bookings/:id` - Cancel booking (Protected)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/provider/:providerId` - Get provider reviews
- `GET /api/reviews/:id` - Get review by ID
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 🗄️ Database Models

### User
- Personal information (name, email, phone)
- Address with coordinates
- Role (customer, provider, admin)
- Authentication details

### Provider
- Business information
- Services offered
- Operating hours
- Location with geospatial indexing
- Ratings and reviews

### Service
- Service details (name, description, category)
- Pricing information
- Turnaround time

### Booking
- Customer and provider references
- Services requested
- Pickup and delivery details
- Status tracking
- Payment information

### Review
- Rating and comment
- Provider response
- Verification status

## 🛠️ Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🔧 Development

To add new features:

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Register routes in `src/server.js`

## 📄 License

This project is licensed under the ISC License.
