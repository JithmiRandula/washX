import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Services from './pages/Services/Services';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import Providers from './pages/Customer/Providers';
import ProviderDetails from './pages/Customer/ProviderDetails';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Bookings from './pages/Customer/Bookings';
import CustomerProfile from './pages/Customer/CustomerProfile';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer');

  return (
    <div className="app">
      {!isCustomerRoute && <Navbar />}
      <main className={`main-content ${isCustomerRoute ? 'no-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/provider/:id" element={<ProviderDetails />} />
          
          {/* Customer Routes */}
          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/findproviders" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Providers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/mybooking" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Bookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Provider Routes */}
          <Route 
            path="/provider/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <AppContent />
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;