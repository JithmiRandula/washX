import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Search, Package, User, LogOut, Menu, X } from 'lucide-react';
import './CustomerNavbar.css';

const CustomerNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customer/findproviders', label: 'Find Providers', icon: <Search size={20} /> },
    { path: '/customer/mybooking', label: 'My Booking', icon: <Package size={20} /> },
    { path: '/customer/profile', label: 'Profile', icon: <User size={20} /> }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="customer-navbar">
      <div className="customer-navbar-container">
        <Link to="/customer/dashboard" className="customer-navbar-logo">
          <img src="/washx logo.png" alt="WashX" className="customer-logo-image" />
        </Link>

        <div className={`customer-navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="customer-navbar-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`customer-navbar-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="customer-navbar-actions">
            <div className="customer-user-info">
              <div className="customer-user-avatar">
                <User size={20} />
              </div>
              <div className="customer-user-details">
                <span className="customer-user-name">{user?.name || 'Customer'}</span>
                <span className="customer-user-role">Customer</span>
              </div>
            </div>
            <button onClick={handleLogout} className="customer-logout-btn">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="customer-navbar-actions">
          <div className="customer-user-info">
            <div className="customer-user-avatar">
              <User size={20} />
            </div>
            <div className="customer-user-details">
              <span className="customer-user-name">{user?.name || 'Customer'}</span>
              <span className="customer-user-role">Customer</span>
            </div>
          </div>
          <button onClick={handleLogout} className="customer-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <button 
          className="customer-navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default CustomerNavbar;