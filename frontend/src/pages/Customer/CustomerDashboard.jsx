import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, Package, TrendingUp, Star, Search, User, MapPin, Filter, Droplets, Shirt, Zap, Sparkles, Calendar, DollarSign, Activity } from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [orders] = useState([
    {
      id: '1',
      providerName: 'CleanWash Express',
      status: 'in-progress',
      items: 3,
      amount: 45,
      pickupDate: '2025-12-08',
      deliveryDate: '2025-12-09'
    },
    {
      id: '2',
      providerName: 'Premium Laundry Care',
      status: 'completed',
      items: 5,
      amount: 75,
      pickupDate: '2025-12-05',
      deliveryDate: '2025-12-06'
    }
  ]);

  const stats = [
    {
      icon: <ShoppingBag size={24} />,
      label: 'Total Orders',
      value: '12',
      color: '#2563eb'
    },
    {
      icon: <Clock size={24} />,
      label: 'Pending',
      value: '1',
      color: '#f59e0b'
    },
    {
      icon: <CheckCircle size={24} />,
      label: 'Completed',
      value: '11',
      color: '#10b981'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#2563eb';
      case 'completed': return '#10b981';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const handleSearch = () => {
    // Navigate to providers page with search parameters
    window.location.href = `/providers`;
  };

  const services = [
    {
      title: "Dry Cleaning",
      description: "Professional dry cleaning for delicate fabrics",
      color: "#3b82f6"
    },
    {
      title: "Wash & Fold",
      description: "Complete wash and fold laundry service",
      color: "#10b981"
    },
    {
      title: "Express Service",
      description: "Fast turnaround for urgent laundry needs",
      color: "#f59e0b"
    },
    {
      title: "Ironing Service",
      description: "Professional ironing for crisp, wrinkle-free clothes",
      color: "#ef4444"
    },
    {
      title: "Steam Press",
      description: "Advanced steam pressing for perfect finish",
      color: "#06b6d4"
    },
    {
      title: "Premium Care",
      description: "Luxury treatment for your finest garments",
      color: "#8b5cf6"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prevIndex) => 
        (prevIndex + 1) % services.length
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [services.length]);

  const currentService = services[currentServiceIndex];

  const recentActivity = [
    {
      id: 1,
      type: 'order_completed',
      title: 'Order #1234 completed',
      description: 'CleanWash Express completed your dry cleaning order',
      time: '2 hours ago',
      icon: <CheckCircle size={20} />,
      color: '#10b981'
    },
    {
      id: 2,
      type: 'order_picked',
      title: 'Order #1235 picked up',
      description: 'Premium Laundry Care picked up your items',
      time: '1 day ago',
      icon: <Package size={20} />,
      color: '#f59e0b'
    },
    {
      id: 3,
      type: 'order_placed',
      title: 'New order placed',
      description: 'Order #1236 placed with Express Wash Co.',
      time: '3 days ago',
      icon: <ShoppingBag size={20} />,
      color: '#2563eb'
    },
    {
      id: 4,
      type: 'provider_rated',
      title: 'Provider rated',
      description: 'You rated CleanWash Express 5 stars',
      time: '5 days ago',
      icon: <Star size={20} />,
      color: '#f59e0b'
    }
  ];

  // Helper functions
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1>Welcome back, {user.name}!</h1>
              <p>Here's what's happening with your orders</p>
            </div>
          </div>

        {/* Animated Services Showcase */}
        <div className="services-showcase">
          <div className="showcase-container">
            <div className="showcase-content" style={{ borderColor: currentService.color }}>
              <div className="showcase-text">
                <h2>{currentService.title}</h2>
                <p>{currentService.description}</p>
              </div>
              <button 
                className="showcase-button"
                style={{ backgroundColor: currentService.color }}
                onClick={handleSearch}
              >
                Explore Services
              </button>
            </div>
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

        <div className="dashboard-content">
          <div className="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <a href="/customer/orders" className="view-all">View All</a>
            </div>

            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>{order.providerName}</h3>
                      <p className="order-id">Order #{order.id}</p>
                    </div>
                    <span 
                      className="order-status"
                      style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <div className="order-info">
                      <Package size={16} />
                      <span>{order.items} items</span>
                    </div>
                    <div className="order-info">
                      <Clock size={16} />
                      <span>Pickup: {order.pickupDate}</span>
                    </div>
                    <div className="order-amount">
                      ${order.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon" style={{ color: activity.color }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
