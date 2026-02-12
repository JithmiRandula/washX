import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { Users, Shield, Package, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    pendingProviders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalUsers: 1234,
      totalProviders: 56,
      totalOrders: 892,
      monthlyRevenue: 12456.78,
      pendingProviders: 8,
      activeOrders: 23,
      completedOrders: 756,
      cancelledOrders: 37
    });

    setRecentActivity([
      {
        id: 1,
        type: 'user_registration',
        message: 'New user registration: John Doe',
        timestamp: '2 hours ago',
        icon: Users,
        color: '#1e3a8a'
      },
      {
        id: 2,
        type: 'provider_approval',
        message: 'Provider approved: CleanPro Services',
        timestamp: '4 hours ago',
        icon: Shield,
        color: '#1e3a8a'
      },
      {
        id: 3,
        type: 'order_completed',
        message: 'Booking completed: Order #WX24001',
        timestamp: '6 hours ago',
        icon: CheckCircle,
        color: '#1e3a8a'
      },
      {
        id: 4,
        type: 'provider_pending',
        message: 'New provider application: QuickWash Express',
        timestamp: '8 hours ago',
        icon: Clock,
        color: '#1e3a8a'
      },
      {
        id: 5,
        type: 'order_cancelled',
        message: 'Order cancelled: #WX24003',
        timestamp: '1 day ago',
        icon: AlertCircle,
        color: '#1e3a8a'
      }
    ]);
  }, []);

  const formatCurrency = (amount) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        <Icon size={32} />
      </div>
      <div className="admin-stat-content">
        <h3>{title}</h3>
        <p className="admin-stat-number">{value}</p>
        {change && (
          <span className={`admin-stat-change ${change.type}`}>
            {change.type === 'increase' ? '+' : ''}{change.value}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, {user?.firstName}! Here's what's happening with your platform.</p>
        </div>

        <div className="admin-dashboard-stats">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="#1e3a8a"
            change={{ type: 'increase', value: 12 }}
          />
          <StatCard
            title="Active Providers"
            value={stats.totalProviders}
            icon={Shield}
            color="#1e3a8a"
            change={{ type: 'increase', value: 8 }}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            icon={Package}
            color="#1e3a8a"
            change={{ type: 'increase', value: 24 }}
          />
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-row">
            <div className="section recent-activity">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <span className="view-all">View All</span>
              </div>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ backgroundColor: `${activity.color}20`, color: activity.color }}>
                      <activity.icon size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-message">{activity.message}</span>
                      <span className="activity-time">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section order-summary">
              <div className="section-header">
                <h2>Order Summary</h2>
                <span className="view-all">View Orders</span>
              </div>
              <div className="order-stats">
                <div className="order-stat">
                  <div className="order-stat-icon pending">
                    <Clock size={20} />
                  </div>
                  <div className="order-stat-content">
                    <span className="order-stat-number">{stats.activeOrders}</span>
                    <span className="order-stat-label">Active Orders</span>
                  </div>
                </div>
                <div className="order-stat">
                  <div className="order-stat-icon completed">
                    <CheckCircle size={20} />
                  </div>
                  <div className="order-stat-content">
                    <span className="order-stat-number">{stats.completedOrders}</span>
                    <span className="order-stat-label">Completed</span>
                  </div>
                </div>
                <div className="order-stat">
                  <div className="order-stat-icon cancelled">
                    <AlertCircle size={20} />
                  </div>
                  <div className="order-stat-content">
                    <span className="order-stat-number">{stats.cancelledOrders}</span>
                    <span className="order-stat-label">Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="section pending-approvals">
              <div className="section-header">
                <h2>Pending Approvals</h2>
                <span className="view-all">View All</span>
              </div>
              <div className="approval-list">
                <div className="approval-item">
                  <div className="approval-info">
                    <span className="approval-title">QuickWash Express</span>
                    <span className="approval-subtitle">Provider Application</span>
                  </div>
                  <div className="approval-actions">
                    <button className="approve-btn">Approve</button>
                    <button className="reject-btn">Reject</button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <span className="approval-title">Premium Cleaners</span>
                    <span className="approval-subtitle">Document Verification</span>
                  </div>
                  <div className="approval-actions">
                    <button className="approve-btn">Approve</button>
                    <button className="reject-btn">Reject</button>
                  </div>
                </div>
                <div className="approval-item">
                  <div className="approval-info">
                    <span className="approval-title">Eco Clean Services</span>
                    <span className="approval-subtitle">Provider Registration</span>
                  </div>
                  <div className="approval-actions">
                    <button className="approve-btn">Approve</button>
                    <button className="reject-btn">Reject</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="section quick-actions">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="action-grid">
                <button className="action-btn users">
                  <Users size={20} />
                  <span>Manage Users</span>
                </button>
                <button className="action-btn providers">
                  <Shield size={20} />
                  <span>Manage Providers</span>
                </button>
                <button className="action-btn orders">
                  <Package size={20} />
                  <span>View Orders</span>
                </button>
                <button className="action-btn analytics">
                  <TrendingUp size={20} />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
