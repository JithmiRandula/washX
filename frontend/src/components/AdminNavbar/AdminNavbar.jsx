import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Package, 
  Settings, 
  LogOut, 
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/providers', 
      label: 'Providers', 
      icon: <Building2 size={20} /> 
    },
    { 
      path: '/admin/orders', 
      label: 'Orders', 
      icon: <Package size={20} /> 
    },
    { 
      path: '/admin/analytics', 
      label: 'Analytics', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: <Settings size={20} /> 
    }
  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-container">
        {/* Logo */}
        <Link to="/admin/dashboard" className="admin-nav-logo">
          <img src="/washx logo.png" alt="WashX" className="logo-image" />
        </Link>

        {/* Desktop Navigation */}
        <div className="admin-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="admin-nav-user">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              <Users size={20} />
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="admin-mobile-menu-toggle"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="admin-mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-mobile-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button 
            onClick={handleLogout}
            className="admin-mobile-logout"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;