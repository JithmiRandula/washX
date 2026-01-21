import React, { useState } from 'react';
import { TrendingUp, DollarSign, Package, Users, Calendar, BarChart3 } from 'lucide-react';
import './ProviderAnalytics.css';

const ProviderAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock analytics data
  const analytics = {
    totalRevenue: 12450,
    totalOrders: 156,
    totalCustomers: 89,
    avgOrderValue: 79.81,
    revenueChange: 23.5,
    ordersChange: 18.2,
    customersChange: 15.8,
    monthlyRevenue: [
      { month: 'Jan', revenue: 8200 },
      { month: 'Feb', revenue: 9100 },
      { month: 'Mar', revenue: 7800 },
      { month: 'Apr', revenue: 10200 },
      { month: 'May', revenue: 11500 },
      { month: 'Jun', revenue: 12450 }
    ],
    ordersByService: [
      { service: 'Regular Wash', orders: 45, percentage: 35 },
      { service: 'Express Wash', orders: 32, percentage: 25 },
      { service: 'Dry Cleaning', orders: 28, percentage: 22 },
      { service: 'Iron Service', orders: 23, percentage: 18 }
    ],
    recentOrders: [
      { id: 'ORD001', customer: 'John Doe', amount: 45, date: '2025-12-08', status: 'completed' },
      { id: 'ORD002', customer: 'Jane Smith', amount: 60, date: '2025-12-08', status: 'in-progress' },
      { id: 'ORD003', customer: 'Bob Johnson', amount: 30, date: '2025-12-07', status: 'ready' },
      { id: 'ORD004', customer: 'Alice Brown', amount: 85, date: '2025-12-07', status: 'completed' },
      { id: 'ORD005', customer: 'Tom Wilson', amount: 40, date: '2025-12-06', status: 'completed' }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#2563eb';
      case 'ready': return '#f59e0b';
      case 'pending': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="provider-analytics">
      <div className="analytics-container">
        <div className="analytics-header">
          <div>
            <h1>Business Analytics</h1>
            <p>Track your business performance and growth</p>
          </div>
          
          <div className="period-selector">
            <button 
              className={selectedPeriod === 'week' ? 'active' : ''}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button 
              className={selectedPeriod === 'month' ? 'active' : ''}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
            <button 
              className={selectedPeriod === 'year' ? 'active' : ''}
              onClick={() => setSelectedPeriod('year')}
            >
              Year
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon revenue">
              <DollarSign size={24} />
            </div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <div className="metric-value">{formatCurrency(analytics.totalRevenue)}</div>
              <div className="metric-change">
                <span 
                  className="change-value"
                  style={{ color: getChangeColor(analytics.revenueChange) }}
                >
                  +{analytics.revenueChange}%
                </span>
                <span>vs last {selectedPeriod}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orders">
              <Package size={24} />
            </div>
            <div className="metric-content">
              <h3>Total Orders</h3>
              <div className="metric-value">{analytics.totalOrders}</div>
              <div className="metric-change">
                <span 
                  className="change-value"
                  style={{ color: getChangeColor(analytics.ordersChange) }}
                >
                  +{analytics.ordersChange}%
                </span>
                <span>vs last {selectedPeriod}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon customers">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <h3>Total Customers</h3>
              <div className="metric-value">{analytics.totalCustomers}</div>
              <div className="metric-change">
                <span 
                  className="change-value"
                  style={{ color: getChangeColor(analytics.customersChange) }}
                >
                  +{analytics.customersChange}%
                </span>
                <span>vs last {selectedPeriod}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon avg-order">
              <TrendingUp size={24} />
            </div>
            <div className="metric-content">
              <h3>Avg Order Value</h3>
              <div className="metric-value">{formatCurrency(analytics.avgOrderValue)}</div>
              <div className="metric-change">
                <span className="change-value" style={{ color: '#6b7280' }}>
                  Steady
                </span>
                <span>this {selectedPeriod}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-section">
          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Monthly Revenue</h3>
              <BarChart3 size={20} />
            </div>
            <div className="revenue-chart">
              <div className="chart-bars">
                {analytics.monthlyRevenue.map((data, index) => (
                  <div key={index} className="chart-bar-group">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${(data.revenue / 15000) * 100}%`,
                        background: '#10b981'
                      }}
                    />
                    <span className="chart-label">{data.month}</span>
                    <span className="chart-value">{formatCurrency(data.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Orders by Service</h3>
              <Package size={20} />
            </div>
            <div className="service-distribution">
              {analytics.ordersByService.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-info">
                    <span className="service-name">{service.service}</span>
                    <span className="service-count">{service.orders} orders</span>
                  </div>
                  <div className="service-bar">
                    <div 
                      className="service-progress"
                      style={{ 
                        width: `${service.percentage}%`,
                        background: `hsl(${140 + index * 30}, 60%, 50%)`
                      }}
                    />
                  </div>
                  <span className="service-percentage">{service.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="orders-header">
            <h3>Recent Orders</h3>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="orders-table">
            <div className="table-header">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            
            {analytics.recentOrders.map((order, index) => (
              <div key={index} className="table-row">
                <span className="order-id">#{order.id}</span>
                <span className="customer-name">{order.customer}</span>
                <span className="order-amount">{formatCurrency(order.amount)}</span>
                <span className="order-date">{order.date}</span>
                <span 
                  className="order-status"
                  style={{ 
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Insights */}
        <div className="insights-section">
          <h3>Business Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Peak Hours</h4>
              <p>Most orders are placed between 10 AM - 2 PM. Consider offering express service during these hours.</p>
            </div>
            <div className="insight-card">
              <h4>Popular Services</h4>
              <p>Regular Wash is your most popular service. Consider bundling it with other services for upselling.</p>
            </div>
            <div className="insight-card">
              <h4>Customer Retention</h4>
              <p>68% of customers are repeat customers. Focus on quality to maintain high retention rates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAnalytics;