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
import HomeProviders from './pages/Home_Providers/HomeProviders';
import Providers from './pages/Customer/Providers';
import ProviderDetails from './pages/Customer/ProviderDetails';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Bookings from './pages/Customer/Bookings';
import CustomerProfile from './pages/Customer/CustomerProfile';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import ProviderServices from './pages/Provider/ProviderServices';
import ProviderOrders from './pages/Provider/ProviderOrders';
import ProviderAnalytics from './pages/Provider/ProviderAnalytics';
import ProviderProfile from './pages/Provider/ProviderProfile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProviders from './pages/Admin/AdminProviders';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSettings from './pages/Admin/AdminSettings';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isCustomerRoute && !isAdminRoute && <Navbar />}
      <main className={`main-content ${isCustomerRoute || isAdminRoute ? 'no-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/providers" element={<HomeProviders />} />
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
          <Route 
            path="/provider/services" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderServices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/orders" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/analytics" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/profile" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderProfile />
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
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/providers" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProviders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isCustomerRoute && !isAdminRoute && <Footer />}
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