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
      const needsPassword = searchParams.get('needsPassword');
      const providerId = searchParams.get('providerId');
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
        // Call the googleLogin function from AuthContext — this also fetches /api/auth/me,
        // which is the authoritative source for providerId/customerId.
        const userData = await googleLogin(token, userId, role);

        // The URL's providerId (sent for existing providers) fills in if /api/auth/me didn't have it yet.
        if (providerId && !userData.providerId) {
          userData.providerId = providerId;
          localStorage.setItem('washx_user', JSON.stringify(userData));
        }

        // If new Google user needs to set password, redirect to set password page
        if (needsPassword === 'true') {
          navigate('/auth/set-password?firstLogin=true');
          return;
        }

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'provider') {
          if (userData.providerId) {
            navigate(`/provider/${userData.providerId}/dashboard`);
          } else {
            navigate('/login?error=provider_profile_missing');
          }
        } else if (role === 'customer') {
          if (userData.customerId) {
            navigate(`/customer/${userData.customerId}/dashboard`);
          } else {
            navigate('/login?error=customer_profile_missing');
          }
        } else {
          navigate('/');
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
