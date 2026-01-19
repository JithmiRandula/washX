import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, Package, TrendingUp, Star, Search, User, MapPin, Filter, Home, Users, Calendar, MessageCircle, Settings, LogOut, Menu, X, Droplets, Shirt, Zap, Sparkles } from 'lucide-react';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const sidebarItems = [
    {
      icon: <Home size={20} />,
      label: 'Dashboard',
      href: '/customer/dashboard',
      active: true
    },
    {
      icon: <Search size={20} />,
      label: 'Find Providers',
      href: '/providers'
    },
    {
      icon: <Calendar size={20} />,
      label: 'My Bookings',
      href: '/customer/bookings'
    },
    {
      icon: <User size={20} />,
      label: 'Profile',
      href: '/customer/profile'
    }
  ];

  const handleLogout = () => {
    // Add logout functionality here
    console.log('Logout clicked');
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/washx logo.png" alt="WashX" className="logo-image" />
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            <User size={24} />
          </div>
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>Customer</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
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
            <h2>Quick Actions</h2>
            <div className="actions-list">
              <a href="/providers" className="action-card">
                <Search size={24} />
                <span>Find Providers</span>
              </a>
              <a href="/customer/orders" className="action-card">
                <ShoppingBag size={24} />
                <span>My Orders</span>
              </a>
              <a href="/customer/profile" className="action-card">
                <User size={24} />
                <span>Edit Profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
