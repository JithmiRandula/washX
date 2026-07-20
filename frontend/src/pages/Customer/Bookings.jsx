import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Clock, Package, ArrowLeft, CheckCircle,
  XCircle, Loader, ShoppingBag, RefreshCw, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import { ordersAPI } from '../../api/commerceApi';
import { reviewsApi } from '../../api/reviewsApi';
import ReviewModal from '../../components/ReviewModal/ReviewModal';
import './Bookings.css';

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending:       { label: 'Pending',     color: '#d97706', bg: '#fef3c7' },
  confirmed:     { label: 'Confirmed',   color: '#1d4ed8', bg: '#dbeafe' },
  'in-progress': { label: 'In Progress', color: '#0284c7', bg: '#e0f2fe' },
  completed:     { label: 'Completed',   color: '#059669', bg: '#ecfdf5' },
  cancelled:     { label: 'Cancelled',   color: '#ef4444', bg: '#fee2e2' },
};

const statusMeta = (s) => STATUS_META[s] ?? STATUS_META.pending;

const DELIVERY_STEPS = ['pending', 'picked_up', 'on_the_way', 'delivered'];
const DELIVERY_STATUS_META = {
  pending:    { label: 'Pending Pickup', color: '#d97706' },
  picked_up:  { label: 'Picked Up',      color: '#0369a1' },
  on_the_way: { label: 'On the Way',     color: '#4f46e5' },
  delivered:  { label: 'Delivered',      color: '#059669' },
};

// How often the delivery status is re-polled while an order's detail view is open.
const DELIVERY_POLL_INTERVAL = 15_000;

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

// overallStatus (from the backend) reflects PROVIDER confirmation, not payment —
// an order stays 'pending' here until a provider accepts it, even if already paid.
const deriveTabStatus = (overallStatus, paymentStatus) => {
  if (overallStatus) return overallStatus;
  if (paymentStatus === 'Failed' || paymentStatus === 'Cancelled') return 'cancelled';
  return 'pending';
};

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const meta = statusMeta(status);
  return (
    <span
      className="cmb-badge"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
};

// ── Order detail view ─────────────────────────────────────────────────────────

const OrderDetail = ({ order, reviewableOrders, onBack, onReviewSuccess }) => {
  const [detail,      setDetail]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [reviewModal, setReviewModal] = useState(null);

  useEffect(() => {
    const orderId = order.orderId ?? order.OrderId;
    let active = true;

    const load = (opts = {}) => {
      if (!opts.silent) setLoading(true);
      ordersAPI.getById(orderId)
        .then((res) => { if (active) setDetail(res?.data ?? res); })
        .catch(console.error)
        .finally(() => { if (active && !opts.silent) setLoading(false); });
    };

    load();
    // Live delivery-status updates while the customer has this order open.
    const timer = setInterval(() => load({ silent: true }), DELIVERY_POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, [order.orderId, order.OrderId]);

  const displayOrder = detail ?? order;
  const items = displayOrder?.items ?? displayOrder?.Items ?? [];
  const deliveries = displayOrder?.deliveries ?? displayOrder?.Deliveries ?? [];
  const status = deriveTabStatus(
    displayOrder?.overallStatus ?? displayOrder?.OverallStatus,
    displayOrder?.paymentStatus ?? displayOrder?.PaymentStatus
  );

  const thisOrderId = displayOrder?.orderId ?? displayOrder?.OrderId;
  const reviewableForThis = (reviewableOrders ?? []).filter(
    r => (r.orderId ?? r.OrderId) === thisOrderId
  );

  return (
    <div className="cmb-detail-page">
      <CustomerNavbar />
      <div className="cmb-detail-wrap">

        <button className="cmb-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back to My Bookings
        </button>

        {loading ? (
          <div className="cmb-loading">
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>Loading order details…</p>
          </div>
        ) : (
          <div className="cmb-detail-cards">

            {/* Header card */}
            <div className="cmb-detail-card">
              <div className="cmb-detail-top">
                <div>
                  <p className="cmb-order-ref-lbl">Order Reference</p>
                  <h2 className="cmb-order-ref">
                    {displayOrder?.orderReference ?? displayOrder?.OrderReference ?? '—'}
                  </h2>
                  {(displayOrder?.providerNames ?? displayOrder?.ProviderNames) && (
                    <p className="cmb-provider-sub">
                      {displayOrder?.providerNames ?? displayOrder?.ProviderNames}
                    </p>
                  )}
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="cmb-detail-meta">
                <div>
                  <p className="cmb-detail-meta-lbl">Date Placed</p>
                  <p className="cmb-detail-meta-val">
                    {fmt.date(displayOrder?.createdAt ?? displayOrder?.CreatedAt)}
                  </p>
                  <p className="cmb-detail-meta-sub">
                    {fmt.time(displayOrder?.createdAt ?? displayOrder?.CreatedAt)}
                  </p>
                </div>
                <div>
                  <p className="cmb-detail-meta-lbl">Total Amount</p>
                  <p className="cmb-detail-meta-val" style={{ fontSize: '1.1rem', color: '#1d4ed8' }}>
                    {fmt.money(displayOrder?.totalAmount ?? displayOrder?.TotalAmount)}
                  </p>
                </div>
                <div>
                  <p className="cmb-detail-meta-lbl">Payment</p>
                  <p className="cmb-detail-meta-val">
                    {displayOrder?.paymentProvider ?? displayOrder?.PaymentProvider ?? '—'}
                  </p>
                  <p className="cmb-detail-meta-sub">
                    {displayOrder?.paymentStatus ?? displayOrder?.PaymentStatus ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="cmb-detail-meta-lbl">Items</p>
                  <p className="cmb-detail-meta-val">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Items list */}
            <div className="cmb-detail-card">
              <h3 className="cmb-detail-card-title">Order Items</h3>

              {items.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No items found.</p>
              ) : (
                <div className="cmb-items-list">
                  {items.map((item, idx) => {
                    const name       = item.itemName    ?? item.ItemName    ?? item.description ?? item.Description ?? 'Item';
                    const kind       = (item.kind       ?? item.Kind        ?? 'item').toLowerCase();
                    const qty        = item.quantity    ?? item.Quantity    ?? 1;
                    const unitPrice  = item.unitPrice   ?? item.UnitPrice   ?? 0;
                    const linePrice  = item.price       ?? item.Price       ?? 0;
                    const provider   = item.providerName ?? item.ProviderName ?? '';
                    const imgUrl     = item.imageUrl    ?? item.ImageUrl    ?? null;
                    const itemStatus = item.status      ?? item.Status      ?? 'pending';

                    return (
                      <div key={item.orderItemId ?? item.OrderItemId ?? idx} className="cmb-item-row">
                        <div className="cmb-item-img">
                          {imgUrl
                            ? <img src={imgUrl} alt={name} />
                            : <Package size={22} color="#94a3b8" />
                          }
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="cmb-item-name">{name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span className={`cmb-item-kind ${kind === 'bulk' ? 'cmb-item-kind-bulk' : 'cmb-item-kind-item'}`}>
                              {kind === 'bulk' ? 'Bulk Package' : 'Item'}
                            </span>
                            {provider && <span className="cmb-item-provider">{provider}</span>}
                          </div>
                        </div>

                        <div className="cmb-item-price-col">
                          <p className="cmb-item-total">{fmt.money(linePrice)}</p>
                          <p className="cmb-item-unit">{qty} × {fmt.money(unitPrice)}</p>
                        </div>

                        <StatusBadge status={itemStatus} />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="cmb-total-row">
                <span className="cmb-total-row-lbl">Total</span>
                <span className="cmb-total-row-amt">
                  {fmt.money(displayOrder?.totalAmount ?? displayOrder?.TotalAmount)}
                </span>
              </div>
            </div>

            {/* Delivery */}
            {deliveries.length > 0 && (
              <div className="cmb-detail-card">
                <h3 className="cmb-detail-card-title">Delivery</h3>
                <div className="cmb-delivery-list">
                  {deliveries.map((d, i) => {
                    const option = d.deliveryOption ?? d.DeliveryOption ?? 'self';
                    const providerName = d.providerName ?? d.ProviderName ?? 'Provider';

                    if (option !== 'provider') {
                      return (
                        <div key={i} className="cmb-delivery-row">
                          <span className="cmb-delivery-provider">{providerName}</span>
                          <span className="cmb-delivery-self">Self drop-off / collection</span>
                        </div>
                      );
                    }

                    const dStatus = d.deliveryStatus ?? d.DeliveryStatus ?? 'pending';
                    const stepIdx = Math.max(0, DELIVERY_STEPS.indexOf(dStatus));

                    return (
                      <div key={i} className="cmb-delivery-row">
                        <span className="cmb-delivery-provider">{providerName}</span>
                        <div className="cmb-delivery-track">
                          {DELIVERY_STEPS.map((step, si) => (
                            <div
                              key={step}
                              className={`cmb-delivery-step${si <= stepIdx ? ' cmb-delivery-step-done' : ''}`}
                            >
                              <span
                                className="cmb-delivery-dot"
                                style={si <= stepIdx ? { background: DELIVERY_STATUS_META[step].color } : {}}
                              />
                              <span className="cmb-delivery-step-label">{DELIVERY_STATUS_META[step].label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {(displayOrder?.notes ?? displayOrder?.Notes) && (
              <div className="cmb-detail-card cmb-notes-card">
                <h3 className="cmb-notes-title">Notes</h3>
                <p className="cmb-notes-text">
                  {displayOrder?.notes ?? displayOrder?.Notes}
                </p>
              </div>
            )}

            {/* Write a Review */}
            {reviewableForThis.length > 0 && (
              <div className="cmb-detail-card">
                <h3 className="cmb-review-title">
                  <Star size={18} fill="#fbbf24" color="#fbbf24" /> Rate Your Experience
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reviewableForThis.map(r => {
                    const pid   = r.providerId  ?? r.ProviderId;
                    const pname = r.providerName ?? r.ProviderName ?? 'Provider';
                    const oref  = displayOrder?.orderReference ?? displayOrder?.OrderReference ?? '';
                    return (
                      <div key={pid} className="cmb-review-row">
                        <span className="cmb-review-provider">{pname}</span>
                        <button
                          className="cmb-write-review-btn"
                          onClick={() => setReviewModal({ orderId: thisOrderId, providerId: pid, providerName: pname, orderRef: oref })}
                        >
                          <Star size={14} /> Write a Review
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {reviewModal && (
          <ReviewModal
            {...reviewModal}
            onClose={() => setReviewModal(null)}
            onSuccess={() => { setReviewModal(null); onReviewSuccess?.(); }}
          />
        )}
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 6;

const pageNums = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
};

// ── Main Bookings page ────────────────────────────────────────────────────────

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab,        setActiveTab]        = useState('all');
  const [orders,           setOrders]           = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [selectedOrder,    setSelectedOrder]    = useState(null);
  const [reviewableOrders, setReviewableOrders] = useState([]);
  const [currentPage,      setCurrentPage]      = useState(1);

  const loadReviewable = useCallback(async () => {
    try {
      const res = await reviewsApi.getReviewableOrders();
      setReviewableOrders(res?.data ?? []);
    } catch { /* silently ignore — not critical */ }
  }, []);

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

  useEffect(() => { loadOrders(); loadReviewable(); }, [loadOrders, loadReviewable]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        reviewableOrders={reviewableOrders}
        onBack={() => setSelectedOrder(null)}
        onReviewSuccess={() => { loadReviewable(); }}
      />
    );
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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const startIdx   = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filteredOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const TABS = [
    { key: 'all',         label: 'All Orders'  },
    { key: 'pending',     label: 'Pending'     },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed',   label: 'Completed'   },
  ];

  return (
    <>
      <CustomerNavbar />
      <div className="cmb-page">
        <div className="cmb-content">

          {/* ── Header ── */}
          <div className="cmb-header">
            <h1 className="cmb-title">My Bookings</h1>
            <p className="cmb-sub">Track and manage your laundry orders</p>
          </div>

          {/* ── Stat Cards ── */}
          <div className="cmb-stats">
            <div className="cmb-stat-card cmb-stat-total">
              <span className="cmb-stat-num">{orders.length}</span>
              <span className="cmb-stat-lbl">Total Orders</span>
            </div>
            <div className="cmb-stat-card cmb-stat-pending">
              <span className="cmb-stat-num">{count(['pending'])}</span>
              <span className="cmb-stat-lbl">Pending</span>
            </div>
            <div className="cmb-stat-card cmb-stat-progress">
              <span className="cmb-stat-num">{count(['in-progress', 'confirmed'])}</span>
              <span className="cmb-stat-lbl">In Progress</span>
            </div>
            <div className="cmb-stat-card cmb-stat-completed">
              <span className="cmb-stat-num">{count(['completed'])}</span>
              <span className="cmb-stat-lbl">Completed</span>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="cmb-tabs">
            <div className="cmb-tab-group">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`cmb-tab${activeTab === key ? ' cmb-tab-active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="cmb-refresh-btn" onClick={loadOrders}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="cmb-loading">
              <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem' }}>Loading your orders…</p>
            </div>
          ) : error ? (
            <div className="cmb-error">
              <XCircle size={40} />
              <p style={{ marginTop: '1rem', fontWeight: 600 }}>{error}</p>
              <button className="cmb-try-btn" onClick={loadOrders}>Try Again</button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="cmb-empty">
              <ShoppingBag size={48} className="cmb-empty-icon" />
              <h3>No orders found</h3>
              <p>
                {activeTab === 'all'
                  ? "You haven't placed any orders yet."
                  : `No ${activeTab === 'in-progress' ? 'in-progress' : activeTab} orders.`}
              </p>
              {activeTab === 'all' && (
                <button className="cmb-find-btn" onClick={() => navigate(-1)}>
                  Find Providers
                </button>
              )}
            </div>
          ) : (
            <div className="cmb-list">
              {pageItems.map((order) => {
                const orderId       = order.orderId        ?? order.OrderId;
                const ref           = order.orderReference ?? order.OrderReference ?? '—';
                const providerNames = order.providerNames  ?? order.ProviderNames  ?? '';
                const total         = order.totalAmount    ?? order.TotalAmount    ?? 0;
                const itemCount     = order.itemCount      ?? order.ItemCount      ?? 0;
                const createdAt     = order.createdAt      ?? order.CreatedAt;
                const status        = normalizeStatus(order);

                const hasReviewable = reviewableOrders.some(
                  r => (r.orderId ?? r.OrderId) === orderId
                );

                return (
                  <div
                    key={orderId}
                    className="cmb-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="cmb-card-body">
                      <div className="cmb-card-left">
                        <div className="cmb-card-top">
                          <div>
                            <h3 className="cmb-provider-name">
                              {providerNames || 'Order'}
                            </h3>
                            <p className="cmb-ref">Ref: {ref}</p>
                          </div>
                          <div className="cmb-badge-row">
                            <StatusBadge status={status} />
                            {hasReviewable && (
                              <span className="cmb-review-badge">
                                <Star size={11} fill="#f59e0b" color="#f59e0b" /> Leave a Review
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="cmb-card-meta">
                          <span className="cmb-meta-item">
                            <Calendar size={14} /> {fmt.date(createdAt)}
                          </span>
                          <span className="cmb-meta-item">
                            <Clock size={14} /> {fmt.time(createdAt)}
                          </span>
                          <span className="cmb-meta-item">
                            <Package size={14} /> {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="cmb-card-right">
                        <p className="cmb-total-lbl">Total</p>
                        <p className="cmb-total-amt">{fmt.money(total)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="cmb-pagination">
                  <span className="cmb-page-info">
                    {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                  </span>
                  <div className="cmb-page-btns">
                    <button
                      className="cmb-page-btn cmb-page-nav"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {pageNums(safePage, totalPages).map((n, i) =>
                      n === '…'
                        ? <span key={`d${i}`} className="cmb-page-dots">…</span>
                        : <button
                            key={n}
                            className={`cmb-page-btn${safePage === n ? ' cmb-page-active' : ''}`}
                            onClick={() => setCurrentPage(n)}
                          >
                            {n}
                          </button>
                    )}
                    <button
                      className="cmb-page-btn cmb-page-nav"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Bookings;
