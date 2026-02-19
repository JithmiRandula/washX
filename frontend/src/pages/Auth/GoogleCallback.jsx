import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');
      const role = searchParams.get('role');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        navigate('/login?error=google_auth_failed');
        return;
      }

      if (!token || !userId || !role) {
        console.error('Missing required parameters');
        navigate('/login?error=missing_parameters');
        return;
      }

      try {
        // Call the googleLogin function from AuthContext
        await googleLogin(token, userId, role);

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      } catch (err) {
        console.error('Login error:', err);
        navigate('/login?error=login_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, googleLogin]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <LoadingSpinner />
      <p>Completing Google sign in...</p>
    </div>
  );
};

export default GoogleCallback;
