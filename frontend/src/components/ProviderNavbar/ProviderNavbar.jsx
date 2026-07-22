import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Scale,
  MessageCircle,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import chatApi from '../../api/chatApi';
import './ProviderNavbar.css';

const CHAT_BADGE_POLL_INTERVAL = 30_000;

const ProviderNavbar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const providerId = user?.providerId;

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await chatApi.getUnreadCount();
        setUnreadChats(res?.data?.count ?? 0);
      } catch { /* ignore */ }
    };
    refresh();
    const timer = setInterval(refresh, CHAT_BADGE_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NAV = [
    { path: `/provider/${providerId}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { path: `/provider/${providerId}/services`,  label: 'Services',   icon: Layers         },
    { path: `/provider/${providerId}/orders`,    label: 'Orders',     icon: ClipboardList  },
    { path: `/provider/${providerId}/bulk-requests`, label: 'Bulk Requests', icon: Scale },
    { path: `/provider/${providerId}/messages`,  label: 'Messages',   icon: MessageCircle, badge: unreadChats },
    { path: `/provider/${providerId}/analytics`, label: 'Analytics',  icon: BarChart3      },
    { path: `/provider/${providerId}/profile`,   label: 'Profile',    icon: User           },
  ];

  // Initials for avatar fallback
  const displayName = user?.name || user?.email || 'Provider';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <nav className="pvn-nav">
      <div className="pvn-inner">

        {/* ── Logo ── */}
        <Link to={`/provider/${providerId}/dashboard`} className="pvn-logo">
          <img src="/washx logo.png" alt="WashX" className="pvn-logo-img" />
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="pvn-links">
          {NAV.map(({ path, label, icon: Icon, badge }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`pvn-link${active ? ' pvn-link-active' : ''}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {badge > 0 && <span className="pvn-link-badge">{badge > 99 ? '99+' : badge}</span>}
              </Link>
            );
          })}
        </div>

        {/* ── Right side ── */}
        <div className="pvn-right">

          {/* Real notification bell with dropdown */}
          <NotificationDropdown />

          {/* User pill */}
          <div className="pvn-user">
            <div className="pvn-avatar">{initials}</div>
            <div className="pvn-user-info">
              <span className="pvn-user-name">{displayName}</span>
              <span className="pvn-user-role">Service Provider</span>
            </div>
          </div>

          {/* Logout */}
          <button className="pvn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>

          {/* Mobile toggle */}
          <button
            className="pvn-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="pvn-mobile-drawer">
          {NAV.map(({ path, label, icon: Icon, badge }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`pvn-mobile-link${active ? ' pvn-mobile-link-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {badge > 0 && <span className="pvn-link-badge">{badge > 99 ? '99+' : badge}</span>}
              </Link>
            );
          })}
          <button className="pvn-mobile-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default ProviderNavbar;
