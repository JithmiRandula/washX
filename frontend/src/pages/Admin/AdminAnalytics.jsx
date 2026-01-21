import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { TrendingUp, Users, Package, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 45678.90,
    totalOrders: 1234,
    totalUsers: 567,
    avgOrderValue: 37.02,
    monthlyGrowth: 12.5,
    popularServices: [
      { name: 'Wash & Fold', orders: 456, revenue: 12340 },
      { name: 'Dry Cleaning', orders: 234, revenue: 8950 },
      { name: 'Express Service', orders: 189, revenue: 7890 }
    ],
    recentActivity: [
      { date: '2026-01-21', orders: 45, revenue: 1678 },
      { date: '2026-01-20', orders: 52, revenue: 1890 },
      { date: '2026-01-19', orders: 38, revenue: 1456 },
      { date: '2026-01-18', orders: 49, revenue: 1789 },
      { date: '2026-01-17', orders: 41, revenue: 1567 }
    ]
  });

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="analytics-stat-card">
      <div className="stat-header">
        <h3>{title}</h3>
        <Icon size={20} style={{ color: color }} />
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className="stat-change">
          <span style={{ color: change > 0 ? '#10b981' : '#ef4444' }}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span>vs last {timeRange}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-analytics">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="page-header">
          <h1>Analytics & Reports</h1>
          <div className="header-controls">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-selector"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="analytics-stats">
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="#10b981"
            change={15.2}
          />
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders.toLocaleString()}
            icon={Package}
            color="#3b82f6"
            change={8.7}
          />
          <StatCard
            title="Active Users"
            value={analytics.totalUsers.toLocaleString()}
            icon={Users}
            color="#8b5cf6"
            change={12.3}
          />
          <StatCard
            title="Avg Order Value"
            value={`$${analytics.avgOrderValue}`}
            icon={TrendingUp}
            color="#f59e0b"
            change={5.1}
          />
        </div>

        <div className="analytics-grid">
          <div className="analytics-section">
            <div className="section-header">
              <h2>
                <BarChart3 size={20} />
                Daily Performance
              </h2>
            </div>
            <div className="chart-container">
              <div className="daily-stats">
                {analytics.recentActivity.map((day, index) => (
                  <div key={index} className="daily-stat">
                    <div className="date">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="metric">
                      <span className="orders">{day.orders} orders</span>
                      <span className="revenue">${day.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <div className="section-header">
              <h2>
                <TrendingUp size={20} />
                Popular Services
              </h2>
            </div>
            <div className="services-stats">
              {analytics.popularServices.map((service, index) => (
                <div key={index} className="service-stat">
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <div className="service-metrics">
                      <span>{service.orders} orders</span>
                      <span>${service.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="service-bar">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(service.orders / Math.max(...analytics.popularServices.map(s => s.orders))) * 100}%`,
                        backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#8b5cf6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Growth Summary</h3>
            <div className="growth-metrics">
              <div className="growth-item">
                <span className="metric-label">Revenue Growth</span>
                <span className="metric-value positive">+{analytics.monthlyGrowth}%</span>
              </div>
              <div className="growth-item">
                <span className="metric-label">Order Growth</span>
                <span className="metric-value positive">+8.7%</span>
              </div>
              <div className="growth-item">
                <span className="metric-label">User Growth</span>
                <span className="metric-value positive">+12.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;