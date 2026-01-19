import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, MapPin, Phone, Mail, Package, Star, ArrowLeft } from 'lucide-react';
import './Bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const bookings = [
    {
      id: '1',
      providerName: 'CleanWash Express',
      providerImage: '/api/placeholder/300/200',
      status: 'in-progress',
      items: 3,
      amount: 45,
      pickupDate: '2025-12-08',
      deliveryDate: '2025-12-09',
      address: '123 Main St, Downtown',
      phone: '+1 234-567-8900',
      email: 'info@cleanwash.com',
      services: ['Dry Cleaning', 'Wash & Fold'],
      rating: 4.5,
      description: 'Professional dry cleaning with eco-friendly solvents and premium fabric care.',
      location: {
        lat: 40.7128,
        lng: -74.0060
      },
      orderItems: [
        { name: 'Business Shirt', quantity: 2, price: 15 },
        { name: 'Jeans', quantity: 1, price: 30 }
      ]
    },
    {
      id: '2',
      providerName: 'Premium Laundry Care',
      providerImage: '/api/placeholder/300/200',
      status: 'completed',
      items: 5,
      amount: 75,
      pickupDate: '2025-12-05',
      deliveryDate: '2025-12-06',
      address: '456 Oak Ave, Midtown',
      phone: '+1 234-567-8901',
      email: 'contact@premium.com',
      services: ['Premium Care', 'Steam Press'],
      rating: 4.8,
      description: 'Premium laundry service with hand-pressed finishing and stain removal.',
      location: {
        lat: 40.7589,
        lng: -73.9851
      },
      orderItems: [
        { name: 'Dress Shirt', quantity: 3, price: 25 },
        { name: 'Suit Jacket', quantity: 1, price: 40 },
        { name: 'Trousers', quantity: 1, price: 10 }
      ]
    },
    {
      id: '3',
      providerName: 'Express Wash Co.',
      providerImage: '/api/placeholder/300/200',
      status: 'pending',
      items: 2,
      amount: 35,
      pickupDate: '2025-12-10',
      deliveryDate: '2025-12-11',
      address: '789 Pine St, Uptown',
      phone: '+1 234-567-8902',
      email: 'hello@expresswash.com',
      services: ['Express Service', 'Ironing'],
      rating: 4.3,
      location: {
        lat: 40.7831,
        lng: -73.9712
      },
      orderItems: [
        { name: 'Casual Shirt', quantity: 2, price: 35 }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#2563eb';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Pickup';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <button className="back-button" onClick={handleGoBack}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>My Bookings</h1>
          <p>Track and manage all your laundry orders</p>
        </div>

        {/* Stats Summary */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-number">{bookings.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{bookings.filter(b => b.status === 'pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{bookings.filter(b => b.status === 'in-progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button 
            className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-content">
                <div className="left-content">
                  <div className="provider-section">
                    <h3>{booking.providerName}</h3>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          fill={star <= Math.floor(booking.rating) ? "#fbbf24" : "none"}
                          color="#fbbf24"
                        />
                      ))}
                      <span>{booking.rating}</span>
                    </div>
                    <div className="services-tags">
                      {booking.services.map((service, index) => (
                        <span key={index} className="service-tag">{service}</span>
                      ))}
                    </div>
                    <p className="service-description">{booking.description}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Order Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <Package size={16} />
                        <span>{booking.items} items</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>Pickup: {booking.pickupDate}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>Delivery: {booking.deliveryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-image">
                  <img 
                    src="/wash1.jpg" 
                    alt={booking.providerName}
                    className="provider-image"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="no-bookings">
            <Package size={48} />
            <h3>No bookings found</h3>
            <p>You don't have any {activeTab === 'all' ? '' : activeTab} orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;