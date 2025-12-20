import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const stats = [
    { icon: <Users size={24} />, label: 'Total Users', value: '1,234', color: '#2563eb' },
    { icon: <Package size={24} />, label: 'Total Orders', value: '5,678', color: '#10b981' },
    { icon: <Shield size={24} />, label: 'Providers', value: '156', color: '#8b5cf6' },
    { icon: <DollarSign size={24} />, label: 'Revenue', value: '$89,450', color: '#f59e0b' }
  ];

  const pendingProviders = [
    { id: '1', name: 'Fresh Laundry Co.', email: 'fresh@laundry.com', date: '2025-12-07' },
    { id: '2', name: 'Quick Wash Service', email: 'quick@wash.com', date: '2025-12-08' }
  ];

  const recentActivity = [
    { id: '1', type: 'order', message: 'New order placed by John Doe', time: '2 hours ago' },
    { id: '2', type: 'provider', message: 'New provider registered', time: '4 hours ago' },
    { id: '3', type: 'user', message: 'New customer registered', time: '5 hours ago' }
  ];

  return (
    <div className="dashboard-page admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage and monitor the WashX platform</p>
          </div>
        </div>

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

        <div className="admin-content">
          <div className="pending-section">
            <div className="section-header">
              <h2>
                <AlertTriangle size={20} />
                Pending Provider Verifications
              </h2>
            </div>
            <div className="pending-list">
              {pendingProviders.map(provider => (
                <div key={provider.id} className="pending-card">
                  <div className="pending-info">
                    <h4>{provider.name}</h4>
                    <p>{provider.email}</p>
                    <span className="date">Applied: {provider.date}</span>
                  </div>
                  <div className="pending-actions">
                    <button className="btn-approve">Approve</button>
                    <button className="btn-reject">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'order' && <Package size={16} />}
                    {activity.type === 'provider' && <Shield size={16} />}
                    {activity.type === 'user' && <Users size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-actions">
            <h2>Management</h2>
            <div className="admin-actions-grid">
              <button className="admin-action-btn">
                <Users size={24} />
                <span>Manage Users</span>
              </button>
              <button className="admin-action-btn">
                <Shield size={24} />
                <span>Manage Providers</span>
              </button>
              <button className="admin-action-btn">
                <Package size={24} />
                <span>View All Orders</span>
              </button>
              <button className="admin-action-btn">
                <TrendingUp size={24} />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
