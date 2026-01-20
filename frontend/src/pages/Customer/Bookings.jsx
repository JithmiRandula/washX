import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, MapPin, Phone, Mail, Package, Star, ArrowLeft, Settings } from 'lucide-react';
import './Bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editableItems, setEditableItems] = useState([]);

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
      description: 'Professional dry cleaning with eco-friendly solvents and premium fabric care. Our state-of-the-art facility uses advanced cleaning technologies to ensure your garments receive the highest quality treatment. We specialize in delicate fabrics, designer clothing, and everyday wear with expert stain removal, precise pressing, and careful handling. Our experienced team provides personalized service with same-day and next-day options available. We are committed to environmental sustainability using biodegradable solvents and energy-efficient processes.',
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

  // Individual Booking Detail Component
  const BookingDetail = ({ booking, onBack }) => {
    return (
      <div className="detail-page">
        {/* Detail Page Navbar */}
        <nav className="detail-navbar">
          <div className="detail-nav-container">
            <div className="detail-nav-brand">
              <img src="/washx logo.png" alt="WashX" className="detail-nav-logo" />
            </div>
            <div className="detail-nav-links">
              <a href="/customer-dashboard" className="detail-nav-link">Dashboard</a>
              <a href="/providers" className="detail-nav-link">Find Providers</a>
              <a href="#" className="detail-nav-link active" onClick={(e) => { e.preventDefault(); onBack(); }}>My Bookings</a>
              <a href="/profile" className="detail-nav-link">Profile</a>
            </div>
          </div>
        </nav>

        {/* Search Bar */}
        <div className="detail-search-section">
          <div className="detail-search-header">
            <h2 className="detail-search-title">Find Your Perfect Laundry Service</h2>
            <p className="detail-search-subtitle">Search for providers, services, or locations near you</p>
          </div>
          <div className="detail-search-container">
            <div className="detail-search-bar">
              <div className="detail-search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search for laundry services, dry cleaning, or locations..."
                className="detail-search-input"
              />
            </div>
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-content">
            <div className="detail-main">
              <div className="detail-provider-section">
                {/* Laundry Image with provider name overlay */}
                <div className="detail-inner-image-section">
                  <img 
                    src="/wash1.jpg" 
                    alt="Laundry Service"
                    className="detail-inner-laundry-image"
                  />
                  <div className="detail-image-overlay">
                    <div className="detail-overlay-settings">
                      <Settings size={32} className="detail-settings-icon" />
                    </div>
                    <div className="detail-overlay-content">
                      <h2 className="detail-overlay-title">{booking.providerName}</h2>
                      <div className="detail-overlay-services">
                        {booking.services.map((service, index) => (
                          <span key={index} className="detail-overlay-service-tag">{service}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className="detail-order-button"
                      onClick={() => setShowOrderSidebar(true)}
                    >
                      View Order Items
                    </button>
                  </div>
                </div>

                {/* Description first */}
                <p className="detail-description">{booking.description}</p>

                {/* Rating and reviews */}
                <div className="detail-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={18} 
                      fill={star <= Math.floor(booking.rating) ? "#fbbf24" : "none"}
                      color="#fbbf24"
                    />
                  ))}
                  <span>{booking.rating}</span>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="detail-info-card">
                  <h3>Order Information</h3>
                  <div className="detail-info-item">
                    <Package size={18} />
                    <span>{booking.items} items</span>
                  </div>
                  <div className="detail-info-item">
                    <Calendar size={18} />
                    <span>Pickup: {booking.pickupDate}</span>
                  </div>
                  <div className="detail-info-item">
                    <Clock size={18} />
                    <span>Delivery: {booking.deliveryDate}</span>
                  </div>
                </div>

                <div className="detail-info-card">
                  <h3>Contact & Location</h3>
                  <div className="detail-info-item">
                    <MapPin size={18} />
                    <span>{booking.address}</span>
                  </div>
                  <div className="detail-info-item">
                    <Phone size={18} />
                    <span>{booking.phone}</span>
                  </div>
                  <div className="detail-info-item">
                    <Mail size={18} />
                    <span>{booking.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-image-section">
              <div className="detail-image-container">
                <img 
                  src="/map1.png" 
                  alt="Location Map"
                  className="detail-provider-image"
                />
              </div>
              
              <div className="detail-image-container">
                <div className="detail-calendar">
                  <div className="detail-calendar-header">
                    <button className="detail-calendar-nav">&lt;</button>
                    <span className="detail-calendar-month">December 2025</span>
                    <button className="detail-calendar-nav">&gt;</button>
                  </div>
                  <div className="detail-calendar-grid">
                    <div className="detail-calendar-day-header">Sun</div>
                    <div className="detail-calendar-day-header">Mon</div>
                    <div className="detail-calendar-day-header">Tue</div>
                    <div className="detail-calendar-day-header">Wed</div>
                    <div className="detail-calendar-day-header">Thu</div>
                    <div className="detail-calendar-day-header">Fri</div>
                    <div className="detail-calendar-day-header">Sat</div>
                    
                    {/* Calendar Days for December 2025 */}
                    {[...Array(31)].map((_, i) => {
                      const day = i + 1;
                      const isPickupDate = day === 8; // December 8th - Pickup
                      const isDeliveryDate = day === 9; // December 9th - Delivery
                      
                      return (
                        <div 
                          key={i} 
                          className={`detail-calendar-day ${
                            isPickupDate ? 'pickup-date' : 
                            isDeliveryDate ? 'delivery-date' : 
                            day < 8 ? 'disabled' : ''
                          }`}
                          title={
                            isPickupDate ? 'Pickup Date' :
                            isDeliveryDate ? 'Delivery Date' : ''
                          }
                        >
                          {day}
                          {isPickupDate && <span className="date-label">Pickup</span>}
                          {isDeliveryDate && <span className="date-label">Delivery</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className={`detail-order-sidebar ${showOrderSidebar ? 'open' : ''}`}>
          <div className="detail-sidebar-header">
            <h3>Order Details</h3>
            <div className="detail-sidebar-controls">
              {!isEditingOrder ? (
                <button 
                  className="detail-edit-button"
                  onClick={() => {
                    setIsEditingOrder(true);
                    setEditableItems([
                      { name: 'Formal Shirt', type: 'Dry Clean', quantity: 2, price: 12.00 },
                      { name: 'Business Suit', type: 'Dry Clean', quantity: 1, price: 25.00 },
                      { name: 'Cotton T-Shirt', type: 'Wash & Fold', quantity: 3, price: 9.00 }
                    ]);
                  }}
                >
                  Edit
                </button>
              ) : (
                <div className="detail-edit-controls">
                  <button 
                    className="detail-save-button"
                    onClick={() => setIsEditingOrder(false)}
                  >
                    Save
                  </button>
                  <button 
                    className="detail-cancel-button"
                    onClick={() => {
                      setIsEditingOrder(false);
                      setEditableItems([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button 
                className="detail-sidebar-close"
                onClick={() => setShowOrderSidebar(false)}
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="detail-sidebar-content">
            <div className="detail-order-summary">
              <h4>Order Summary</h4>
              <div className="detail-order-info">
                <div className="detail-order-row">
                  <span>Order ID:</span>
                  <span>#{booking.id}</span>
                </div>
                <div className="detail-order-row">
                  <span>Status:</span>
                  <span className="status-badge">{booking.status}</span>
                </div>
                <div className="detail-order-row">
                  <span>Total Amount:</span>
                  <span className="amount">Rs.{booking.amount}</span>
                </div>
              </div>
            </div>

            <div className="detail-order-items">
              <h4>Items</h4>
              <div className="detail-item-list">
                {!isEditingOrder ? (
                  // View Mode
                  <>
                    <div className="detail-item">
                      <div className="detail-item-info">
                        <span className="detail-item-name">Formal Shirt</span>
                        <span className="detail-item-type">Dry Clean</span>
                      </div>
                      <div className="detail-item-details">
                        <span className="detail-item-qty-price">Qty: 2Rs.12.00</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-item-info">
                        <span className="detail-item-name">Business Suit</span>
                        <span className="detail-item-type">Dry Clean</span>
                      </div>
                      <div className="detail-item-details">
                        <span className="detail-item-qty-price">Qty: 1Rs.25.00</span>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-item-info">
                        <span className="detail-item-name">Cotton T-Shirt</span>
                        <span className="detail-item-type">Wash & Fold</span>
                      </div>
                      <div className="detail-item-details">
                        <span className="detail-item-qty-price">Qty: 3Rs.9.00</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // Edit Mode
                  editableItems.map((item, index) => (
                    <div key={index} className="detail-item edit-mode">
                      <div className="detail-item-info">
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...editableItems];
                            newItems[index].name = e.target.value;
                            setEditableItems(newItems);
                          }}
                          className="detail-item-name-input"
                        />
                        <select 
                          value={item.type}
                          onChange={(e) => {
                            const newItems = [...editableItems];
                            newItems[index].type = e.target.value;
                            setEditableItems(newItems);
                          }}
                          className="detail-item-type-select"
                        >
                          <option value="Dry Clean">Dry Clean</option>
                          <option value="Wash & Fold">Wash & Fold</option>
                          <option value="Ironing">Ironing</option>
                          <option value="Express Service">Express Service</option>
                        </select>
                      </div>
                      <div className="detail-item-edit-controls">
                        <div className="detail-quantity-controls">
                          <label>Qty:</label>
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...editableItems];
                              newItems[index].quantity = parseInt(e.target.value) || 1;
                              setEditableItems(newItems);
                            }}
                            className="detail-quantity-input"
                          />
                        </div>
                        <div className="detail-price-controls">
                          <label>Rs.</label>
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...editableItems];
                              newItems[index].price = parseFloat(e.target.value) || 0;
                              setEditableItems(newItems);
                            }}
                            className="detail-price-input"
                          />
                        </div>
                        <button 
                          className="detail-remove-item"
                          onClick={() => {
                            const newItems = editableItems.filter((_, i) => i !== index);
                            setEditableItems(newItems);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {isEditingOrder && (
                  <button 
                    className="detail-add-item"
                    onClick={() => {
                      setEditableItems([...editableItems, { 
                        name: 'New Item', 
                        type: 'Dry Clean', 
                        quantity: 1, 
                        price: 10.00 
                      }]);
                    }}
                  >
                    + Add Item
                  </button>
                )}
              </div>
            </div>

            <div className="detail-service-notes">
              <h4>Service Notes</h4>
              <p>Handle with care - delicate items included. Express service requested for business suit.</p>
            </div>
          </div>
        </div>
        
        {showOrderSidebar && <div className="detail-sidebar-overlay" onClick={() => setShowOrderSidebar(false)}></div>}
      </div>
    );
  };

  // Show detail page if booking is selected
  if (selectedBooking) {
    return <BookingDetail booking={selectedBooking} onBack={() => setSelectedBooking(null)} />;
  }

  return (
    <div className="bookings-page">
      <div className="bookings-main">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Track and manage your laundry orders</p>
        </div>

        <div className="bookings-container">
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
              <div 
                key={booking.id} 
                className="booking-card"
                onClick={() => setSelectedBooking(booking)}
                style={{ cursor: 'pointer' }}
              >
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
    </div>
  );
};

export default Bookings;