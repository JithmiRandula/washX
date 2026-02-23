import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { providerId } = useParams();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // For provider routes, verify the providerId matches the logged-in user's providerId
  if (providerId && user.role === 'provider' && user.providerId !== providerId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
