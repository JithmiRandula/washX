import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Package, DollarSign, TrendingUp, Users,
  Plus, UserCircle, ClipboardList,
  Clock, CheckCircle, AlertCircle, ArrowRight, Loader
} from 'lucide-react';
import { providerOrdersAPI } from '../../api/commerceApi';
import './ProviderDashboard.css';

const STATUS_META = {
  pending:      { bg: '#fffbeb', color: '#d97706', label: 'Pending'     },
  'in-progress':{ bg: '#e0f2fe', color: '#0369a1', label: 'In Progress' },
  completed:    { bg: '#f1f5f9', color: '#64748b', label: 'Completed'   },
  cancelled:    { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled'   },
};

// Only the forward transitions the backend actually supports from each status.
const NEXT_STATUS_OPTIONS = {
  pending:      ['pending', 'in-progress', 'cancelled'],
  'in-progress':['in-progress', 'completed'],
};

const f = (obj, camel, pascal) => obj?.[camel] ?? obj?.[pascal];

const ProviderDashboard = () => {
  const { user }       = useAuth();
  const { providerId } = useParams();
  const navigate       = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await providerOrdersAPI.getMine();
      const rows = res?.data?.data ?? res?.data ?? [];
      setOrders(Array.isArray(rows) ? rows : []);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const norm = (o) => ({
    orderId:        f(o, 'orderId', 'OrderId'),
    orderReference: f(o, 'orderReference', 'OrderReference') ?? '—',
    customerId:     f(o, 'customerId', 'CustomerId'),
    customerName:   f(o, 'customerName', 'CustomerName') ?? '—',
    itemCount:      f(o, 'itemCount', 'ItemCount') ?? 0,
    totalAmount:    Number(f(o, 'totalAmount', 'TotalAmount') ?? 0),
    paymentStatus:  (f(o, 'paymentStatus', 'PaymentStatus') ?? '').toLowerCase(),
    providerStatus: (f(o, 'providerStatus', 'ProviderStatus') ?? 'pending').toLowerCase(),
    createdAt:      f(o, 'createdAt', 'CreatedAt'),
  });

  const normalized = useMemo(() => orders.map(norm), [orders]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paid = normalized.filter(o => o.paymentStatus === 'paid');
    const revenue = paid.reduce((s, o) => s + o.totalAmount, 0);

    const now = new Date();
    const inMonth = (d, monthOffset) => {
      if (!d) return false;
      const dt = new Date(d);
      const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
      return dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
    };
    const thisMonthRevenue = paid.filter(o => inMonth(o.createdAt, 0)).reduce((s, o) => s + o.totalAmount, 0);
    const lastMonthRevenue = paid.filter(o => inMonth(o.createdAt, -1)).reduce((s, o) => s + o.totalAmount, 0);
    const monthChange = lastMonthRevenue === 0
      ? (thisMonthRevenue > 0 ? null : 0)
      : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    const customerCount = new Set(normalized.map(o => o.customerId).filter(Boolean)).size;

    return {
      totalOrders: normalized.length,
      revenue,
      monthChange,
      customerCount,
    };
  }, [normalized]);

  const statCards = [
    { icon: Package,    label: 'Total Orders', value: String(stats.totalOrders), accent: '#1d4ed8', iconBg: '#dbeafe', iconColor: '#1d4ed8' },
    { icon: DollarSign, label: 'Revenue',      value: `Rs ${stats.revenue.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, accent: '#059669', iconBg: '#ecfdf5', iconColor: '#059669' },
    { icon: TrendingUp, label: 'This Month',   value: stats.monthChange === null ? 'New' : `${stats.monthChange >= 0 ? '+' : ''}${stats.monthChange}%`, accent: '#0284c7', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { icon: Users,      label: 'Customers',    value: String(stats.customerCount), accent: '#d97706', iconBg: '#fffbeb', iconColor: '#d97706' },
  ];

  // ── Recent orders table ───────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await providerOrdersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => {
        const id = f(o, 'orderId', 'OrderId');
        return id === orderId ? { ...o, providerStatus: newStatus, ProviderStatus: newStatus } : o;
      }));
    } catch {
      alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const recentOrders = useMemo(
    () => [...normalized].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [normalized]
  );

  const filteredOrders = statusFilter === 'all'
    ? recentOrders
    : recentOrders.filter(o => o.providerStatus === statusFilter);

  const providerName =
    user?.name ?? user?.firstName ?? user?.email?.split('@')[0] ?? 'Provider';

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="pvd-page">

      <div className="pvd-content">

        {/* Header */}
        <div className="pvd-header">
          <div>
            <h1 className="pvd-title">Provider Dashboard</h1>
            <p className="pvd-welcome">
              Welcome back, <strong>{providerName}</strong>! Here&apos;s your business overview.
            </p>
          </div>
          <div className="pvd-header-right">
            <span className="pvd-date">{today}</span>
            <Link to={`/provider/${providerId}/services`} className="pvd-add-btn">
              <Plus size={17} /> Add New Service
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="pvd-stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="pvd-stat-card" style={{ borderLeftColor: s.accent }}>
              <div className="pvd-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                <s.icon size={22} />
              </div>
              <div className="pvd-stat-body">
                <span className="pvd-stat-num">{loading ? '—' : s.value}</span>
                <span className="pvd-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lower layout */}
        <div className="pvd-lower">

          {/* Recent Orders */}
          <div className="pvd-section pvd-orders-section">
            <div className="pvd-section-head">
              <div className="pvd-section-title">
                <ClipboardList size={18} />
                Recent Orders
              </div>
              <div className="pvd-filter-wrap">
                <select
                  className="pvd-filter-select"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pvd-table-scroll">
              <table className="pvd-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="pvd-no-data">
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading orders…
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="pvd-no-data">{error}</td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="pvd-no-data">No orders found</td>
                    </tr>
                  ) : filteredOrders.map(order => {
                    const sm = STATUS_META[order.providerStatus] || STATUS_META.pending;
                    const options = NEXT_STATUS_OPTIONS[order.providerStatus];
                    return (
                      <tr key={order.orderId} className="pvd-tr">
                        <td className="pvd-td pvd-order-id">#{order.orderReference}</td>
                        <td className="pvd-td pvd-cust">{order.customerName}</td>
                        <td className="pvd-td pvd-center">{order.itemCount}</td>
                        <td className="pvd-td pvd-amount">Rs {order.totalAmount.toFixed(2)}</td>
                        <td className="pvd-td pvd-date-cell">{fmtDate(order.createdAt)}</td>
                        <td className="pvd-td">
                          <span className="pvd-status-badge" style={{ background: sm.bg, color: sm.color }}>
                            ● {sm.label}
                          </span>
                        </td>
                        <td className="pvd-td">
                          {options ? (
                            <select
                              className="pvd-status-select"
                              value={order.providerStatus}
                              disabled={updatingId === order.orderId}
                              onChange={e => updateOrderStatus(order.orderId, e.target.value)}
                            >
                              {options.map(opt => (
                                <option key={opt} value={opt}>{STATUS_META[opt]?.label ?? opt}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="pvd-td-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pvd-view-all">
              <button className="pvd-link" onClick={() => navigate(`/provider/${providerId}/orders`)}>
                View all orders <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="pvd-right-col">

            {/* Quick Actions */}
            <div className="pvd-section">
              <div className="pvd-section-head">
                <div className="pvd-section-title">
                  <ArrowRight size={18} />
                  Quick Actions
                </div>
              </div>

              <div className="pvd-actions-grid">
                <button className="pvd-action-btn pvd-ab-blue" onClick={() => navigate(`/provider/${providerId}/services`)}>
                  <div className="pvd-ab-icon"><Package size={22} /></div>
                  <span className="pvd-ab-label">Manage Services</span>
                </button>
                <button className="pvd-action-btn pvd-ab-sky" onClick={() => navigate(`/provider/${providerId}/analytics`)}>
                  <div className="pvd-ab-icon"><TrendingUp size={22} /></div>
                  <span className="pvd-ab-label">View Analytics</span>
                </button>
                <button className="pvd-action-btn pvd-ab-indigo" onClick={() => navigate(`/provider/${providerId}/orders`)}>
                  <div className="pvd-ab-icon"><ClipboardList size={22} /></div>
                  <span className="pvd-ab-label">Manage Orders</span>
                </button>
                <button className="pvd-action-btn pvd-ab-green" onClick={() => navigate(`/provider/${providerId}/profile`)}>
                  <div className="pvd-ab-icon"><UserCircle size={22} /></div>
                  <span className="pvd-ab-label">My Profile</span>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="pvd-section pvd-summary-section">
              <div className="pvd-section-head">
                <div className="pvd-section-title">
                  <Package size={18} />
                  Order Summary
                </div>
              </div>

              <div className="pvd-summary-rows">
                <div className="pvd-summary-row">
                  <div className="pvd-sum-left">
                    <span className="pvd-sum-dot pvd-dot-amber" />
                    <Clock size={15} style={{ color: '#d97706' }} />
                    <span>Pending</span>
                  </div>
                  <strong>{normalized.filter(o => o.providerStatus === 'pending').length}</strong>
                </div>
                <div className="pvd-summary-row">
                  <div className="pvd-sum-left">
                    <span className="pvd-sum-dot pvd-dot-sky" />
                    <AlertCircle size={15} style={{ color: '#0284c7' }} />
                    <span>In Progress</span>
                  </div>
                  <strong>{normalized.filter(o => o.providerStatus === 'in-progress').length}</strong>
                </div>
                <div className="pvd-summary-row">
                  <div className="pvd-sum-left">
                    <span className="pvd-sum-dot pvd-dot-green" />
                    <CheckCircle size={15} style={{ color: '#059669' }} />
                    <span>Completed</span>
                  </div>
                  <strong>{normalized.filter(o => o.providerStatus === 'completed').length}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
