import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Eye, Check, X, Clock,
  MapPin, Phone, CreditCard, Banknote, MessageCircle, Truck,
  RefreshCw, Package, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { providerOrdersAPI } from '../../api/commerceApi';
import './ProviderOrders.css';

const ITEMS_PER_PAGE = 6;

const STATUS_META = {
  pending:       { bg: '#fffbeb', color: '#d97706', label: 'Pending',     dot: '#d97706' },
  'in-progress': { bg: '#e0f2fe', color: '#0369a1', label: 'In Progress', dot: '#0284c7' },
  completed:     { bg: '#ecfdf5', color: '#059669', label: 'Completed',   dot: '#059669' },
  cancelled:     { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled',   dot: '#dc2626' },
};

const DELIVERY_STATUS_META = {
  pending:    { bg: '#fffbeb', color: '#d97706', label: 'Pending Pickup' },
  picked_up:  { bg: '#e0f2fe', color: '#0369a1', label: 'Picked Up'      },
  on_the_way: { bg: '#eef2ff', color: '#4f46e5', label: 'On the Way'     },
  delivered:  { bg: '#ecfdf5', color: '#059669', label: 'Delivered'      },
};

const NEXT_DELIVERY_STATUS = { pending: 'picked_up', picked_up: 'on_the_way', on_the_way: 'delivered' };
const NEXT_DELIVERY_LABEL  = { pending: 'Mark Picked Up', picked_up: 'Mark On the Way', on_the_way: 'Mark Delivered' };

const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—';

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <span className="pvo-badge" style={{ background: m.bg, color: m.color }}>
      ● {m.label}
    </span>
  );
};

const ProviderOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
  const [actionLoading, setAction]   = useState(null);
  const [filterStatus, setFilter]    = useState('all');
  const [searchTerm, setSearch]      = useState('');
  const [selectedOrder, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await providerOrdersAPI.getMine();
      setOrders(res?.data ?? []);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const norm = (o) => ({
    orderId:         o.orderId         ?? o.OrderId,
    customerId:      o.customerId      ?? o.CustomerId,
    orderReference:  o.orderReference  ?? o.OrderReference  ?? '—',
    totalAmount:     o.totalAmount     ?? o.TotalAmount      ?? 0,
    paymentProvider: o.paymentProvider ?? o.PaymentProvider  ?? '',
    paymentStatus:   o.paymentStatus   ?? o.PaymentStatus    ?? '',
    customerName:    o.customerName    ?? o.CustomerName     ?? '—',
    customerPhone:   o.customerPhone   ?? o.CustomerPhone    ?? '',
    customerAddress: o.customerAddress ?? o.CustomerAddress  ?? '',
    itemCount:       o.itemCount       ?? o.ItemCount        ?? 0,
    providerStatus:  o.providerStatus  ?? o.ProviderStatus   ?? 'pending',
    createdAt:       o.createdAt       ?? o.CreatedAt,
    notes:           o.notes           ?? o.Notes            ?? '',
    items: (o.items ?? o.Items ?? []).map(i => ({
      orderItemId: i.orderItemId ?? i.OrderItemId,
      itemName:    i.itemName    ?? i.ItemName    ?? '—',
      description: i.description ?? i.Description ?? '',
      quantity:    i.quantity    ?? i.Quantity    ?? 1,
      unitPrice:   i.unitPrice   ?? i.UnitPrice   ?? 0,
      price:       i.price       ?? i.Price       ?? 0,
    })),
    delivery: (() => {
      const d = (o.deliveries ?? o.Deliveries ?? [])[0];
      if (!d) return null;
      const option = d.deliveryOption ?? d.DeliveryOption ?? 'self';
      if (option !== 'provider') return null;
      return {
        status: d.deliveryStatus ?? d.DeliveryStatus ?? 'pending',
        fee:    d.deliveryFee    ?? d.DeliveryFee    ?? 0,
      };
    })(),
  });

  const updateStatus = async (orderId, status) => {
    setAction(orderId);
    try {
      await providerOrdersAPI.updateStatus(orderId, status);
      setOrders(prev =>
        prev.map(o => {
          const id = o.orderId ?? o.OrderId;
          return id === orderId ? { ...o, providerStatus: status, ProviderStatus: status } : o;
        })
      );
      if ((selectedOrder?.orderId ?? selectedOrder?.OrderId) === orderId) {
        setSelected(s => ({ ...s, providerStatus: status, ProviderStatus: status }));
      }
    } catch {
      alert('Failed to update order status.');
    } finally {
      setAction(null);
    }
  };

  const updateDelivery = async (orderId, status) => {
    setAction(orderId);
    try {
      await providerOrdersAPI.updateDeliveryStatus(orderId, status);
      setOrders(prev =>
        prev.map(o => {
          const id = o.orderId ?? o.OrderId;
          if (id !== orderId) return o;
          const deliveries = (o.deliveries ?? o.Deliveries ?? []).map((d, i) =>
            i === 0 ? { ...d, deliveryStatus: status, DeliveryStatus: status } : d
          );
          return { ...o, deliveries, Deliveries: deliveries };
        })
      );
    } catch {
      alert('Failed to update delivery status.');
    } finally {
      setAction(null);
    }
  };

  const normalized = orders.map(norm);

  const filtered = normalized.filter(o => {
    const matchStatus = filterStatus === 'all' || o.providerStatus === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q
      || o.customerName.toLowerCase().includes(q)
      || o.orderReference.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const startIdx   = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems  = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const goTo = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const pageNums = () => {
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

  const stats = {
    pending:    normalized.filter(o => o.providerStatus === 'pending').length,
    inProgress: normalized.filter(o => o.providerStatus === 'in-progress').length,
    completed:  normalized.filter(o => o.providerStatus === 'completed').length,
    cancelled:  normalized.filter(o => o.providerStatus === 'cancelled').length,
  };

  return (
    <div className="pvo-page">
      <div className="pvo-content">

        {/* ── Header ── */}
        <div className="pvo-header">
          <div className="pvo-header-left">
            <h1 className="pvo-title">Orders Management</h1>
            <p className="pvo-sub">Manage and track all customer orders</p>
          </div>
          <div className="pvo-header-right">
            <div className="pvo-stat-pill pvo-sp-amber">
              <Clock size={14} />
              <span className="pvo-sp-num">{stats.pending}</span>
              <span className="pvo-sp-lbl">Pending</span>
            </div>
            <div className="pvo-stat-pill pvo-sp-sky">
              <AlertCircle size={14} />
              <span className="pvo-sp-num">{stats.inProgress}</span>
              <span className="pvo-sp-lbl">In Progress</span>
            </div>
            <div className="pvo-stat-pill pvo-sp-green">
              <CheckCircle size={14} />
              <span className="pvo-sp-num">{stats.completed}</span>
              <span className="pvo-sp-lbl">Completed</span>
            </div>
            <div className="pvo-stat-pill pvo-sp-red">
              <XCircle size={14} />
              <span className="pvo-sp-num">{stats.cancelled}</span>
              <span className="pvo-sp-lbl">Cancelled</span>
            </div>
            <button
              className={`pvo-refresh-btn${loading ? ' pvo-spinning' : ''}`}
              onClick={load}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="pvo-controls">
          <div className="pvo-search">
            <Search size={17} className="pvo-search-icon" />
            <input
              type="text"
              placeholder="Search by customer name or order ID…"
              value={searchTerm}
              onChange={e => setSearch(e.target.value)}
              className="pvo-search-input"
            />
            {searchTerm && (
              <button className="pvo-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>
          <div className="pvo-filter-row">
            <Filter size={15} className="pvo-filter-icon" />
            <select
              value={filterStatus}
              onChange={e => setFilter(e.target.value)}
              className="pvo-filter-select"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <span className="pvo-result-count">
            {!loading && filtered.length > 0
              ? `Showing ${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} orders`
              : ''}
          </span>
        </div>

        {/* ── Body ── */}
        {loading && (
          <div className="pvo-loading">
            <div className="pvo-spinner" />
            <p>Loading orders…</p>
          </div>
        )}

        {!loading && error && (
          <div className="pvo-empty">
            <XCircle size={48} style={{ color: '#dc2626' }} />
            <h3>{error}</h3>
            <button className="pvo-retry-btn" onClick={load}>Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="pvo-empty">
            <Package size={48} />
            <h3>No orders found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="pvo-grid">
            {pageItems.map(o => {
              const busy     = actionLoading === o.orderId;
              const sm       = STATUS_META[o.providerStatus] || STATUS_META.pending;
              const isOnline = o.paymentProvider === 'PayHere';
              return (
                <div key={o.orderId} className="pvo-card" style={{ borderTopColor: sm.dot }}>

                  {/* Card head */}
                  <div className="pvo-card-head">
                    <div className="pvo-card-ref">#{o.orderReference}</div>
                    <div className="pvo-card-head-right">
                      <StatusBadge status={o.providerStatus} />
                      {o.customerId && (
                        <button
                          className="pvo-eye-btn"
                          title="Message customer"
                          onClick={() => navigate(`/provider/${user?.providerId}/messages`, {
                            state: { startWith: { customerId: o.customerId, name: o.customerName } }
                          })}
                        >
                          <MessageCircle size={15} />
                        </button>
                      )}
                      <button className="pvo-eye-btn" onClick={() => setSelected(o)} title="View details">
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="pvo-card-customer">
                    <div className="pvo-cust-avatar">
                      {o.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="pvo-cust-name">{o.customerName}</div>
                      {o.customerPhone && (
                        <div className="pvo-cust-meta">
                          <Phone size={12} /> {o.customerPhone}
                        </div>
                      )}
                      {o.customerAddress && (
                        <div className="pvo-cust-meta">
                          <MapPin size={12} /> {o.customerAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pvo-divider" />

                  {/* Service */}
                  <div className="pvo-card-service">
                    {o.items[0]?.itemName && (
                      <div className="pvo-service-name">
                        {o.items[0].itemName}
                        {o.itemCount > 1 && <span className="pvo-more"> +{o.itemCount - 1} more</span>}
                      </div>
                    )}
                    <div className="pvo-service-meta">
                      <span>{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</span>
                      <span className="pvo-dot-sep">·</span>
                      <span className="pvo-amount">Rs {Number(o.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="pvo-service-date">
                      <Clock size={12} /> {fmt(o.createdAt)}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="pvo-card-payment">
                    <span className={`pvo-payment-badge ${isOnline ? 'pvo-pay-online' : 'pvo-pay-cod'}`}>
                      {isOnline ? <CreditCard size={12} /> : <Banknote size={12} />}
                      {isOnline ? 'Online Payment' : 'Cash on Delivery'}
                    </span>
                  </div>

                  {/* Delivery */}
                  {o.delivery && (
                    <div className="pvo-delivery-row">
                      <span
                        className="pvo-delivery-badge"
                        style={{
                          background: (DELIVERY_STATUS_META[o.delivery.status] || DELIVERY_STATUS_META.pending).bg,
                          color: (DELIVERY_STATUS_META[o.delivery.status] || DELIVERY_STATUS_META.pending).color
                        }}
                      >
                        <Truck size={12} /> {(DELIVERY_STATUS_META[o.delivery.status] || DELIVERY_STATUS_META.pending).label}
                      </span>
                      {NEXT_DELIVERY_STATUS[o.delivery.status] && (
                        <button
                          className="pvo-delivery-next-btn"
                          disabled={busy}
                          onClick={() => updateDelivery(o.orderId, NEXT_DELIVERY_STATUS[o.delivery.status])}
                        >
                          {busy ? 'Updating…' : NEXT_DELIVERY_LABEL[o.delivery.status]}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {(o.providerStatus === 'pending' || o.providerStatus === 'in-progress') && (
                    <div className="pvo-card-actions">
                      {o.providerStatus === 'pending' && (
                        <>
                          <button
                            className="pvo-action-btn pvo-accept"
                            disabled={busy}
                            onClick={() => updateStatus(o.orderId, 'in-progress')}
                          >
                            <Check size={14} /> {busy ? 'Updating…' : 'Accept'}
                          </button>
                          <button
                            className="pvo-action-btn pvo-reject"
                            disabled={busy}
                            onClick={() => updateStatus(o.orderId, 'cancelled')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      {o.providerStatus === 'in-progress' && (
                        <button
                          className="pvo-action-btn pvo-complete"
                          disabled={busy}
                          onClick={() => updateStatus(o.orderId, 'completed')}
                        >
                          <CheckCircle size={14} /> {busy ? 'Updating…' : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && totalPages > 1 && (
          <div className="pvo-pagination">
            <span className="pvo-page-info">Page {safePage} of {totalPages}</span>
            <div className="pvo-page-btns">
              <button
                className="pvo-page-btn pvo-page-nav"
                onClick={() => goTo(safePage - 1)}
                disabled={safePage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {pageNums().map((pg, i) =>
                pg === '...' ? (
                  <span key={`d-${i}`} className="pvo-page-dots">…</span>
                ) : (
                  <button
                    key={pg}
                    className={`pvo-page-btn${pg === safePage ? ' pvo-page-active' : ''}`}
                    onClick={() => goTo(pg)}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                className="pvo-page-btn pvo-page-nav"
                onClick={() => goTo(safePage + 1)}
                disabled={safePage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Detail Modal ── */}
      {selectedOrder && (
        <DetailModal
          order={norm(selectedOrder)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

/* ── Detail Modal (extracted to avoid IIFE) ── */
const DetailModal = ({ order: s, onClose }) => {
  const sm       = STATUS_META[s.providerStatus] || STATUS_META.pending;
  const isOnline = s.paymentProvider === 'PayHere';

  return (
    <div className="pvo-overlay" onClick={onClose}>
      <div className="pvo-modal" onClick={e => e.stopPropagation()}>

        <div className="pvo-modal-head">
          <div>
            <h2 className="pvo-modal-title">Order Details</h2>
            <p className="pvo-modal-ref">#{s.orderReference}</p>
          </div>
          <button className="pvo-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pvo-modal-body">

          {/* Customer */}
          <div className="pvo-modal-block">
            <h4 className="pvo-block-title">Customer</h4>
            <div className="pvo-detail-grid">
              <div className="pvo-detail-item">
                <label>Name</label>
                <span>{s.customerName}</span>
              </div>
              <div className="pvo-detail-item">
                <label>Phone</label>
                <span>{s.customerPhone || '—'}</span>
              </div>
              <div className="pvo-detail-item pvo-full">
                <label>Address</label>
                <span>{s.customerAddress || '—'}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="pvo-modal-block">
            <h4 className="pvo-block-title">Order Info</h4>
            <div className="pvo-detail-grid">
              <div className="pvo-detail-item">
                <label>Total Amount</label>
                <span className="pvo-modal-amount">Rs {Number(s.totalAmount).toFixed(2)}</span>
              </div>
              <div className="pvo-detail-item">
                <label>Status</label>
                <span className="pvo-badge" style={{ background: sm.bg, color: sm.color }}>
                  ● {sm.label}
                </span>
              </div>
              <div className="pvo-detail-item">
                <label>Payment</label>
                <span className={`pvo-payment-badge ${isOnline ? 'pvo-pay-online' : 'pvo-pay-cod'}`}>
                  {isOnline ? <CreditCard size={12} /> : <Banknote size={12} />}
                  {isOnline ? 'Online' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="pvo-detail-item">
                <label>Placed</label>
                <span>{s.createdAt ? new Date(s.createdAt).toLocaleString('en-GB') : '—'}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          {s.items.length > 0 && (
            <div className="pvo-modal-block">
              <h4 className="pvo-block-title">Items</h4>
              <div className="pvo-items-list">
                {s.items.map((item, idx) => (
                  <div key={item.orderItemId ?? idx} className="pvo-item-row">
                    <span className="pvo-item-name">{item.itemName}</span>
                    <span className="pvo-item-calc">
                      {item.quantity} × Rs {Number(item.unitPrice).toFixed(2)}
                    </span>
                    <span className="pvo-item-total">Rs {Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="pvo-modal-foot">
          <button className="pvo-close-btn" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};

export default ProviderOrders;
