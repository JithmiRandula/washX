import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Compass, CheckCircle, X } from 'lucide-react';
import './Login.css';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    address: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL and message from navigation state
  const message = location.state?.message;
  const returnTo = location.state?.returnTo;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationAccess = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Try to get address using a free geocoding service
      let address = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      try {
        // Using Nominatim (OpenStreetMap) - free reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.display_name) {
            address = data.display_name;
          }
        }
      } catch (geocodingError) {
        console.log('Reverse geocoding failed, using coordinates:', geocodingError);
        // Keep the coordinate-based address as fallback
      }
      
      setCurrentAddress(address);
      setFormData(prevData => ({
        ...prevData,
        latitude,
        longitude,
        address: address
      }));
      
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 3000);
      
    } catch (error) {
      console.error('Location error:', error);
      setError('Unable to fetch location. Please ensure location access is enabled and try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const user = await register(formData);
      // Redirect based on return URL or role
      if (returnTo) {
        navigate(returnTo);
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join WashX and start your laundry journey</p>
            {message && (
              <div className="info-message">
                {message}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="role-selector">
              <div className={`role-option ${formData.role === 'customer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id="customer"
                  name="role"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                />
                <label htmlFor="customer">
                  <User size={24} />
                  <span>Customer</span>
                </label>
              </div>
              <div className={`role-option ${formData.role === 'provider' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id="provider"
                  name="role"
                  value="provider"
                  checked={formData.role === 'provider'}
                  onChange={handleChange}
                />
                <label htmlFor="provider">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Provider</span>
                </label>
              </div>
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="name" className="washx-auth-label">Full Name</label>
              <div className="washx-auth-input-wrapper">
                <User size={20} className="washx-auth-input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="washx-auth-input-field"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="email" className="washx-auth-label">Email Address</label>
              <div className="washx-auth-input-wrapper">
                <Mail size={20} className="washx-auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="washx-auth-input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="phone" className="washx-auth-label">Phone Number</label>
              <div className="washx-auth-input-wrapper">
                <Phone size={20} className="washx-auth-input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="washx-auth-input-field"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="address" className="washx-auth-label">
                {formData.role === 'provider' ? 'Business Address' : 'Address'}
              </label>
              <div className="washx-auth-input-wrapper">
                <MapPin size={20} className="washx-auth-input-icon" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="washx-auth-input-field"
                  placeholder={formData.role === 'provider' ? 'Enter your business address' : 'Enter your address'}
                  value={formData.address}
                  onChange={handleChange}
                  required={formData.role === 'provider'}
                />
              </div>
            </div>

            <div className="washx-auth-form-group">
              <button
                type="button"
                className={`washx-location-glass-btn ${
                  locationLoading ? 'loading' : 
                  locationSuccess ? 'success' : ''
                }`}
                onClick={handleLocationAccess}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <div className="washx-location-spinner"></div>
                    <span>Getting location...</span>
                  </>
                ) : locationSuccess ? (
                  <>
                    <CheckCircle size={18} />
                    <span>Location updated!</span>
                  </>
                ) : (
                  <>
                    <Compass size={18} />
                    <span>Use my current location</span>
                  </>
                )}
              </button>
              
              {currentAddress && (
                <div className="washx-current-address">
                  <div className="washx-address-header">
                    <div className="washx-address-label">Current Address:</div>
                    <button
                      type="button"
                      className="washx-clear-address"
                      onClick={() => {
                        setCurrentAddress('');
                        setFormData(prev => ({ ...prev, address: '' }));
                        setLocationSuccess(false);
                      }}
                      title="Clear location"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="washx-address-text">{currentAddress}</div>
                </div>
              )}
            </div>

            <div className="washx-auth-form-group">
              <label htmlFor="password" className="washx-auth-label">Password</label>
              <div className="washx-auth-input-wrapper">
                <Lock size={20} className="washx-auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="washx-auth-input-field"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="washx-auth-form-group">
              <label htmlFor="confirmPassword" className="washx-auth-label">Confirm Password</label>
              <div className="washx-auth-input-wrapper">
                <Lock size={20} className="washx-auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="washx-auth-input-field"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
