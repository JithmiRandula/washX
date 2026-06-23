import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Check, X, Clock, MapPin, Phone, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import { providerOrdersAPI } from '../../api/commerceApi';
import './ProviderOrders.css';

const STATUS_COLORS = {
  pending:     '#f59e0b',
  'in-progress': '#2563eb',
  completed:   '#10b981',
  cancelled:   '#dc2626'
};

const STATUS_LABELS = {
  pending:     'Pending',
  'in-progress': 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled'
};

const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';

const StatusBadge = ({ status }) => (
  <span
    className="provider-order-status"
    style={{ background: `${STATUS_COLORS[status] ?? '#6b7280'}20`, color: STATUS_COLORS[status] ?? '#6b7280' }}
  >
    {STATUS_LABELS[status] ?? status}
  </span>
);

const ProviderOrders = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [actionLoading, setAction]  = useState(null); // orderId being updated
  const [filterStatus, setFilter]   = useState('all');
  const [searchTerm, setSearch]     = useState('');
  const [selectedOrder, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await providerOrdersAPI.getMine();
      setOrders(res?.data ?? []);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Normalize an order so the rest of the component always uses camelCase
  const norm = (o) => ({
    orderId:         o.orderId         ?? o.OrderId,
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
      itemName:    i.itemName    ?? i.ItemName    ?? i.description ?? i.Description ?? '—',
      description: i.description ?? i.Description ?? '',
      quantity:    i.quantity    ?? i.Quantity    ?? 1,
      unitPrice:   i.unitPrice   ?? i.UnitPrice   ?? 0,
      price:       i.price       ?? i.Price       ?? 0,
      status:      i.status      ?? i.Status      ?? 'pending',
      imageUrl:    i.imageUrl    ?? i.ImageUrl    ?? null,
    }))
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
      if ((selectedOrder?.orderId ?? selectedOrder?.OrderId) === orderId)
        setSelected(s => ({ ...s, providerStatus: status, ProviderStatus: status }));
    } catch {
      alert('Failed to update order status. Please try again.');
    } finally {
      setAction(null);
    }
  };

  const normalized = orders.map(norm);

  const filtered = normalized.filter(o => {
    const matchStatus = filterStatus === 'all' || o.providerStatus === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term
      || o.customerName.toLowerCase().includes(term)
      || o.orderReference.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const stats = {
    pending:    normalized.filter(o => o.providerStatus === 'pending').length,
    inProgress: normalized.filter(o => o.providerStatus === 'in-progress').length,
    completed:  normalized.filter(o => o.providerStatus === 'completed').length,
    cancelled:  normalized.filter(o => o.providerStatus === 'cancelled').length
  };

  return (
    <div className="provider-orders-page">
      <div className="provider-orders-container">
        {/* Header */}
        <div className="provider-orders-header">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track all customer orders</p>
          </div>
          <div className="provider-order-stats">
            <div className="provider-stat-item">
              <span className="provider-stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</span>
              <span className="provider-stat-label">Pending</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value" style={{ color: '#2563eb' }}>{stats.inProgress}</span>
              <span className="provider-stat-label">In Progress</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value" style={{ color: '#10b981' }}>{stats.completed}</span>
              <span className="provider-stat-label">Completed</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value" style={{ color: '#dc2626' }}>{stats.cancelled}</span>
              <span className="provider-stat-label">Cancelled</span>
            </div>
            <button className="provider-refresh-btn" onClick={load} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="provider-orders-filters">
          <div className="provider-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by customer name or order ID..."
              value={searchTerm}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="provider-filter-box">
            <Filter size={20} />
            <select value={filterStatus} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="provider-no-orders"><h3>Loading orders…</h3></div>
        ) : error ? (
          <div className="provider-no-orders" style={{ color: '#dc2626' }}>
            <h3>{error}</h3>
            <button className="provider-action-btn provider-accept-btn" onClick={load} style={{ marginTop: '1rem', flex: 'none' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="provider-orders-grid">
            {filtered.length > 0 ? filtered.map(o => {
              const busy = actionLoading === o.orderId;
              return (
                <div key={o.orderId} className="provider-order-card">
                  <div className="provider-order-header">
                    <div className="provider-order-info">
                      <h3>#{o.orderReference}</h3>
                      <StatusBadge status={o.providerStatus} />
                    </div>
                    <button className="provider-view-btn" onClick={() => setSelected(o)}>
                      <Eye size={16} />
                    </button>
                  </div>

                  <div className="provider-order-details">
                    <div className="provider-customer-info">
                      <h4>{o.customerName}</h4>
                      {o.customerPhone && (
                        <p className="provider-phone"><Phone size={14} />{o.customerPhone}</p>
                      )}
                      {o.customerAddress && (
                        <p className="provider-address"><MapPin size={14} />{o.customerAddress}</p>
                      )}
                    </div>

                    <div className="provider-service-info">
                      {o.items[0]?.itemName && (
                        <p className="provider-service">
                          {o.items[0].itemName}{o.itemCount > 1 ? ` +${o.itemCount - 1} more` : ''}
                        </p>
                      )}
                      <p className="provider-items">{o.itemCount} item(s) &bull; Rs {Number(o.totalAmount).toFixed(2)}</p>
                      <p className="provider-date"><Clock size={14} />{formatDate(o.createdAt)}</p>
                    </div>

                    <div className="po-payment-method">
                      <div className={`po-payment-badge ${o.paymentProvider === 'PayHere' ? 'po-online' : 'po-cod'}`}>
                        {o.paymentProvider === 'PayHere'
                          ? <><CreditCard size={14} /> Online Payment</>
                          : <><Banknote size={14} /> Cash on Delivery</>}
                      </div>
                    </div>

                    <div className="provider-order-actions">
                      {o.providerStatus === 'pending' && (
                        <>
                          <button
                            className="provider-action-btn provider-accept-btn"
                            disabled={busy}
                            onClick={() => updateStatus(o.orderId, 'in-progress')}
                          >
                            <Check size={16} />{busy ? 'Updating…' : 'Accept'}
                          </button>
                          <button
                            className="provider-action-btn provider-reject-btn"
                            disabled={busy}
                            onClick={() => updateStatus(o.orderId, 'cancelled')}
                          >
                            <X size={16} />Reject
                          </button>
                        </>
                      )}
                      {o.providerStatus === 'in-progress' && (
                        <button
                          className="provider-action-btn provider-complete-btn"
                          disabled={busy}
                          onClick={() => updateStatus(o.orderId, 'completed')}
                        >
                          <Check size={16} />{busy ? 'Updating…' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="provider-no-orders">
                <h3>No orders found</h3>
                <p>No orders match your current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedOrder && (() => {
          const s = norm(selectedOrder);
          return (
            <div className="modal-overlay" onClick={() => setSelected(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Order #{s.orderReference}</h2>
                  <button className="close-btn" onClick={() => setSelected(null)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="order-detail-section">
                    <h3>Customer Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Name</label>
                        <span>{s.customerName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phone</label>
                        <span>{s.customerPhone || '—'}</span>
                      </div>
                      <div className="detail-item full-width">
                        <label>Address</label>
                        <span>{s.customerAddress || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-detail-section">
                    <h3>Order Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Total Amount</label>
                        <span>Rs {Number(s.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Payment</label>
                        <span className={`po-modal-payment-badge ${s.paymentProvider === 'PayHere' ? 'po-online' : 'po-cod'}`}>
                          {s.paymentProvider === 'PayHere'
                            ? <><CreditCard size={13} /> Online</>
                            : <><Banknote size={13} /> Cash on Delivery</>}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Status</label>
                        <StatusBadge status={s.providerStatus} />
                      </div>
                      <div className="detail-item">
                        <label>Placed</label>
                        <span>{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {s.items.length > 0 && (
                    <div className="order-detail-section">
                      <h3>Items</h3>
                      <div className="timeline">
                        {s.items.map((item, idx) => (
                          <div key={item.orderItemId ?? idx} className="timeline-item">
                            <label>{item.itemName}</label>
                            <span>
                              {item.quantity} × Rs {Number(item.unitPrice).toFixed(2)} = Rs {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ProviderOrders;
