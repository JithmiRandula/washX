import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, Package, ArrowLeft, CheckCircle,
  XCircle, Loader, ShoppingBag, RefreshCw
} from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import { ordersAPI } from '../../api/commerceApi';
import './Bookings.css';

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:     { label: 'Pending',     color: '#f59e0b', bg: '#fef3c7' },
  confirmed:   { label: 'Confirmed',   color: '#2563eb', bg: '#dbeafe' },
  'in-progress': { label: 'In Progress', color: '#7c3aed', bg: '#ede9fe' },
  completed:   { label: 'Completed',   color: '#10b981', bg: '#d1fae5' },
  cancelled:   { label: 'Cancelled',   color: '#ef4444', bg: '#fee2e2' },
};

const statusMeta = (s) => STATUS_META[s] ?? STATUS_META.pending;

const fmt = {
  date: (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-LK', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  },
  time: (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-LK', {
      hour: '2-digit', minute: '2-digit'
    });
  },
  money: (n) => `Rs ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};

const deriveTabStatus = (overallStatus, paymentStatus) => {
  if (overallStatus) return overallStatus;
  if (paymentStatus === 'Paid') return 'confirmed';
  if (paymentStatus === 'Failed' || paymentStatus === 'Cancelled') return 'cancelled';
  return 'pending';
};

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta = statusMeta(status);
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      color: meta.color,
      background: meta.bg,
      letterSpacing: '0.03em'
    }}>
      {meta.label}
    </span>
  );
};

// ── Order detail view ─────────────────────────────────────────────────────────

const OrderDetail = ({ order, onBack }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(order.orderId ?? order.OrderId)
      .then((res) => setDetail(res?.data ?? res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [order.orderId, order.OrderId]);

  const displayOrder = detail ?? order;
  const items = displayOrder?.items ?? displayOrder?.Items ?? [];
  const status = deriveTabStatus(
    displayOrder?.overallStatus ?? displayOrder?.OverallStatus,
    displayOrder?.paymentStatus ?? displayOrder?.PaymentStatus
  );

  return (
    <div className="detail-page">
      <CustomerNavbar />
      <div className="detail-container">
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>
          {/* Back */}
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.95rem'
            }}
          >
            <ArrowLeft size={18} /> Back to My Bookings
          </button>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
              <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem' }}>Loading order details…</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Header card */}
              <div style={{
                background: 'white', borderRadius: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                padding: '1.5rem 2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Order Reference
                    </p>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                      {displayOrder?.orderReference ?? displayOrder?.OrderReference ?? '—'}
                    </h2>
                    {(displayOrder?.providerNames ?? displayOrder?.ProviderNames) && (
                      <p style={{ color: '#6b7280', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                        {displayOrder?.providerNames ?? displayOrder?.ProviderNames}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={status} />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1.25rem',
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Date Placed</p>
                    <p style={{ fontWeight: 600, color: '#1f2937' }}>
                      {fmt.date(displayOrder?.createdAt ?? displayOrder?.CreatedAt)}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {fmt.time(displayOrder?.createdAt ?? displayOrder?.CreatedAt)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Total Amount</p>
                    <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '1.1rem' }}>
                      {fmt.money(displayOrder?.totalAmount ?? displayOrder?.TotalAmount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Payment</p>
                    <p style={{ fontWeight: 600, color: '#1f2937' }}>
                      {displayOrder?.paymentProvider ?? displayOrder?.PaymentProvider ?? '—'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {displayOrder?.paymentStatus ?? displayOrder?.PaymentStatus ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.2rem' }}>Items</p>
                    <p style={{ fontWeight: 600, color: '#1f2937' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Items list */}
              <div style={{
                background: 'white', borderRadius: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                padding: '1.5rem 2rem'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem' }}>
                  Order Items
                </h3>

                {items.length === 0 ? (
                  <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>No items found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((item, idx) => {
                      const name = item.itemName ?? item.ItemName ?? item.description ?? item.Description ?? 'Item';
                      const kind = (item.kind ?? item.Kind ?? 'item').toLowerCase();
                      const qty = item.quantity ?? item.Quantity ?? 1;
                      const unitPrice = item.unitPrice ?? item.UnitPrice ?? 0;
                      const linePrice = item.price ?? item.Price ?? 0;
                      const provider = item.providerName ?? item.ProviderName ?? '';
                      const imgUrl = item.imageUrl ?? item.ImageUrl ?? null;
                      const itemStatus = item.status ?? item.Status ?? 'pending';

                      return (
                        <div key={item.orderItemId ?? item.OrderItemId ?? idx} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.875rem 1rem',
                          background: '#f9fafb',
                          borderRadius: '0.75rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          {/* Image */}
                          <div style={{
                            width: 52, height: 52, borderRadius: '0.5rem',
                            overflow: 'hidden', flexShrink: 0,
                            background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {imgUrl ? (
                              <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={22} color="#9ca3af" />
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: '#1f2937', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.7rem', padding: '0.1rem 0.5rem',
                                borderRadius: '999px', fontWeight: 600,
                                background: kind === 'bulk' ? '#dbeafe' : '#f3f4f6',
                                color: kind === 'bulk' ? '#1d4ed8' : '#6b7280'
                              }}>
                                {kind === 'bulk' ? 'Bulk Package' : 'Item'}
                              </span>
                              {provider && <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{provider}</span>}
                            </div>
                          </div>

                          {/* Qty & price */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontWeight: 700, color: '#1f2937', margin: 0 }}>{fmt.money(linePrice)}</p>
                            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>
                              {qty} × {fmt.money(unitPrice)}
                            </p>
                          </div>

                          {/* Item status badge */}
                          <StatusBadge status={itemStatus} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '2px solid #f3f4f6'
                }}>
                  <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '1rem' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '1.25rem' }}>
                    {fmt.money(displayOrder?.totalAmount ?? displayOrder?.TotalAmount)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {(displayOrder?.notes ?? displayOrder?.Notes) && (
                <div style={{
                  background: 'white', borderRadius: '1rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  padding: '1.25rem 2rem'
                }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Notes</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>{displayOrder?.notes ?? displayOrder?.Notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Bookings page ────────────────────────────────────────────────────────

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersAPI.getMine();
      setOrders(res?.data ?? []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err?.response?.data?.message || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  const normalizeStatus = (o) =>
    deriveTabStatus(o?.overallStatus ?? o?.OverallStatus, o?.paymentStatus ?? o?.PaymentStatus);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') {
      const s = normalizeStatus(o);
      return s === 'in-progress' || s === 'confirmed';
    }
    return normalizeStatus(o) === activeTab;
  });

  const count = (statuses) =>
    orders.filter((o) => statuses.includes(normalizeStatus(o))).length;

  return (
    <>
      <CustomerNavbar />
      <div className="bookings-page">
        <div className="bookings-main">
          <div className="bookings-header">
            <h1>My Bookings</h1>
            <p>Track and manage your laundry orders</p>
          </div>

          <div className="bookings-container">
            {/* Stats */}
            <div className="stats-cards">
              <div className="stat-card total">
                <div className="stat-number">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card pending">
                <div className="stat-number">{count(['pending'])}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card progress">
                <div className="stat-number">{count(['in-progress', 'confirmed'])}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card completed">
                <div className="stat-number">{count(['completed'])}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="filter-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'in-progress', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    className={`tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'all' ? 'All Orders'
                      : tab === 'in-progress' ? 'In Progress'
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={loadOrders}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: 'none', border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem', padding: '0.4rem 0.75rem',
                  cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem'
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '1rem' }}>Loading your orders…</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#ef4444' }}>
                <XCircle size={40} />
                <p style={{ marginTop: '1rem', fontWeight: 600 }}>{error}</p>
                <button
                  onClick={loadOrders}
                  style={{
                    marginTop: '1rem', padding: '0.6rem 1.5rem',
                    background: '#2563eb', color: 'white', border: 'none',
                    borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="no-bookings">
                <ShoppingBag size={48} />
                <h3>No orders found</h3>
                <p>
                  {activeTab === 'all'
                    ? "You haven't placed any orders yet."
                    : `No ${activeTab === 'in-progress' ? 'in-progress' : activeTab} orders.`}
                </p>
                {activeTab === 'all' && (
                  <button
                    onClick={() => navigate(-1)}
                    style={{
                      marginTop: '1rem', padding: '0.6rem 1.5rem',
                      background: '#2563eb', color: 'white', border: 'none',
                      borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    Find Providers
                  </button>
                )}
              </div>
            ) : (
              <div className="bookings-list">
                {filteredOrders.map((order) => {
                  const orderId = order.orderId ?? order.OrderId;
                  const ref = order.orderReference ?? order.OrderReference ?? '—';
                  const providerNames = order.providerNames ?? order.ProviderNames ?? '';
                  const total = order.totalAmount ?? order.TotalAmount ?? 0;
                  const itemCount = order.itemCount ?? order.ItemCount ?? 0;
                  const createdAt = order.createdAt ?? order.CreatedAt;
                  const status = normalizeStatus(order);

                  return (
                    <div
                      key={orderId}
                      className="booking-card"
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="booking-content" style={{ padding: '1.25rem 1.5rem' }}>
                        <div className="left-content" style={{ flex: 1, minWidth: 0 }}>
                          {/* Provider & ref */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>
                                {providerNames || 'Order'}
                              </h3>
                              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                                Ref: {ref}
                              </p>
                            </div>
                            <StatusBadge status={status} />
                          </div>

                          {/* Meta row */}
                          <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '1rem',
                            marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Calendar size={14} />
                              {fmt.date(createdAt)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={14} />
                              {fmt.time(createdAt)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Package size={14} />
                              {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Total */}
                        <div style={{ textAlign: 'right', marginLeft: 'auto', paddingLeft: '1rem', flexShrink: 0 }}>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>Total</p>
                          <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '1.1rem', margin: '0.2rem 0 0' }}>
                            {fmt.money(total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Bookings;
