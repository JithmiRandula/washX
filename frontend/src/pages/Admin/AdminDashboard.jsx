import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { adminApi } from '../../api/adminApi';
import {
  Users, Shield, Package, TrendingUp,
  Clock, CheckCircle, XCircle, DollarSign,
  ArrowRight, Star, BarChart2
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers:      0,
    totalProviders:  0,
    totalOrders:     0,
    monthlyRevenue:  0,
    activeOrders:    0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders:   0,
    totalRevenue:    0,
    totalReviews:    0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getStats();
        const d = res?.data ?? {};
        setStats({
          totalUsers:      d.totalUsers      ?? d.TotalUsers      ?? 0,
          totalProviders:  d.totalProviders  ?? d.TotalProviders  ?? 0,
          totalOrders:     d.totalOrders     ?? d.TotalOrders     ?? 0,
          monthlyRevenue:  Number(d.monthlyRevenue ?? d.MonthlyRevenue ?? 0),
          activeOrders:    d.activeOrders    ?? d.ActiveOrders    ?? 0,
          completedOrders: d.completedOrders ?? d.CompletedOrders ?? 0,
          cancelledOrders: d.cancelledOrders ?? d.CancelledOrders ?? 0,
          pendingOrders:   d.pendingOrders   ?? d.PendingOrders   ?? 0,
          totalRevenue:    Number(d.totalRevenue ?? d.TotalRevenue ?? 0),
          totalReviews:    d.totalReviews    ?? d.TotalReviews    ?? 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const adminName =
    user?.name ?? user?.firstName ?? user?.email?.split('@')[0] ?? 'Admin';

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const StatCard = ({ label, value, icon: Icon, accent, iconBg, iconColor, sub }) => (
    <div className="adb-stat-card" style={{ borderLeftColor: accent }}>
      <div className="adb-stat-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={22} />
      </div>
      <div className="adb-stat-body">
        <span className="adb-stat-num">{value}</span>
        <span className="adb-stat-label">{label}</span>
        {sub && <span className="adb-stat-sub">{sub}</span>}
      </div>
    </div>
  );

  const orderPct = (count) =>
    stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;

  return (
    <div className="adb-page">
      <AdminNavbar />

      <div className="adb-content">

        {/* Header */}
        <div className="adb-header">
          <div>
            <h1 className="adb-title">Dashboard Overview</h1>
            <p className="adb-welcome">
              Welcome back, <strong>{adminName}</strong>! Here&apos;s what&apos;s happening on your platform.
            </p>
          </div>
          <div className="adb-date-badge">{today}</div>
        </div>

        {/* Stat Cards — row 1 */}
        {loading ? (
          <div className="adb-loading">
            <div className="adb-spinner" />
            <p>Loading stats…</p>
          </div>
        ) : (
          <>
            <div className="adb-stats-grid">
              <StatCard
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={Users}
                accent="#1d4ed8"
                iconBg="#dbeafe"
                iconColor="#1d4ed8"
              />
              <StatCard
                label="Active Providers"
                value={stats.totalProviders.toLocaleString()}
                icon={Shield}
                accent="#0369a1"
                iconBg="#e0f2fe"
                iconColor="#0369a1"
              />
              <StatCard
                label="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                icon={Package}
                accent="#0284c7"
                iconBg="#f0f9ff"
                iconColor="#0284c7"
              />
              <StatCard
                label="Monthly Revenue"
                value={`Rs ${stats.monthlyRevenue.toLocaleString()}`}
                icon={TrendingUp}
                accent="#059669"
                iconBg="#ecfdf5"
                iconColor="#059669"
              />
              <StatCard
                label="Total Revenue"
                value={`Rs ${stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                accent="#0f172a"
                iconBg="#f1f5f9"
                iconColor="#0f172a"
              />
              <StatCard
                label="Total Reviews"
                value={stats.totalReviews.toLocaleString()}
                icon={Star}
                accent="#d97706"
                iconBg="#fffbeb"
                iconColor="#d97706"
              />
            </div>

            {/* Lower Sections */}
            <div className="adb-lower">

              {/* Order Status Breakdown */}
              <div className="adb-section">
                <div className="adb-section-head">
                  <div className="adb-section-title">
                    <BarChart2 size={18} />
                    Order Status Breakdown
                  </div>
                  <button className="adb-link" onClick={() => navigate('/admin/orders')}>
                    View Orders <ArrowRight size={14} />
                  </button>
                </div>

                <div className="adb-order-rows">
                  <div className="adb-order-row">
                    <div className="adb-order-meta">
                      <span className="adb-order-dot adb-dot-amber" />
                      <span className="adb-order-name">Pending</span>
                    </div>
                    <div className="adb-order-bar-wrap">
                      <div
                        className="adb-order-bar adb-bar-amber"
                        style={{ width: `${orderPct(stats.pendingOrders)}%` }}
                      />
                    </div>
                    <span className="adb-order-count">{stats.pendingOrders}</span>
                  </div>

                  <div className="adb-order-row">
                    <div className="adb-order-meta">
                      <span className="adb-order-dot adb-dot-sky" />
                      <span className="adb-order-name">Active</span>
                    </div>
                    <div className="adb-order-bar-wrap">
                      <div
                        className="adb-order-bar adb-bar-sky"
                        style={{ width: `${orderPct(stats.activeOrders)}%` }}
                      />
                    </div>
                    <span className="adb-order-count">{stats.activeOrders}</span>
                  </div>

                  <div className="adb-order-row">
                    <div className="adb-order-meta">
                      <span className="adb-order-dot adb-dot-green" />
                      <span className="adb-order-name">Completed</span>
                    </div>
                    <div className="adb-order-bar-wrap">
                      <div
                        className="adb-order-bar adb-bar-green"
                        style={{ width: `${orderPct(stats.completedOrders)}%` }}
                      />
                    </div>
                    <span className="adb-order-count">{stats.completedOrders}</span>
                  </div>

                  <div className="adb-order-row">
                    <div className="adb-order-meta">
                      <span className="adb-order-dot adb-dot-red" />
                      <span className="adb-order-name">Cancelled</span>
                    </div>
                    <div className="adb-order-bar-wrap">
                      <div
                        className="adb-order-bar adb-bar-red"
                        style={{ width: `${orderPct(stats.cancelledOrders)}%` }}
                      />
                    </div>
                    <span className="adb-order-count">{stats.cancelledOrders}</span>
                  </div>
                </div>

                {/* Order totals strip */}
                <div className="adb-order-totals">
                  <div className="adb-ot-item">
                    <Clock size={16} className="adb-ot-icon adb-ot-amber" />
                    <span className="adb-ot-num">{stats.pendingOrders}</span>
                    <span className="adb-ot-lbl">Pending</span>
                  </div>
                  <div className="adb-ot-div" />
                  <div className="adb-ot-item">
                    <CheckCircle size={16} className="adb-ot-icon adb-ot-green" />
                    <span className="adb-ot-num">{stats.completedOrders}</span>
                    <span className="adb-ot-lbl">Completed</span>
                  </div>
                  <div className="adb-ot-div" />
                  <div className="adb-ot-item">
                    <XCircle size={16} className="adb-ot-icon adb-ot-red" />
                    <span className="adb-ot-num">{stats.cancelledOrders}</span>
                    <span className="adb-ot-lbl">Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="adb-section">
                <div className="adb-section-head">
                  <div className="adb-section-title">
                    <ArrowRight size={18} />
                    Quick Actions
                  </div>
                </div>

                <div className="adb-quick-grid">
                  <button className="adb-quick-btn adb-qb-blue" onClick={() => navigate('/admin/users')}>
                    <div className="adb-qb-icon"><Users size={22} /></div>
                    <span className="adb-qb-label">Manage Users</span>
                    <span className="adb-qb-sub">{stats.totalUsers} registered</span>
                  </button>

                  <button className="adb-quick-btn adb-qb-sky" onClick={() => navigate('/admin/providers')}>
                    <div className="adb-qb-icon"><Shield size={22} /></div>
                    <span className="adb-qb-label">Manage Providers</span>
                    <span className="adb-qb-sub">{stats.totalProviders} active</span>
                  </button>

                  <button className="adb-quick-btn adb-qb-indigo" onClick={() => navigate('/admin/orders')}>
                    <div className="adb-qb-icon"><Package size={22} /></div>
                    <span className="adb-qb-label">View Orders</span>
                    <span className="adb-qb-sub">{stats.totalOrders} total</span>
                  </button>

                  <button className="adb-quick-btn adb-qb-darkblue" onClick={() => navigate('/admin/orders')}>
                    <div className="adb-qb-icon"><TrendingUp size={22} /></div>
                    <span className="adb-qb-label">Revenue</span>
                    <span className="adb-qb-sub">Rs {stats.totalRevenue.toLocaleString()}</span>
                  </button>
                </div>

                {/* Platform snapshot */}
                <div className="adb-snapshot">
                  <h4 className="adb-snap-title">Platform Snapshot</h4>
                  <div className="adb-snap-rows">
                    <div className="adb-snap-row">
                      <span>Order completion rate</span>
                      <strong style={{ color: '#059669' }}>
                        {stats.totalOrders > 0
                          ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`
                          : '—'}
                      </strong>
                    </div>
                    <div className="adb-snap-row">
                      <span>Avg order value</span>
                      <strong>
                        {stats.completedOrders > 0
                          ? `Rs ${Math.round(stats.totalRevenue / stats.completedOrders).toLocaleString()}`
                          : '—'}
                      </strong>
                    </div>
                    <div className="adb-snap-row">
                      <span>Total reviews</span>
                      <strong>{stats.totalReviews}</strong>
                    </div>
                    <div className="adb-snap-row">
                      <span>Pending orders</span>
                      <strong style={{ color: stats.pendingOrders > 0 ? '#d97706' : '#059669' }}>
                        {stats.pendingOrders}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
