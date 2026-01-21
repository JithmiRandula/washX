import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { Search, Filter, Eye, Calendar, Clock, MapPin, Package, Download } from 'lucide-react';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data - replace with API call
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD001',
        orderNumber: '#WX24001',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        customerPhone: '+1-234-567-8901',
        providerId: 'PRV001',
        providerName: 'CleanPro Services',
        service: 'Washing & Ironing',
        status: 'completed',
        totalAmount: 45.50,
        paymentStatus: 'paid',
        pickupDate: '2024-12-20',
        deliveryDate: '2024-12-22',
        pickupTime: '10:00 AM',
        deliveryTime: '2:00 PM',
        address: '123 Main St, City, State 12345',
        items: [
          { name: 'Shirts', quantity: 5, price: 15.00 },
          { name: 'Pants', quantity: 3, price: 18.00 },
          { name: 'Bed Sheets', quantity: 2, price: 12.50 }
        ],
        specialInstructions: 'Handle delicate items with care',
        createdAt: '2024-12-19T10:30:00Z'
      },
      {
        id: 'ORD002',
        orderNumber: '#WX24002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        customerPhone: '+1-234-567-8902',
        providerId: 'PRV002',
        providerName: 'QuickWash Express',
        service: 'Dry Cleaning',
        status: 'in_progress',
        totalAmount: 65.75,
        paymentStatus: 'paid',
        pickupDate: '2024-12-21',
        deliveryDate: '2024-12-23',
        pickupTime: '2:00 PM',
        deliveryTime: '4:00 PM',
        address: '456 Oak Ave, City, State 12345',
        items: [
          { name: 'Suits', quantity: 2, price: 40.00 },
          { name: 'Dresses', quantity: 3, price: 25.75 }
        ],
        specialInstructions: 'Starch on collars',
        createdAt: '2024-12-20T14:15:00Z'
      },
      {
        id: 'ORD003',
        orderNumber: '#WX24003',
        customerName: 'Mike Wilson',
        customerEmail: 'mike@example.com',
        customerPhone: '+1-234-567-8903',
        providerId: 'PRV001',
        providerName: 'CleanPro Services',
        service: 'Washing Only',
        status: 'pending',
        totalAmount: 28.00,
        paymentStatus: 'pending',
        pickupDate: '2024-12-22',
        deliveryDate: '2024-12-24',
        pickupTime: '11:00 AM',
        deliveryTime: '1:00 PM',
        address: '789 Pine Rd, City, State 12345',
        items: [
          { name: 'Casual Wear', quantity: 8, price: 28.00 }
        ],
        specialInstructions: '',
        createdAt: '2024-12-21T09:45:00Z'
      },
      {
        id: 'ORD004',
        orderNumber: '#WX24004',
        customerName: 'Emily Davis',
        customerEmail: 'emily@example.com',
        customerPhone: '+1-234-567-8904',
        providerId: 'PRV003',
        providerName: 'Premium Cleaners',
        service: 'Express Wash',
        status: 'cancelled',
        totalAmount: 38.25,
        paymentStatus: 'refunded',
        pickupDate: '2024-12-19',
        deliveryDate: '2024-12-20',
        pickupTime: '3:00 PM',
        deliveryTime: '6:00 PM',
        address: '321 Elm St, City, State 12345',
        items: [
          { name: 'Work Clothes', quantity: 6, price: 38.25 }
        ],
        specialInstructions: 'Urgent delivery needed',
        createdAt: '2024-12-18T16:20:00Z'
      }
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort orders
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'amount':
          return b.totalAmount - a.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      in_progress: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: '#10b981',
      pending: '#f59e0b',
      refunded: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const exportOrders = () => {
    const csv = [
      ['Order Number', 'Customer', 'Provider', 'Service', 'Status', 'Amount', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        order.providerName,
        order.service,
        order.status,
        order.totalAmount,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'orders.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const OrderModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details - {order.orderNumber}</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          
          <div className="modal-body">
            <div className="order-details-grid">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-group">
                  <p><strong>Name:</strong> {order.customerName}</p>
                  <p><strong>Email:</strong> {order.customerEmail}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                  <p><strong>Address:</strong> {order.address}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Details</h3>
                <div className="detail-group">
                  <p><strong>Provider:</strong> {order.providerName}</p>
                  <p><strong>Service:</strong> {order.service}</p>
                  <p><strong>Pickup:</strong> {order.pickupDate} at {order.pickupTime}</p>
                  <p><strong>Delivery:</strong> {order.deliveryDate} at {order.deliveryTime}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="total-amount">
                  <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="detail-section">
                  <h3>Special Instructions</h3>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-orders">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="page-header">
          <h1>Orders Management</h1>
          <div className="header-actions">
            <button className="export-btn" onClick={exportOrders}>
              <Download size={16} />
              Export Orders
            </button>
          </div>
        </div>

        <div className="orders-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search orders, customers, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="orders-stats">
          <div className="stat-card">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{orders.filter(o => o.status === 'in_progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{orders.filter(o => o.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ${orders.reduce((sum, order) => sum + (order.paymentStatus === 'paid' ? order.totalAmount : 0), 0).toFixed(2)}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Provider</th>
                <th>Service</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div className="order-number">{order.orderNumber}</div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      <div className="customer-email">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="provider-name">{order.providerName}</div>
                  </td>
                  <td>
                    <div className="service-type">{order.service}</div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="payment-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="amount">${order.totalAmount.toFixed(2)}</div>
                  </td>
                  <td>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} />
                      </button>
                      
                      {order.status === 'pending' && (
                        <button 
                          className="action-btn approve"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        >
                          Confirm
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button 
                          className="action-btn progress"
                          onClick={() => updateOrderStatus(order.id, 'in_progress')}
                        >
                          Start
                        </button>
                      )}
                      
                      {order.status === 'in_progress' && (
                        <button 
                          className="action-btn complete"
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button 
                          className="action-btn cancel"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </div>
        )}
      </div>

      <OrderModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
};

export default AdminOrders;