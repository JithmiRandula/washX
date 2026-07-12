import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, CheckCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationsApi from '../../api/notificationsApi';
import './NotificationDropdown.css';

// How often to poll for unread count (ms)
const POLL_INTERVAL = 30_000;

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unread, setUnread]       = useState(0);
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);

  const dropRef = useRef(null);

  // ── Poll unread count ────────────────────────────────────────────────
  const refreshCount = async () => {
    if (String(user?.role).toLowerCase() !== 'provider') return;
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnread(res?.data?.count ?? 0);
    } catch (_) {}
  };

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [user]);

  // ── Fetch full list when dropdown opens ───────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll();
      setItems(res?.data?.data ?? []);
    } catch (_) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchAll();
  };

  // ── Close on outside click ────────────────────────────────────────────
  useEffect(() => {
    const onOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────

  // Mark read in DB + hide from UI list (record stays in database)
  const dismissItem = async (id, wasUnread) => {
    try { await notificationsApi.markRead(id); } catch (_) {}
    setItems(prev => prev.filter(n => n.notificationId !== id));
    if (wasUnread) setUnread(c => Math.max(0, c - 1));
  };

  // Actually delete from database (trash button only)
  const deleteItem = async (id, wasUnread) => {
    try { await notificationsApi.remove(id); } catch (_) {}
    setItems(prev => prev.filter(n => n.notificationId !== id));
    if (wasUnread) setUnread(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  // Clicking a notification: mark read in DB, hide from list, navigate to orders
  const handleClick = async (n) => {
    await dismissItem(n.notificationId, !n.isRead);
    setOpen(false);
    if (n.orderId) {
      navigate(`/provider/${user?.providerId}/orders`);
    }
  };

  // Trash button: permanently delete from database
  const handleDelete = async (e, n) => {
    e.stopPropagation();
    await deleteItem(n.notificationId, !n.isRead);
  };

  // Don't render for non-providers
  if (String(user?.role).toLowerCase() !== 'provider') return null;

  return (
    <div className="nd-wrap" ref={dropRef}>

      {/* Bell button */}
      <button
        className={`nd-bell-btn${open ? ' nd-bell-active' : ''}`}
        onClick={handleBellClick}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="nd-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="nd-panel">
          {/* Header */}
          <div className="nd-panel-header">
            <div className="nd-panel-title">
              <Bell size={16} />
              Notifications
              {unread > 0 && <span className="nd-header-badge">{unread} new</span>}
            </div>
            <div className="nd-header-actions">
              {unread > 0 && (
                <button className="nd-mark-all-btn" onClick={markAllRead} title="Mark all read">
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              )}
              <button className="nd-close-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="nd-list">
            {loading ? (
              <div className="nd-state">
                <div className="nd-spinner" />
                <p>Loading…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="nd-state">
                <Bell size={36} strokeWidth={1.2} />
                <p>No notifications yet</p>
                <span>Orders placed by customers will appear here</span>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.notificationId}
                  className={`nd-item${n.isRead ? '' : ' nd-item-unread'}`}
                  onClick={() => handleClick(n)}
                >
                  <div className="nd-item-icon">
                    <Package size={18} />
                  </div>
                  <div className="nd-item-body">
                    <div className="nd-item-title">{n.title}</div>
                    <div className="nd-item-msg">{n.message}</div>
                    <div className="nd-item-meta">
                      <span className="nd-item-time">{timeAgo(n.createdAt)}</span>
                      {!n.isRead && <span className="nd-unread-dot" />}
                    </div>
                  </div>
                  <button
                    className="nd-delete-btn"
                    onClick={(e) => handleDelete(e, n)}
                    title="Dismiss"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="nd-footer">
              <button
                className="nd-view-orders-btn"
                onClick={() => { setOpen(false); navigate(`/provider/${user?.providerId}/orders`); }}
              >
                View all orders
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
