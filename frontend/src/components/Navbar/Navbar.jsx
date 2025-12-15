import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, User, ShoppingBag, LayoutDashboard, LogOut, MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, logout, isCustomer, isProvider, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isProvider) return '/provider/dashboard';
    if (isCustomer) return '/customer/dashboard';
    return '/';
  };

  return (
    <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/wash2.png" alt="WashX" className="logo-image" />
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/services" className="navbar-link" onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link to="/providers" className="navbar-link" onClick={() => setIsOpen(false)}>
            Find Providers
          </Link>
          <Link to="/how-it-works" className="navbar-link" onClick={() => setIsOpen(false)}>
            How It Works
          </Link>
          {isProvider && (
            <Link to="/provider/dashboard" className="navbar-link" onClick={() => setIsOpen(false)}>
              Provider Dashboard
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={20} />
                <span>{user.name}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to={getDashboardLink()} className="dropdown-item">
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  {isCustomer && (
                    <>
                      <Link to="/customer/orders" className="dropdown-item">
                        <ShoppingBag size={18} />
                        <span>My Orders</span>
                      </Link>
                      <Link to="/customer/profile" className="dropdown-item">
                        <User size={18} />
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        <button 
          className="navbar-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
