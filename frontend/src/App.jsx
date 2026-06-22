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
import ResetPassword from './pages/Auth/ResetPassword';
import SetPassword from './pages/Auth/SetPassword';
import GoogleCallback from './pages/Auth/GoogleCallback';
import Services from './pages/Services/Services';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import HomeProviders from './pages/Home_Providers/HomeProviders';
import Providers from './pages/Customer/Providers';
import ProviderDetails from './pages/Customer/ProviderDetails';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Bookings from './pages/Customer/Bookings';
import CustomerProfile from './pages/Customer/CustomerProfile';
import PaymentResult from './pages/Customer/PaymentResult';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import ProviderServices from './pages/Provider/ProviderServices';
import ProviderOrders from './pages/Provider/ProviderOrders';
import ProviderAnalytics from './pages/Provider/ProviderAnalytics';
import ProviderProfile from './pages/Provider/ProviderProfile';
import ProviderItems from './pages/Provider/ProviderItems';
import ProviderBulkItems from './pages/Provider/ProviderBulkItems';
import ProviderLayout from './layouts/ProviderLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProviders from './pages/Admin/AdminProviders';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminAnalytics from './pages/Admin/AdminAnalytics';
import AdminSettings from './pages/Admin/AdminSettings';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer') || location.pathname.startsWith('/payment');
  const isProviderRoute = location.pathname.startsWith('/provider');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password') || location.pathname.startsWith('/auth/set-password');
  const hidePublicChrome = isCustomerRoute || isProviderRoute || isAdminRoute;

  return (
    <div className="app">
      {!hidePublicChrome && <Navbar />}
      <main className={`main-content ${hidePublicChrome ? 'no-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/set-password" element={<SetPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/providers" element={<HomeProviders />} />
          <Route path="/provider/:id" element={<ProviderDetails />} />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentResult status="success" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/cancel"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentResult status="cancel" />
              </ProtectedRoute>
            }
          />
          
          {/* Customer Routes - Dynamic with customerId */}
          <Route 
            path="/customer/:customerId/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/:customerId/findproviders" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Providers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/:customerId/mybooking" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Bookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer/:customerId/profile" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Provider Routes — single ProviderNavbar via layout */}
          <Route
            path="/provider/:providerId"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="items/:serviceId" element={<ProviderItems />} />
            <Route path="bulk-items/:serviceId" element={<ProviderBulkItems />} />
            <Route path="orders" element={<ProviderOrders />} />
            <Route path="analytics" element={<ProviderAnalytics />} />
            <Route path="profile" element={<ProviderProfile />} />
          </Route>
          
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
      {!hidePublicChrome && !isAuthRoute && <Footer />}
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