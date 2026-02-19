import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSubmitted(true);
        // Store reset URL for development/testing (remove in production)
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
            <h1>Forgot Password</h1>
            <p>Enter your email to reset your password</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          {submitted ? (
            <div className="success-message">
              <p>Password reset link has been sent to your email.</p>
              {resetUrl && (
                <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '14px' }}>
                  <p><strong>Development Mode:</strong></p>
                  <p>Click <Link to={resetUrl.replace(window.location.origin, '')} style={{ color: '#007bff' }}>here</Link> to reset your password</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="washx-auth-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="washx-auth-input-wrapper">
                  <Mail size={20} className="washx-auth-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="washx-auth-input-field"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
