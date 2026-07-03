import { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { adminApi } from '../../api/adminApi';
import {
  Search, Filter, Eye, Package, Download,
  ChevronLeft, ChevronRight, X, Clock,
  CheckCircle, AlertCircle, TrendingUp, XCircle
} from 'lucide-react';
import './AdminOrders.css';

const ITEMS_PER_PAGE = 8;

const STATUS_META = {
  pending:     { bg: '#fffbeb', color: '#d97706', label: 'Pending'     },
  confirmed:   { bg: '#eff6ff', color: '#2563eb', label: 'Confirmed'   },
  in_progress: { bg: '#e0f2fe', color: '#0369a1', label: 'In Progress' },
  completed:   { bg: '#ecfdf5', color: '#059669', label: 'Completed'   },
  cancelled:   { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled'   },
};

const PAYMENT_META = {
  paid:     { bg: '#ecfdf5', color: '#059669', label: 'Paid'     },
  pending:  { bg: '#fffbeb', color: '#d97706', label: 'Pending'  },
  refunded: { bg: '#f5f3ff', color: '#7c3aed', label: 'Refunded' },
};

const AdminOrders = () => {
  const [orders, setOrders]             = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]             = useState('date');
  const [currentPage, setCurrentPage]   = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getOrders();
        const data = (res?.data || []).map(o => ({
          id:            o.orderId        ?? o.OrderId,
          orderNumber:   o.orderReference ?? o.OrderReference ?? String(o.orderId ?? o.OrderId),
          customerName:  o.customerName   ?? o.CustomerName   ?? '',
          customerEmail: o.customerEmail  ?? o.CustomerEmail  ?? '',
          customerPhone: o.customerPhone  ?? o.CustomerPhone  ?? '',
          providerName:  o.providerName   ?? o.ProviderName   ?? '—',
          status:        (o.status ?? o.Status ?? 'pending').toLowerCase().replace(/-/g, '_'),
          totalAmount:   Number(o.totalAmount  ?? o.TotalAmount  ?? 0),
          paymentStatus: (o.paymentStatus ?? o.PaymentStatus ?? 'pending').toLowerCase(),
          createdAt:     o.createdAt      ?? o.CreatedAt      ?? '',
        }));
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortBy]);

  const filtered = useMemo(() => {
    let list = orders;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q)   ||
        o.customerName.toLowerCase().includes(q)  ||
        o.providerName.toLowerCase().includes(q)  ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [orders, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const startIdx   = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goTo = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const pageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const updateStatus = (id, status) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const exportCSV = () => {
    const rows = [
      ['Order Reference', 'Customer', 'Email', 'Provider', 'Status', 'Payment', 'Amount', 'Date'],
      ...filtered.map(o => [
        o.orderNumber, o.customerName, o.customerEmail,
        o.providerName, o.status, o.paymentStatus,
        o.totalAmount,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''
      ])
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'orders.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.totalAmount, 0);

  const countBy = (status) => orders.filter(o => o.status === status).length;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Detail Modal
  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;
    const sm = STATUS_META[order.status]  || STATUS_META.pending;
    const pm = PAYMENT_META[order.paymentStatus] || PAYMENT_META.pending;
    return (
      <div className="aor-overlay" onClick={onClose}>
        <div className="aor-modal" onClick={e => e.stopPropagation()}>
          <div className="aor-modal-head">
            <div>
              <h2 className="aor-modal-title">Order Details</h2>
              <p className="aor-modal-ref">#{order.orderNumber}</p>
            </div>
            <button className="aor-modal-close" onClick={onClose}><X size={20} /></button>
          </div>
          <div className="aor-modal-body">
            <div className="aor-detail-grid">
              <div className="aor-detail-block">
                <h4>Customer</h4>
                <p><strong>Name:</strong> {order.customerName || '—'}</p>
                <p><strong>Email:</strong> {order.customerEmail || '—'}</p>
                <p><strong>Phone:</strong> {order.customerPhone || '—'}</p>
              </div>
              <div className="aor-detail-block">
                <h4>Order Info</h4>
                <p><strong>Provider:</strong> {order.providerName}</p>
                <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: sm.color, fontWeight: 600 }}>{sm.label}</span>
                </p>
                <p>
                  <strong>Payment:</strong>{' '}
                  <span style={{ color: pm.color, fontWeight: 600 }}>{pm.label}</span>
                </p>
              </div>
              <div className="aor-detail-block aor-detail-total">
                <h4>Total Amount</h4>
                <p className="aor-modal-amount">Rs {order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="aor-page">
      <AdminNavbar />

      <div className="aor-content">
        {/* Header */}
        <div className="aor-header">
          <div>
            <h1 className="aor-title">Orders Management</h1>
            <p className="aor-sub">Track and manage all customer orders</p>
          </div>
          <button className="aor-export-btn" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Stat Cards */}
        <div className="aor-stats-grid">
          <div className="aor-stat-card aor-sc-blue">
            <div className="aor-sc-icon"><Package size={22} /></div>
            <div className="aor-sc-body">
              <span className="aor-sc-num">{orders.length}</span>
              <span className="aor-sc-label">Total Orders</span>
            </div>
          </div>
          <div className="aor-stat-card aor-sc-amber">
            <div className="aor-sc-icon"><Clock size={22} /></div>
            <div className="aor-sc-body">
              <span className="aor-sc-num">{countBy('pending')}</span>
              <span className="aor-sc-label">Pending</span>
            </div>
          </div>
          <div className="aor-stat-card aor-sc-sky">
            <div className="aor-sc-icon"><AlertCircle size={22} /></div>
            <div className="aor-sc-body">
              <span className="aor-sc-num">{countBy('in_progress')}</span>
              <span className="aor-sc-label">In Progress</span>
            </div>
          </div>
          <div className="aor-stat-card aor-sc-green">
            <div className="aor-sc-icon"><CheckCircle size={22} /></div>
            <div className="aor-sc-body">
              <span className="aor-sc-num">{countBy('completed')}</span>
              <span className="aor-sc-label">Completed</span>
            </div>
          </div>
          <div className="aor-stat-card aor-sc-darkblue">
            <div className="aor-sc-icon"><TrendingUp size={22} /></div>
            <div className="aor-sc-body">
              <span className="aor-sc-num aor-sc-num-sm">Rs {totalRevenue.toLocaleString()}</span>
              <span className="aor-sc-label">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="aor-controls">
          <div className="aor-search">
            <Search size={17} className="aor-search-icon" />
            <input
              type="text"
              placeholder="Search by order ref, customer or provider…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="aor-search-input"
            />
            {searchTerm && (
              <button className="aor-clear-btn" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>
          <div className="aor-filter-row">
            <Filter size={15} className="aor-filter-icon" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="aor-filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="aor-filter-row">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="aor-filter-select">
              <option value="date">Sort: Newest</option>
              <option value="amount">Sort: Amount</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="aor-table-card">
          <div className="aor-table-topbar">
            <span className="aor-table-count">
              {filtered.length === 0
                ? 'No orders found'
                : `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} orders`}
            </span>
          </div>

          {loading ? (
            <div className="aor-loading">
              <div className="aor-spinner" />
              <p>Loading orders…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="aor-empty">
              <Package size={48} />
              <h3>No orders found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="aor-table-scroll">
              <table className="aor-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((order, idx) => {
                    const sm = STATUS_META[order.status]          || STATUS_META.pending;
                    const pm = PAYMENT_META[order.paymentStatus]  || PAYMENT_META.pending;
                    return (
                      <tr key={order.id} className="aor-tr">
                        <td className="aor-td aor-td-num">{startIdx + idx + 1}</td>

                        <td className="aor-td">
                          <div className="aor-order-ref">#{order.orderNumber}</div>
                        </td>

                        <td className="aor-td">
                          <div className="aor-cust-name">{order.customerName}</div>
                          <div className="aor-cust-email">{order.customerEmail}</div>
                        </td>

                        <td className="aor-td">
                          <div className="aor-provider-name">{order.providerName}</div>
                        </td>

                        <td className="aor-td">
                          <span className="aor-badge" style={{ background: sm.bg, color: sm.color }}>
                            ● {sm.label}
                          </span>
                        </td>

                        <td className="aor-td">
                          <span className="aor-badge" style={{ background: pm.bg, color: pm.color }}>
                            {pm.label}
                          </span>
                        </td>

                        <td className="aor-td aor-td-money">
                          Rs {order.totalAmount.toFixed(2)}
                        </td>

                        <td className="aor-td aor-td-date">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="aor-td">
                          <div className="aor-actions">
                            <button
                              className="aor-btn aor-btn-view"
                              onClick={() => setSelectedOrder(order)}
                              title="View details"
                            >
                              <Eye size={13} />
                            </button>

                            {order.status === 'pending' && (
                              <>
                                <button className="aor-btn aor-btn-confirm" onClick={() => updateStatus(order.id, 'confirmed')}>
                                  Confirm
                                </button>
                                <button className="aor-btn aor-btn-cancel" onClick={() => updateStatus(order.id, 'cancelled')}>
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <>
                                <button className="aor-btn aor-btn-progress" onClick={() => updateStatus(order.id, 'in_progress')}>
                                  Start
                                </button>
                                <button className="aor-btn aor-btn-cancel" onClick={() => updateStatus(order.id, 'cancelled')}>
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            {order.status === 'in_progress' && (
                              <button className="aor-btn aor-btn-complete" onClick={() => updateStatus(order.id, 'completed')}>
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > ITEMS_PER_PAGE && (
            <div className="aor-pagination">
              <span className="aor-page-info">Page {safePage} of {totalPages}</span>
              <div className="aor-page-btns">
                <button className="aor-page-btn aor-page-nav" onClick={() => goTo(safePage - 1)} disabled={safePage === 1}>
                  <ChevronLeft size={16} />
                </button>
                {pageNumbers().map((pg, i) =>
                  pg === '...' ? (
                    <span key={`d-${i}`} className="aor-page-dots">…</span>
                  ) : (
                    <button
                      key={pg}
                      className={`aor-page-btn ${pg === safePage ? 'aor-page-active' : ''}`}
                      onClick={() => goTo(pg)}
                    >
                      {pg}
                    </button>
                  )
                )}
                <button className="aor-page-btn aor-page-nav" onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default AdminOrders;
