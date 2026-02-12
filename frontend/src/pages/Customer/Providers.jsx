/**
 * Providers Page with Stripe Payment Integration
 * 
 * PAYMENT INTEGRATION NOTES:
 * -------------------------
 * This component includes a complete Stripe payment flow for online payments.
 * 
 * CURRENT IMPLEMENTATION (Frontend Only - Demo):
 * - Card number formatting (XXXX XXXX XXXX XXXX)
 * - Expiry date validation (MM/YY)
 * - CVV input (3 digits)
 * - Simulated payment processing
 * - Success/failure handling
 * 
 * FOR PRODUCTION DEPLOYMENT:
 * 1. Install Stripe packages:
 *    npm install @stripe/stripe-js @stripe/react-stripe-js
 * 
 * 2. Create a backend endpoint to create payment intent:
 *    POST /api/create-payment-intent
 *    Body: { amount, currency, metadata }
 * 
 * 3. Replace the processStripePayment function with actual Stripe API:
 *    - Load Stripe with publishable key
 *    - Create PaymentIntent on backend
 *    - Use stripe.confirmCardPayment() with client_secret
 *    - Handle 3D Secure authentication if required
 * 
 * 4. Add webhook handler on backend for payment confirmations:
 *    POST /api/webhooks/stripe
 *    Handle: payment_intent.succeeded, payment_intent.failed
 * 
 * 5. Store Stripe keys securely:
 *    - Frontend: REACT_APP_STRIPE_PUBLISHABLE_KEY
 *    - Backend: STRIPE_SECRET_KEY (never expose to frontend)
 * 
 * 6. Test with Stripe test cards:
 *    - Success: 4242 4242 4242 4242
 *    - Decline: 4000 0000 0000 0002
 *    - 3D Secure: 4000 0027 6000 3184
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, Package, Calendar, Clock, Phone, Mail, ArrowLeft, Settings, CreditCard, CheckCircle, X } from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Providers.css';

const Providers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [useTransportService, setUseTransportService] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [bookingData, setBookingData] = useState({
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    pickupDate: '',
    pickupSlot: '', // Morning / Afternoon / Evening
    serviceType: 'Wash & Fold',
    items: [
      {
        category: 'Clothes',
        quantity: 1,
        weight: '',
        fabric: 'Cotton',
        color: 'Mixed'
      }
    ],
    notes: '',
    promoCode: '',
    paymentMethod: 'Cash on Delivery',
    invoiceRequired: false,
    estimate: { subtotal: 0, discount: 0, total: 0 },
    transportCost: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'rating',
    minRating: 0,
    maxDistance: 50,
    serviceType: 'all'
  });

  // Sample providers data with detailed information
  const [providers] = useState([
    {
      id: '1',
      name: 'CleanWash Express',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      address: '123 Main St, Downtown',
      phone: '+1 234-567-8900',
      email: 'info@cleanwash.com',
      distance: 2.3,
      services: ['Dry Cleaning', 'Wash & Fold', 'Express Service'],
      priceRange: '15-45',
      description: 'Professional dry cleaning with eco-friendly solvents and premium fabric care. Our state-of-the-art facility uses advanced cleaning technologies to ensure your garments receive the highest quality treatment. We specialize in delicate fabrics, designer clothing, and everyday wear with expert stain removal, precise pressing, and careful handling.',
      available: true,
      reviews: 124,
      specialties: ['Silk Care', 'Leather Cleaning', 'Eco-Friendly']
    },
    {
      id: '2',
      name: 'Premium Laundry Care',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      address: '456 Oak Ave, Midtown',
      phone: '+1 234-567-8901',
      email: 'contact@premium.com',
      distance: 1.8,
      services: ['Premium Care', 'Steam Press', 'Alterations'],
      priceRange: '20-75',
      description: 'Premium laundry service with hand-pressed finishing and stain removal. We offer the finest quality cleaning for luxury garments and business attire with personalized attention to detail.',
      available: true,
      reviews: 89,
      specialties: ['Luxury Garments', 'Hand Pressing', 'Same Day Service']
    },
    {
      id: '3',
      name: 'Express Wash Co.',
      image: '/api/placeholder/300/200',
      rating: 4.3,
      address: '789 Pine St, Uptown',
      phone: '+1 234-567-8902',
      email: 'hello@expresswash.com',
      distance: 3.1,
      services: ['Express Service', 'Ironing', 'Commercial Cleaning'],
      priceRange: '12-35',
      description: 'Fast and efficient laundry service with same-day delivery options. Perfect for busy professionals who need reliable and quick turnaround times.',
      available: true,
      reviews: 156,
      specialties: ['Same Day', 'Bulk Orders', '24/7 Pickup']
    },
    {
      id: '4',
      name: 'EcoClean Solutions',
      image: '/api/placeholder/300/200',
      rating: 4.6,
      address: '321 Green Ave, Eco District',
      phone: '+1 234-567-8903',
      email: 'info@ecoclean.com',
      distance: 2.9,
      services: ['Eco-Friendly Cleaning', 'Organic Care', 'Green Pressing'],
      priceRange: '18-50',
      description: 'Environmentally conscious cleaning using only biodegradable and eco-friendly products. Safe for your clothes and the planet.',
      available: true,
      reviews: 78,
      specialties: ['Eco-Friendly', 'Sensitive Skin Safe', 'Organic Products']
    }
  ]);

  const filteredProviders = providers.filter(provider => {
    if (filters.search && !provider.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.minRating && provider.rating < filters.minRating) {
      return false;
    }
    if (filters.maxDistance && provider.distance > filters.maxDistance) {
      return false;
    }
    if (filters.serviceType !== 'all' && !provider.services.some(service => 
      service.toLowerCase().includes(filters.serviceType.toLowerCase())
    )) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'price':
        return parseInt(a.priceRange.split('-')[0]) - parseInt(b.priceRange.split('-')[0]);
      case 'rating':
      default:
        return b.rating - a.rating;
    }
  });

  // Pricing helpers
  const baseRates = {
    'Wash & Fold': 8,
    'Wash & Iron': 10,
    'Dry Clean': 15,
    'Iron Only': 5,
    'Express Service': 20
  };

  const calcEstimate = (data) => {
    const d = data || bookingData;
    const rate = baseRates[d.serviceType] || 0;
    let subtotal = 0;
    d.items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const weight = Number(it.weight) || 0;
      const weightCost = (d.serviceType === 'Wash & Fold' || d.serviceType === 'Wash & Iron') ? weight * 2 : 0;
      subtotal += qty * rate + weightCost;
    });
    let discount = 0;
    const code = (d.promoCode || '').trim().toUpperCase();
    if (code === 'SAVE10') discount = subtotal * 0.1;
    if (code === 'SAVE20') discount = subtotal * 0.2;
    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
  };

  const setAndRecalc = (updater) => {
    setBookingData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next, estimate: calcEstimate(next) };
    });
  };

  const addItem = () => {
    setAndRecalc(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { category: 'Clothes', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' }
      ]
    }));
  };

  const updateItem = (index, key, value) => {
    setAndRecalc(prev => {
      const items = prev.items.map((it, i) => i === index ? { ...it, [key]: value } : it);
      return { ...prev, items };
    });
  };

  const removeItemRow = (index) => {
    setAndRecalc(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'rating',
      minRating: 0,
      maxDistance: 50,
      serviceType: 'all'
    });
  };

  const handleBookService = (provider) => {
    setSelectedProvider(provider);
    setShowBookingForm(true);
    setBookingData({
      customerInfo: { name: '', phone: '', email: '', address: '' },
      pickupDate: '',
      pickupSlot: '',
      serviceType: 'Wash & Fold',
      items: [{ category: 'Clothes', quantity: 1, weight: '', fabric: 'Cotton', color: 'Mixed' }],
      notes: '',
      promoCode: '',
      paymentMethod: 'Cash on Delivery',
      invoiceRequired: false,
      estimate: { subtotal: 0, discount: 0, total: 0 }
    });
  };

  const submitBooking = () => {
    // Validate form
    if (!bookingData.customerInfo.name || !bookingData.customerInfo.phone || 
        !bookingData.customerInfo.email || !bookingData.customerInfo.address || 
        !bookingData.pickupDate || !bookingData.pickupSlot) {
      alert('Please fill in all required fields');
      return;
    }

    // Show current payment method to user
    const currentMethod = bookingData.paymentMethod;
    console.log('========================================');
    console.log('PAYMENT METHOD:', currentMethod);
    console.log('========================================');

    // CRITICAL: This modal should ONLY open for "Online Payment"
    // For "Cash on Delivery" it should process booking directly
    
    if (currentMethod === 'Online Payment') {
      // ✅ CORRECT: Open payment modal for Online Payment
      console.log('✅ Online Payment detected → OPENING PAYMENT MODAL');
      setShowPaymentModal(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentMethod === 'Cash on Delivery') {
      // ✅ CORRECT: Process directly for Cash on Delivery (NO MODAL)
      console.log('✅ Cash on Delivery detected → PROCESSING DIRECTLY (NO MODAL)');
      processBooking();
    } else {
      console.error('❌ Unknown payment method:', currentMethod);
    }
  };

  const processBooking = () => {
    console.log('Booking submitted:', {
      provider: selectedProvider,
      bookingData
    });
    // Here you would typically send the booking to your backend
    alert(`Booking confirmed! Payment Method: ${bookingData.paymentMethod}`);
    setShowBookingForm(false);
    setSelectedProvider(null);
    resetCardDetails();
  };

  const resetCardDetails = () => {
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    setShowCardForm(false);
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      // Format as XXXX XXXX XXXX XXXX
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardDetails({ ...cardDetails, cardNumber: value });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\//g, '');
    if (value.length <= 4 && /^\d*$/.test(value)) {
      // Format as MM/YY
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      setCardDetails({ ...cardDetails, expiryDate: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCardDetails({ ...cardDetails, cvv: value });
    }
  };

  const processStripePayment = async () => {
    // Validate card details
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || 
        !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }

    if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Invalid card number');
      return;
    }

    if (cardDetails.cvv.length !== 3) {
      alert('Invalid CVV');
      return;
    }

    setPaymentProcessing(true);

    // Simulate Stripe payment processing
    // In production, you would:
    // 1. Create a payment intent on your backend
    // 2. Use Stripe.js to confirm the payment
    // 3. Handle the response
    
    setTimeout(() => {
      // Simulate successful payment
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      
      // After 2 seconds, process the booking
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
        processBooking();
      }, 2000);
    }, 2000);
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setShowBookingForm(true);
    setBookingData((prev) => ({
      ...prev,
      estimate: { ...prev.estimate, subtotal: parseFloat(provider.priceRange.split('-')[0]) },
      transportCost: provider.transportCost || 0
    }));
  };

  const handleTransportToggle = () => {
    setUseTransportService(!useTransportService);
    setBookingData((prev) => ({
      ...prev,
      estimate: {
        ...prev.estimate,
        total: prev.estimate.subtotal + (useTransportService ? 0 : prev.transportCost)
      }
    }));
  };

  // Provider Detail View (similar to booking detail)
  if (selectedProvider && !showBookingForm) {
    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <div className="bookings-header">
              <button 
                className="back-button"
                onClick={() => setSelectedProvider(null)}
              >
                <ArrowLeft size={20} />
                Back to Providers
              </button>
              <h1>{selectedProvider.name}</h1>
              <p>{selectedProvider.description}</p>
            </div>

            <div className="detail-container">
              <div className="detail-content">
                <div className="detail-main">
                  <div className="detail-provider-section">
                    {/* Provider Image with overlay */}
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
                          <h2 className="detail-overlay-title">{selectedProvider.name}</h2>
                          <div className="detail-overlay-services">
                            {selectedProvider.services.map((service, index) => (
                              <span key={index} className="detail-overlay-service-tag">{service}</span>
                            ))}
                          </div>
                        </div>
                        <button 
                          className="detail-order-button"
                          onClick={() => handleBookService(selectedProvider)}
                        >
                          Book Service
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="detail-description">{selectedProvider.description}</p>

                    {/* Rating and reviews */}
                    <div className="detail-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          fill={star <= Math.floor(selectedProvider.rating) ? "#fbbf24" : "none"}
                          color="#fbbf24"
                        />
                      ))}
                      <span>{selectedProvider.rating} ({selectedProvider.reviews} reviews)</span>
                    </div>

                    {/* Specialties */}
                    <div className="specialties-section">
                      <h4>Specialties</h4>
                      <div className="specialties-tags">
                        {selectedProvider.specialties.map((specialty, index) => (
                          <span key={index} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-info-grid">
                    <div className="detail-info-card">
                      <h3>Service Information</h3>
                      <div className="detail-info-item">
                        <Package size={18} />
                        <span>Price Range: Rs {selectedProvider.priceRange}</span>
                      </div>
                      <div className="detail-info-item">
                        <MapPin size={18} />
                        <span>Distance: {selectedProvider.distance} km</span>
                      </div>
                      <div className="detail-info-item">
                        <Star size={18} />
                        <span>{selectedProvider.reviews} Reviews</span>
                      </div>
                    </div>

                    <div className="detail-info-card">
                      <h3>Contact & Location</h3>
                      <div className="detail-info-item">
                        <MapPin size={18} />
                        <span>{selectedProvider.address}</span>
                      </div>
                      <div className="detail-info-item">
                        <Phone size={18} />
                        <span>{selectedProvider.phone}</span>
                      </div>
                      <div className="detail-info-item">
                        <Mail size={18} />
                        <span>{selectedProvider.email}</span>
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
                        
                        {/* Calendar Days */}
                        {[...Array(31)].map((_, i) => {
                          const day = i + 1;
                          const isToday = day === new Date().getDate();
                          
                          return (
                            <div 
                              key={i} 
                              className={`detail-calendar-day ${day < new Date().getDate() ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Stripe Payment Modal — must be checked BEFORE showBookingForm
  if (showPaymentModal) {
    return (
      <>
        <CustomerNavbar />
        <div className="sp-overlay">
          <div className="sp-modal">
            {!paymentSuccess ? (
              <>
                <div className="sp-header">
                  <button 
                    className="sp-close-btn" 
                    onClick={() => {
                      setShowPaymentModal(false);
                      resetCardDetails();
                      setPaymentProcessing(false);
                      setPaymentSuccess(false);
                      setShowCardForm(false);
                    }}
                    disabled={paymentProcessing}
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="sp-total-section">
                  <span className="sp-total-label">Total due today:</span>
                  <span className="sp-total-amount">
                    Rs {Math.floor(bookingData.estimate.total)}
                    <sup>.{((bookingData.estimate.total % 1) * 100).toFixed(0).padStart(2, '0')}</sup>
                  </span>
                </div>

                {!showCardForm ? (
                  <>
                    <div className="sp-express-section">
                      <h3 className="sp-express-title">Express checkout</h3>
                    </div>

                    <div className="sp-express-buttons">
                      <button className="sp-express-btn sp-paypal-btn" disabled={paymentProcessing}>
                        <span className="sp-paypal-text">
                          <span className="sp-pay-blue">Pay</span><span className="sp-pal-blue">Pal</span>
                        </span>
                      </button>

                      <button className="sp-express-btn sp-gpay-btn" disabled={paymentProcessing}>
                        <div className="sp-gpay-content">
                          <span className="sp-gpay-logo">G Pay</span>
                          <span className="sp-gpay-divider">|</span>
                          <span className="sp-gpay-card">
                            <span className="sp-visa-badge">VISA</span>
                            •••• 0894
                          </span>
                        </div>
                      </button>

                      <button className="sp-express-btn sp-apple-btn" disabled={paymentProcessing}>
                        <span className="sp-apple-logo"> Pay</span>
                      </button>

                      <button 
                        className="sp-card-btn"
                        onClick={() => setShowCardForm(true)}
                        disabled={paymentProcessing}
                      >
                        <span className="sp-card-btn-text">Pay with card</span>
                        <div className="sp-card-brands">
                          <span className="sp-brand sp-mc">
                            <svg width="26" height="16" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#EB001B"/><circle cx="17" cy="8" r="7" fill="#F79E1B"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00"/></svg>
                          </span>
                          <span className="sp-brand sp-maestro">
                            <svg width="26" height="16" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#6C6BBD"/><circle cx="17" cy="8" r="7" fill="#009DDD"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#6C6BBD" opacity="0.7"/></svg>
                          </span>
                          <span className="sp-brand sp-visa-logo">
                            <svg width="32" height="16" viewBox="0 0 32 16"><rect width="32" height="16" rx="2" fill="#1434CB"/><text x="16" y="11.5" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">VISA</text></svg>
                          </span>
                          <span className="sp-brand sp-amex">
                            <svg width="26" height="16" viewBox="0 0 26 16"><rect width="26" height="16" rx="2" fill="#006FCF"/><text x="13" y="11" fontFamily="Arial" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">AMERICAN</text><text x="13" y="7" fontFamily="Arial" fontSize="5" fill="white" textAnchor="middle">EXPRESS</text></svg>
                          </span>
                          <span className="sp-brand sp-jcb">
                            <svg width="22" height="16" viewBox="0 0 22 16"><rect width="22" height="16" rx="2" fill="#0E4C96"/><text x="11" y="11" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">JCB</text></svg>
                          </span>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="sp-card-form">
                    <div className="sp-card-form-header">
                      <button className="sp-back-btn" onClick={() => setShowCardForm(false)}>
                        ← Back
                      </button>
                      <h3 className="sp-card-form-title">Pay with card</h3>
                    </div>

                    <div className="sp-input-group">
                      <label className="sp-input-label">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                        placeholder="Full name on card"
                        disabled={paymentProcessing}
                        className="sp-input"
                      />
                    </div>

                    <div className="sp-input-group">
                      <label className="sp-input-label">Card Number</label>
                      <div className="sp-input-with-icons">
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 1234 1234 1234"
                          maxLength="19"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                        <div className="sp-input-card-icons">
                          <svg width="24" height="16" viewBox="0 0 32 16"><rect width="32" height="16" rx="2" fill="#1434CB"/><text x="16" y="11.5" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">VISA</text></svg>
                          <svg width="20" height="14" viewBox="0 0 26 16"><circle cx="9" cy="8" r="7" fill="#EB001B"/><circle cx="17" cy="8" r="7" fill="#F79E1B"/><path d="M13 2.4a7 7 0 0 1 0 11.2 7 7 0 0 1 0-11.2z" fill="#FF5F00"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="sp-input-row">
                      <div className="sp-input-group">
                        <label className="sp-input-label">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          maxLength="5"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                      </div>
                      <div className="sp-input-group">
                        <label className="sp-input-label">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          placeholder="CVV"
                          maxLength="3"
                          disabled={paymentProcessing}
                          className="sp-input"
                        />
                      </div>
                    </div>

                    <button 
                      className="sp-pay-btn"
                      onClick={processStripePayment}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="sp-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        <>Pay Rs {bookingData.estimate.total.toFixed(2)}</>
                      )}
                    </button>

                    <div className="sp-secure-note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Your payment is secure and encrypted</span>
                    </div>
                  </div>
                )}

                <div className="sp-powered-by">
                  Powered by <strong>Stripe</strong>
                </div>
              </>
            ) : (
              <div className="sp-success">
                <div className="sp-success-icon">
                  <CheckCircle size={80} color="#10b981" />
                </div>
                <h2>Payment Successful!</h2>
                <p>Your booking is being confirmed...</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Booking Form Modal
  if (showBookingForm) {
    return (
      <>
        <CustomerNavbar />
        <div className="bookings-page">
          <div className="bookings-main">
            <div className="bookings-header">
              <button 
                className="back-button"
                onClick={() => setShowBookingForm(false)}
              >
                <ArrowLeft size={20} />
                Back to Provider
              </button>
              <h1>Book Service with {selectedProvider.name}</h1>
              <p>Fill in the details for your laundry service</p>
            </div>

            <div className="booking-form-container">
              <div className="booking-form">
                <div className="booking-header">
                  <h2>Book Laundry Service</h2>
                </div>

                <div className="transport-option">
                  <label className="transport-toggle-label">
                    <input
                      type="checkbox"
                      checked={useTransportService}
                      onChange={handleTransportToggle}
                    />
                    Use our transport service (+Rs {selectedProvider.transportCost || 0})
                  </label>
                </div>

                <div className="total-amount">
                  <strong>Total Amount: </strong>Rs {bookingData.estimate.total}
                </div>

                {/* Customer Details */}
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.name}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, name: e.target.value }
                    })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
                    })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={bookingData.customerInfo.email}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, email: e.target.value }
                    })}
                    placeholder="Email for confirmations"
                  />
                </div>
                <div className="form-group">
                  <label>Pickup Address</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.address}
                    onChange={(e) => setAndRecalc({
                      ...bookingData,
                      customerInfo: { ...bookingData.customerInfo, address: e.target.value }
                    })}
                    placeholder="Your address"
                  />
                </div>

                {/* Schedule */}
                <div className="form-group">
                  <label>Pickup Date</label>
                  <input
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => setAndRecalc({ ...bookingData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Pickup Time Slot</label>
                  <select
                    value={bookingData.pickupSlot}
                    onChange={(e) => setAndRecalc({ ...bookingData, pickupSlot: e.target.value })}
                  >
                    <option value="">Select a slot</option>
                    <option value="Morning">Morning (8am - 12pm)</option>
                    <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                    <option value="Evening">Evening (4pm - 8pm)</option>
                  </select>
                </div>

                {/* Service Type */}
                <div className="form-group">
                  <label>Service Type</label>
                  <select
                    value={bookingData.serviceType}
                    onChange={(e) => setAndRecalc({ ...bookingData, serviceType: e.target.value })}
                  >
                    <option value="Wash & Fold">Wash & Fold</option>
                    <option value="Wash & Iron">Wash & Iron</option>
                    <option value="Dry Clean">Dry Clean</option>
                    <option value="Iron Only">Iron Only</option>
                    <option value="Express Service">Express Service</option>
                  </select>
                </div>

                {/* Items */}
                <h3 style={{marginTop: '1rem', marginBottom: '0.5rem', color: '#374151'}}>Items</h3>
                {bookingData.items.map((item, index) => (
                  <div key={index} className="item-grid-row">
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                    >
                      <option value="Clothes">Clothes</option>
                      <option value="Bedding">Bedding</option>
                      <option value="Curtains">Curtains</option>
                      <option value="Towels">Towels</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', e.target.value)}
                      placeholder="Weight (kg)"
                    />
                    <select
                      value={item.fabric}
                      onChange={(e) => updateItem(index, 'fabric', e.target.value)}
                    >
                      <option value="Cotton">Cotton</option>
                      <option value="Wool">Wool</option>
                      <option value="Silk">Silk</option>
                      <option value="Denim">Denim</option>
                    </select>
                    <select
                      value={item.color}
                      onChange={(e) => updateItem(index, 'color', e.target.value)}
                    >
                      <option value="Whites">Whites</option>
                      <option value="Colors">Colors</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                    {bookingData.items.length > 1 && (
                      <button type="button" className="remove-item-btn" onClick={() => removeItemRow(index)}>×</button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addItem}>Add Item</button>

                {/* Payment & Notes */}
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-method-options">
                    <div 
                      className={`payment-method-card ${bookingData.paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                      onClick={() => {
                        const newData = { ...bookingData, paymentMethod: 'Cash on Delivery' };
                        console.log('💵 CLICKED: Cash on Delivery');
                        console.log('Setting payment method to:', newData.paymentMethod);
                        setAndRecalc(newData);
                      }}
                    >
                      <div className="payment-method-content">
                        <Package size={24} />
                        <span>Cash on Delivery</span>
                        <p className="payment-method-description">Pay when your order is delivered</p>
                      </div>
                      {bookingData.paymentMethod === 'Cash on Delivery' && (
                        <div className="payment-method-selected-icon">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                    <div 
                      className={`payment-method-card ${bookingData.paymentMethod === 'Online Payment' ? 'selected' : ''}`}
                      onClick={() => {
                        const newData = { ...bookingData, paymentMethod: 'Online Payment' };
                        setAndRecalc(newData);
                      }}
                    >
                      <div className="payment-method-content">
                        <CreditCard size={24} />
                        <span>Online Payment</span>
                        <small>Via Stripe</small>
                        <p className="payment-method-description">Secure card payment</p>
                      </div>
                      {bookingData.paymentMethod === 'Online Payment' && (
                        <div className="payment-method-selected-icon">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Method Info */}
                  {bookingData.paymentMethod === 'Cash on Delivery' && (
                    <div className="payment-info-box payment-info-cod">
                      <Package size={16} />
                      <div className="payment-info-content">
                        <strong>Cash on Delivery Selected</strong>
                        <p>You can pay in cash when your order is delivered. Click "Book Now" to confirm your booking directly (no payment popup).</p>
                      </div>
                    </div>
                  )}
                  
                  {bookingData.paymentMethod === 'Online Payment' && (
                    <div className="payment-info-box payment-info-online">
                      <CreditCard size={16} />
                      <div className="payment-info-content">
                        <strong>Online Payment via Stripe</strong>
                        <p>Click "Proceed to Payment" to open the secure payment popup where you can enter your card details.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Special Instructions (optional)</label>
                  <textarea
                    placeholder="Any special instructions..."
                    value={bookingData.notes}
                    onChange={(e) => setAndRecalc({ ...bookingData, notes: e.target.value })}
                    rows="2"
                  />
                </div>

                {/* Estimate */}
                <div className="estimate-card">
                  <div className="estimate-row"><span>Estimated Subtotal:</span><strong>Rs {bookingData.estimate.subtotal.toFixed(2)}</strong></div>
                  <div className="estimate-row"><span>Discount:</span><strong>-Rs {bookingData.estimate.discount.toFixed(2)}</strong></div>
                  <div className="estimate-total"><span>Total:</span><strong>Rs {bookingData.estimate.total.toFixed(2)}</strong></div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={() => setShowBookingForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitBooking}
                    className="submit-btn"
                    disabled={!bookingData.customerInfo.name || !bookingData.customerInfo.phone || !bookingData.customerInfo.email || !bookingData.customerInfo.address || !bookingData.pickupDate || !bookingData.pickupSlot || bookingData.items.length === 0}
                  >
                    {bookingData.paymentMethod === 'Online Payment' ? (
                      <>
                        <CreditCard size={18} />
                        Proceed to Payment 💳
                      </>
                    ) : (
                      <>
                        <Package size={18} />
                        Book Now (COD) 💵
                      </>
                    )}
                  </button>
                  
                  {/* Debug Info */}
                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Current: <strong>{bookingData.paymentMethod}</strong>
                    {bookingData.paymentMethod === 'Online Payment' && (
                      <div style={{ color: '#3b82f6', fontWeight: '600', marginTop: '0.25rem' }}>
                        ✓ Will open payment modal
                      </div>
                    )}
                    {bookingData.paymentMethod === 'Cash on Delivery' && (
                      <div style={{ color: '#16a34a', fontWeight: '600', marginTop: '0.25rem' }}>
                        ✓ Will process directly (no modal)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Providers List (similar to bookings list)
  return (
    <>
      <CustomerNavbar />
      <div className="bookings-page">
        <div className="bookings-main">
          <div className="bookings-header">
            <h1>Find Providers</h1>
            <p>Discover trusted laundry service providers near you</p>
          </div>

          <div className="bookings-container">
            {/* Search and Filter Section */}
            <div className="search-section">
              <div className="search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search providers by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={20} />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filters-header">
                  <h3>Filters</h3>
                  <button onClick={clearFilters} className="clear-filters">
                    Clear All
                  </button>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="distance">Nearest First</option>
                    <option value="price">Lowest Price</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  >
                    <option value="0">All Ratings</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Maximum Distance: {filters.maxDistance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
                  />
                </div>

                <div className="filter-group">
                  <label>Service Type</label>
                  <select
                    value={filters.serviceType}
                    onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                  >
                    <option value="all">All Services</option>
                    <option value="wash">Wash & Fold</option>
                    <option value="dry-clean">Dry Cleaning</option>
                    <option value="iron">Ironing</option>
                    <option value="express">Express Service</option>
                  </select>
                </div>
              </div>
            )}

            {/* Providers Grid */}
            <div className="providers-grid">
              {loading ? (
                <div className="loading-container">
                  <LoadingSpinner size="large" />
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="no-bookings">
                  <Package size={48} />
                  <h3>No providers found</h3>
                  <p>Try adjusting your search criteria or filters.</p>
                  <button onClick={clearFilters} className="btn-clear">
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredProviders.map(provider => (
                  <div 
                    key={provider.id} 
                    className="provider-card"
                  >
                    <div className="provider-image-container">
                      <img 
                        src="/wash1.jpg" 
                        alt={provider.name}
                        className="provider-card-image"
                      />
                      <div className="provider-status-tag">
                        <span className="status-available">Available</span>
                      </div>
                    </div>
                    
                    <div className="provider-card-content">
                      <h3 className="provider-name">{provider.name}</h3>
                      
                      <div className="provider-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            fill={star <= Math.floor(provider.rating) ? "#fbbf24" : "none"}
                            color="#fbbf24"
                          />
                        ))}
                        <span>{provider.rating}</span>
                      </div>
                      
                      <p className="provider-description">
                        {provider.description.length > 100 
                          ? provider.description.substring(0, 100) + "..." 
                          : provider.description
                        }
                      </p>
                      
                      <div className="provider-details">
                        <div className="provider-detail-item">
                          <MapPin size={14} />
                          <span>{provider.distance} km</span>
                        </div>
                        <div className="provider-detail-item">
                          <Package size={14} />
                          <span>Rs {provider.priceRange}</span>
                        </div>
                      </div>
                      
                      <div className="provider-actions">
                        <button 
                          className="view-details-btn"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          View Details
                        </button>
                        <button 
                          className="book-now-btn"
                          onClick={() => handleBookService(provider)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Providers;