import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    // Simulate API call
    setSubmitted(true);
  };

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
              If an account with that email exists, a password reset link has been sent.
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
              <button type="submit" className="btn-submit">Send Reset Link</button>
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
