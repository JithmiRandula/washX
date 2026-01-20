import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, DollarSign, TrendingUp, Users, Clock, CheckCircle, XCircle, Home, Settings, BarChart3, User, Plus } from 'lucide-react';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders] = useState([
    { id: '1', customer: 'John Doe', status: 'pending', amount: 45, items: 3, date: '2025-12-08' },
    { id: '2', customer: 'Jane Smith', status: 'in-progress', amount: 60, items: 5, date: '2025-12-08' },
    { id: '3', customer: 'Bob Johnson', status: 'ready', amount: 30, items: 2, date: '2025-12-07' }
  ]);

  const stats = [
    { icon: <Package size={24} />, label: 'Total Orders', value: '156', color: '#2563eb' },
    { icon: <DollarSign size={24} />, label: 'Revenue', value: '$8,450', color: '#10b981' },
    { icon: <TrendingUp size={24} />, label: 'This Month', value: '+23%', color: '#8b5cf6' },
    { icon: <Users size={24} />, label: 'Customers', value: '89', color: '#f59e0b' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#2563eb';
      case 'ready': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
  };

  return (
    <div className="dashboard-page provider-dashboard">
      {/* Main Content */}
      <div className="provider-main">
        <div className="dashboard-header">
          <div>
            <h1>Provider Dashboard</h1>
            <p>Manage your laundry service business</p>
          </div>
          <button className="btn-primary">Add New Service</button>
        </div>

        <div className="dashboard-container">

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="provider-content">
          <div className="orders-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <select className="status-filter">
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.items}</td>
                      <td>${order.amount}</td>
                      <td>{order.date}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="status-select"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="quick-actions-provider">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn">
                <Package size={20} />
                <span>Manage Services</span>
              </button>
              <button className="action-btn">
                <TrendingUp size={20} />
                <span>View Analytics</span>
              </button>
              <button className="action-btn">
                <Users size={20} />
                <span>Customer Reviews</span>
              </button>
              <button className="action-btn">
                <DollarSign size={20} />
                <span>Promotions</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
