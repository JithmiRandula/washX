import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Login.css';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFirstLogin = searchParams.get('firstLogin') === 'true';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.put('/auth/updatepassword', { 
        newPassword: password 
      });
      
      if (response.data.success) {
        // Redirect to dashboard based on user role
        switch(user?.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'provider':
            navigate('/provider/dashboard');
            break;
          default:
            navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Redirect to dashboard without setting password
    switch(user?.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'provider':
        navigate('/provider/dashboard');
        break;
      default:
        navigate('/customer/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isFirstLogin ? 'Welcome to WashX!' : 'Set Password'}</h1>
            <p>
              {isFirstLogin 
                ? 'Set a password to enable email/password login in the future' 
                : 'Set a password for your account'}
            </p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="washx-auth-form-group">
              <label htmlFor="password">Password</label>
              <div className="washx-auth-input-wrapper">
                <Lock size={20} className="washx-auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="washx-auth-input-field"
                  placeholder="Enter password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="washx-auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="washx-auth-input-wrapper">
                <Lock size={20} className="washx-auth-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="washx-auth-input-field"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="washx-auth-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Setting Password...' : 'Set Password'}
            </button>

            {isFirstLogin && (
              <button 
                type="button" 
                className="btn-submit" 
                style={{ 
                  backgroundColor: 'transparent', 
                  color: '#4A90E2', 
                  border: '1px solid #4A90E2',
                  marginTop: '10px'
                }}
                onClick={handleSkip}
              >
                Skip for Now
              </button>
            )}
          </form>
          
          <div className="auth-footer">
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
              💡 Setting a password allows you to login using email/password in addition to Google Sign-In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
