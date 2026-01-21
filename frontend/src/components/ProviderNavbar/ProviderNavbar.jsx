import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  BarChart3, 
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Settings
} from 'lucide-react';
import './ProviderNavbar.css';

const ProviderNavbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { 
      path: '/provider/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/provider/services', 
      label: 'Services', 
      icon: Package 
    },
    { 
      path: '/provider/orders', 
      label: 'Orders', 
      icon: Package 
    },
    { 
      path: '/provider/analytics', 
      label: 'Analytics', 
      icon: BarChart3 
    },
    { 
      path: '/provider/profile', 
      label: 'Profile', 
      icon: User 
    }
  ];

  return (
    <nav className="provider-navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand">
          <Link to="/provider/dashboard" className="brand-link">
            <div className="brand-logo">
              <span className="wash-text">Wash</span>
              <span className="x-text">X</span>
            </div>
            <span className="provider-badge">Provider</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">2</span>
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <div className="user-info">
              <img 
                src={user?.avatar || '/api/placeholder/32/32'} 
                alt="User" 
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="user-role">Service Provider</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-items">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="mobile-nav-footer">
            <button 
              onClick={handleLogout}
              className="mobile-logout-btn"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ProviderNavbar;