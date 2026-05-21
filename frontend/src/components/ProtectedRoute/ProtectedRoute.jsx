import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { providerId, customerId } = useParams();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
  const allowed = allowedRoles.map(r => (typeof r === 'string' ? r.toLowerCase() : r));
  if (allowedRoles.length > 0 && !allowed.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // For provider routes, verify the providerId matches the logged-in user's providerId
  if (providerId && userRole === 'provider' && user.providerId !== providerId) {
    return <Navigate to="/" replace />;
  }

  // For customer routes, verify the customerId matches the logged-in user's customerId
  if (customerId && userRole === 'customer' && user.customerId !== customerId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
