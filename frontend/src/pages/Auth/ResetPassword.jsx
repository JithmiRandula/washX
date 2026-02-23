import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Login.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success) {
        setSuccess(true);
        
        // Automatically log the user in
        if (response.data.token && response.data.user) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          login(response.data.user, response.data.token);
          
          // Redirect based on user role after 2 seconds
          setTimeout(() => {
            switch(response.data.user.role) {
              case 'admin':
                navigate('/admin/dashboard');
                break;
              case 'provider':
                if (response.data.providerId) {
                  navigate(`/provider/${response.data.providerId}/dashboard`);
                } else {
                  navigate('/');
                }
                break;
              default:
                if (response.data.customerId) {
                  navigate(`/customer/${response.data.customerId}/dashboard`);
                } else {
                  navigate('/');
                }
            }
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be expired or invalid.');
    } finally {
      setLoading(false);
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
            <h1>Reset Password</h1>
            <p>Enter your new password</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {success ? (
            <div className="success-message">
              <p>Password reset successful!</p>
              <p>Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="washx-auth-form-group">
                <label htmlFor="password">New Password</label>
                <div className="washx-auth-input-wrapper">
                  <Lock size={20} className="washx-auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="washx-auth-input-field"
                    placeholder="Enter new password (min 6 characters)"
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
                    placeholder="Confirm new password"
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
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
