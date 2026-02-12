import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue to WashX</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="washx-auth-form-group">
              <label htmlFor="email" className="washx-auth-label">Email Address</label>
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

            <div className="washx-auth-form-group">
              <label htmlFor="password" className="washx-auth-label">Password</label>
              <div className="washx-auth-input-wrapper">
                <Lock size={20} className="washx-auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="washx-auth-input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="washx-auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="washx-auth-form-options">
              <label className="washx-auth-checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="washx-auth-forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <img src="https://www.google.com/favicon.ico" alt="Google" />
              Google
            </button>

          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Sign Up</Link>
            </p>
          </div>
        </div>

        <div className="auth-info">
          <h2>Quick Login Options</h2>
          <div className="demo-accounts">
            <div className="demo-card" onClick={() => {
              setEmail('customer@washx.com');
              setPassword('password123');
            }}>
              <h3>Customer Account</h3>
              <p>customer@washx.com</p>
            </div>
            <div className="demo-card" onClick={() => {
              setEmail('provider@washx.com');
              setPassword('password123');
            }}>
              <h3>Provider Account</h3>
              <p>provider@washx.com</p>
            </div>
            <div className="demo-card" onClick={() => {
              setEmail('admin@washx.com');
              setPassword('password123');
            }}>
              <h3>Admin Account</h3>
              <p>admin@washx.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
