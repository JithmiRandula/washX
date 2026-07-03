import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Package, DollarSign, TrendingUp, Users,
  Plus, UserCircle, ClipboardList,
  Clock, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import './ProviderDashboard.css';

const STATUS_META = {
  pending:     { bg: '#fffbeb', color: '#d97706', label: 'Pending'     },
  'in-progress':{ bg: '#e0f2fe', color: '#0369a1', label: 'In Progress' },
  ready:       { bg: '#ecfdf5', color: '#059669', label: 'Ready'       },
  completed:   { bg: '#f1f5f9', color: '#64748b', label: 'Completed'   },
  cancelled:   { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled'   },
};

const ProviderDashboard = () => {
  const { user }       = useAuth();
  const { providerId } = useParams();
  const navigate       = useNavigate();

  const [orders, setOrders] = useState([
    { id: '1', customer: 'John Doe',    status: 'pending',     amount: 45,  items: 3, date: '2025-12-08' },
    { id: '2', customer: 'Jane Smith',  status: 'in-progress', amount: 60,  items: 5, date: '2025-12-08' },
    { id: '3', customer: 'Bob Johnson', status: 'ready',       amount: 30,  items: 2, date: '2025-12-07' },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    { icon: Package,    label: 'Total Orders', value: '156',      accent: '#1d4ed8', iconBg: '#dbeafe', iconColor: '#1d4ed8' },
    { icon: DollarSign, label: 'Revenue',      value: 'Rs 8,450', accent: '#059669', iconBg: '#ecfdf5', iconColor: '#059669' },
    { icon: TrendingUp, label: 'This Month',   value: '+23%',     accent: '#0284c7', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { icon: Users,      label: 'Customers',    value: '89',       accent: '#d97706', iconBg: '#fffbeb', iconColor: '#d97706' },
  ];

  const updateOrderStatus = (orderId, newStatus) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const providerName =
    user?.name ?? user?.firstName ?? user?.email?.split('@')[0] ?? 'Provider';

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

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
          {stats.map((s, i) => (
            <div key={i} className="pvd-stat-card" style={{ borderLeftColor: s.accent }}>
              <div className="pvd-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                <s.icon size={22} />
              </div>
              <div className="pvd-stat-body">
                <span className="pvd-stat-num">{s.value}</span>
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
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="pvd-no-data">No orders found</td>
                    </tr>
                  ) : filteredOrders.map(order => {
                    const sm = STATUS_META[order.status] || STATUS_META.pending;
                    return (
                      <tr key={order.id} className="pvd-tr">
                        <td className="pvd-td pvd-order-id">#{order.id}</td>
                        <td className="pvd-td pvd-cust">{order.customer}</td>
                        <td className="pvd-td pvd-center">{order.items}</td>
                        <td className="pvd-td pvd-amount">Rs {order.amount}</td>
                        <td className="pvd-td pvd-date-cell">{order.date}</td>
                        <td className="pvd-td">
                          <span className="pvd-status-badge" style={{ background: sm.bg, color: sm.color }}>
                            ● {sm.label}
                          </span>
                        </td>
                        <td className="pvd-td">
                          <select
                            className="pvd-status-select"
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                          </select>
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
                  <strong>{orders.filter(o => o.status === 'pending').length}</strong>
                </div>
                <div className="pvd-summary-row">
                  <div className="pvd-sum-left">
                    <span className="pvd-sum-dot pvd-dot-sky" />
                    <AlertCircle size={15} style={{ color: '#0284c7' }} />
                    <span>In Progress</span>
                  </div>
                  <strong>{orders.filter(o => o.status === 'in-progress').length}</strong>
                </div>
                <div className="pvd-summary-row">
                  <div className="pvd-sum-left">
                    <span className="pvd-sum-dot pvd-dot-green" />
                    <CheckCircle size={15} style={{ color: '#059669' }} />
                    <span>Completed</span>
                  </div>
                  <strong>{orders.filter(o => o.status === 'completed' || o.status === 'ready').length}</strong>
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
