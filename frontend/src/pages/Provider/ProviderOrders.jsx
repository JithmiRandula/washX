import React, { useState } from 'react';
import { Search, Filter, Eye, Check, X, Clock, MapPin, Phone, CreditCard, Banknote } from 'lucide-react';
import './ProviderOrders.css';

const ProviderOrders = () => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      customer: 'John Doe',
      phone: '+1 234 567 8900',
      address: '123 Main St, City Center',
      service: 'Regular Wash + Iron',
      items: 5,
      amount: 45,
      status: 'pending',
      paymentMethod: 'cash_on_delivery',
      date: '2026-01-21T10:30:00',
      pickupDate: '2026-01-21T14:00:00',
      deliveryDate: '2026-01-22T10:00:00'
    },
    {
      id: 'ORD002',
      customer: 'Jane Smith',
      phone: '+1 234 567 8901',
      address: '456 Oak Ave, Downtown',
      service: 'Express Wash',
      items: 3,
      amount: 25,
      status: 'ready',
      paymentMethod: 'online_payment',
      date: '2026-01-21T09:15:00',
      pickupDate: '2026-01-21T11:00:00',
      deliveryDate: '2026-01-21T16:00:00'
    },
    {
      id: 'ORD003',
      customer: 'Bob Johnson',
      phone: '+1 234 567 8902',
      address: '789 Pine Rd, Suburbs',
      service: 'Dry Cleaning',
      items: 2,
      amount: 70,
      status: 'completed',
      paymentMethod: 'online_payment',
      date: '2026-01-20T16:45:00',
      pickupDate: '2026-01-20T18:00:00',
      deliveryDate: '2026-01-21T12:00:00'
    },
    {
      id: 'ORD004',
      customer: 'Alice Brown',
      phone: '+1 234 567 8903',
      address: '321 Elm St, Uptown',
      service: 'Premium Wash',
      items: 8,
      amount: 85,
      status: 'completed',
      paymentMethod: 'cash_on_delivery',
      date: '2026-01-19T14:20:00',
      pickupDate: '2026-01-19T16:30:00',
      deliveryDate: '2026-01-20T11:00:00'
    },
    {
      id: 'ORD005',
      customer: 'Mike Wilson',
      phone: '+1 234 567 8904',
      address: '555 Cedar Lane, Midtown',
      service: 'Regular Wash',
      items: 4,
      amount: 32,
      status: 'pending',
      paymentMethod: 'cash_on_delivery',
      date: '2026-01-21T15:20:00',
      pickupDate: '2026-01-22T09:00:00',
      deliveryDate: '2026-01-22T17:00:00'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#2563eb';
      case 'ready': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const orderStats = {
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => o.status === 'in-progress').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="provider-orders-page">
      <div className="provider-orders-container">
        <div className="provider-orders-header">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track all customer orders</p>
          </div>
          
          <div className="provider-order-stats">
            <div className="provider-stat-item">
              <span className="provider-stat-value">{orderStats.pending}</span>
              <span className="provider-stat-label">Pending</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value">{orderStats.inProgress}</span>
              <span className="provider-stat-label">In Progress</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value">{orderStats.ready}</span>
              <span className="provider-stat-label">Ready</span>
            </div>
            <div className="provider-stat-item">
              <span className="provider-stat-value">{orderStats.completed}</span>
              <span className="provider-stat-label">Completed</span>
            </div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="provider-filter-box">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="provider-orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="provider-order-card">
                <div className="provider-order-header">
                  <div className="provider-order-info">
                    <h3>#{order.id}</h3>
                    <span 
                      className="provider-order-status"
                      style={{ 
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status)
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <button 
                    className="provider-view-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye size={16} />
                  </button>
                </div>

                <div className="provider-order-details">
                  <div className="provider-customer-info">
                    <h4>{order.customer}</h4>
                    <p className="provider-phone">
                      <Phone size={14} />
                      {order.phone}
                    </p>
                    <p className="provider-address">
                      <MapPin size={14} />
                      {order.address}
                    </p>
                  </div>

                  <div className="provider-service-info">
                    <p className="provider-service">{order.service}</p>
                    <p className="provider-items">{order.items} items • Rs {order.amount}</p>
                    <p className="provider-date">
                      <Clock size={14} />
                      {formatDate(order.date)}
                    </p>
                  </div>

                  <div className="po-payment-method">
                    <div className={`po-payment-badge ${order.paymentMethod === 'online_payment' ? 'po-online' : 'po-cod'}`}>
                      {order.paymentMethod === 'online_payment' ? (
                        <><CreditCard size={14} /> Online Payment</>
                      ) : (
                        <><Banknote size={14} /> Cash on Delivery</>
                      )}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="provider-order-actions">
                    {order.status === 'pending' && (
                      <button 
                        className="provider-action-btn provider-accept-btn"
                        onClick={() => updateOrderStatus(order.id, 'in-progress')}
                      >
                        <Check size={16} />
                        Accept Order
                      </button>
                    )}
                    
                    {order.status === 'in-progress' && (
                      <button 
                        className="provider-action-btn provider-ready-btn"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        <Check size={16} />
                        Mark Ready
                      </button>
                    )}
                    
                    {order.status === 'ready' && (
                      <button 
                        className="provider-action-btn provider-complete-btn"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        <Check size={16} />
                        Complete
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button 
                        className="provider-action-btn provider-reject-btn"
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="provider-no-orders">
              <h3>No orders found</h3>
              <p>No orders match your current filters.</p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Order Details - #{selectedOrder.id}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="order-detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name</label>
                      <span>{selectedOrder.customer}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{selectedOrder.phone}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Address</label>
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h3>Service Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Service</label>
                      <span>{selectedOrder.service}</span>
                    </div>
                    <div className="detail-item">
                      <label>Items</label>
                      <span>{selectedOrder.items} pieces</span>
                    </div>
                    <div className="detail-item">
                      <label>Amount</label>
                      <span>Rs {selectedOrder.amount}</span>
                    </div>
                    <div className="detail-item">
                      <label>Payment Method</label>
                      <span className={`po-modal-payment-badge ${selectedOrder.paymentMethod === 'online_payment' ? 'po-online' : 'po-cod'}`}>
                        {selectedOrder.paymentMethod === 'online_payment' ? (
                          <><CreditCard size={14} /> Online Payment</>
                        ) : (
                          <><Banknote size={14} /> Cash on Delivery</>
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Status</label>
                      <span 
                        className="status-badge"
                        style={{ 
                          background: `${getStatusColor(selectedOrder.status)}20`,
                          color: getStatusColor(selectedOrder.status)
                        }}
                      >
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-detail-section">
                  <h3>Timeline</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <label>Order Placed</label>
                      <span>{formatDate(selectedOrder.date)}</span>
                    </div>
                    <div className="timeline-item">
                      <label>Pickup Scheduled</label>
                      <span>{formatDate(selectedOrder.pickupDate)}</span>
                    </div>
                    <div className="timeline-item">
                      <label>Delivery Scheduled</label>
                      <span>{formatDate(selectedOrder.deliveryDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderOrders;