import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProvidersPopup from '../../components/ProvidersPopup/ProvidersPopup';
import { Search, Filter, MapPin, Star, Clock, Phone, Mail, Package, Calendar } from 'lucide-react';
import './HomeProviders.css';

const HomeProviders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [filters, setFilters] = useState({
    search: '',
    distance: 10,
    minRating: 0,
    serviceType: 'all',
    sortBy: 'distance'
  });

  const [providers] = useState([
    {
      id: '1',
      name: 'Clean & Fresh Laundry',
      rating: 4.8,
      reviews: 156,
      distance: 2.5,
      address: '123 Galle Road, Colombo 03',
      phone: '+94 11 234 5678',
      email: 'info@cleanfresh.com',
      description: 'Professional laundry service with eco-friendly products and same-day delivery.',
      services: ['Regular Wash', 'Dry Cleaning', 'Iron Service', 'Express Wash'],
      pricing: { regular: 15, express: 25, dryClean: 35 },
      hours: '8:00 AM - 8:00 PM',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400',
      features: ['Same Day Service', 'Eco-Friendly', 'Free Pickup & Delivery']
    },
    {
      id: '2',
      name: 'Quick Wash Express',
      rating: 4.6,
      reviews: 89,
      distance: 1.8,
      address: '456 Duplication Road, Colombo 04',
      phone: '+94 11 456 7890',
      email: 'service@quickwash.com',
      description: 'Fast and reliable laundry service specializing in express cleaning.',
      services: ['Express Wash', 'Regular Wash', 'Iron Service'],
      pricing: { regular: 12, express: 20, dryClean: 30 },
      hours: '7:00 AM - 10:00 PM',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      features: ['24/7 Service', 'Express Delivery', 'Mobile App']
    },
    {
      id: '3',
      name: 'Premium Dry Cleaners',
      rating: 4.9,
      reviews: 234,
      distance: 3.2,
      address: '789 Nawam Mawatha, Colombo 02',
      phone: '+94 11 789 0123',
      email: 'contact@premiumdry.com',
      description: 'High-end dry cleaning service for delicate and luxury garments.',
      services: ['Dry Cleaning', 'Regular Wash', 'Suit Care', 'Leather Cleaning'],
      pricing: { regular: 18, express: 28, dryClean: 45 },
      hours: '9:00 AM - 7:00 PM',
      image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400',
      features: ['Luxury Care', 'Expert Staff', 'Quality Guarantee']
    },
    {
      id: '4',
      name: 'EcoWash Green Cleaners',
      rating: 4.7,
      reviews: 145,
      distance: 4.1,
      address: '321 Peradeniya Road, Kandy',
      phone: '+94 81 223 4567',
      email: 'hello@ecowash.com',
      description: '100% eco-friendly laundry service using organic detergents.',
      services: ['Eco Wash', 'Regular Wash', 'Green Dry Clean'],
      pricing: { regular: 16, express: 24, dryClean: 38 },
      hours: '8:30 AM - 6:30 PM',
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400',
      features: ['100% Eco-Friendly', 'Organic Products', 'Carbon Neutral']
    },
    {
      id: '5',
      name: 'University Laundromat',
      rating: 4.3,
      reviews: 67,
      distance: 6.8,
      address: '555 Reid Avenue, Colombo 07',
      phone: '+94 11 567 8901',
      email: 'info@unilundry.com',
      description: 'Student-friendly laundry service with affordable rates.',
      services: ['Self Service', 'Full Service', 'Wash & Fold'],
      pricing: { regular: 10, express: 18, dryClean: 25 },
      hours: '6:00 AM - 11:00 PM',
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400',
      features: ['Student Discounts', 'Extended Hours', 'Study Area']
    }
  ]);

  const [location, setLocation] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         provider.address.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDistance = provider.distance <= filters.distance;
    const matchesRating = provider.rating >= filters.minRating;
    const matchesService = filters.serviceType === 'all' || 
                          provider.services.some(service => 
                            service.toLowerCase().includes(filters.serviceType.toLowerCase())
                          );
    
    return matchesSearch && matchesDistance && matchesRating && matchesService;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distance - b.distance;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const handleBookOrder = (providerId) => {
    if (!isAuthenticated) {
      // Redirect to register page if not authenticated
      navigate('/register', { 
        state: { 
          message: 'Please register or login to book an order',
          returnTo: `/providers/${providerId}` 
        } 
      });
      return;
    }
    
    // If authenticated, proceed with booking
    navigate(`/customer/book/${providerId}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleUseCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, method: 'gps' });
          setShowPopup(false);
          console.log(`Location obtained: ${latitude}, ${longitude}`);
          resolve();
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access was denied.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleEnterLocation = async (manualLocation) => {
    console.log(`Manual location entered: ${manualLocation}`);
    
    try {
      // Using Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setLocation({ 
            latitude: parseFloat(lat), 
            longitude: parseFloat(lon),
            address: manualLocation,
            method: 'manual'
          });
          setShowPopup(false);
          console.log(`Location geocoded: ${lat}, ${lon}`);
        } else {
          alert('Location not found. Please try a different location.');
        }
      } else {
        // Fallback: just use the manual location text
        setLocation({ 
          latitude: 0, 
          longitude: 0, 
          address: manualLocation,
          method: 'manual'
        });
        setShowPopup(false);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback: still accept the manual location
      setLocation({ 
        latitude: 0, 
        longitude: 0, 
        address: manualLocation,
        method: 'manual'
      });
      setShowPopup(false);
    }
  };

  return (
    <div className="home-providers-page">
      {showPopup && (
        <ProvidersPopup
          onClose={setShowPopup}
          onUseCurrentLocation={handleUseCurrentLocation}
          onEnterLocation={handleEnterLocation}
        />
      )}

      <div className="home-providers-container">
        {/* Header */}
        <div className="home-providers-header">
          <div className="home-header-content">
            <h1>Find Laundry Providers</h1>
            <p>Discover reliable laundry services near you</p>
          </div>
          
          <div className="home-results-info">
            <span>{filteredProviders.length} providers found</span>
          </div>
        </div>

        {/* Filters */}
        <div className="home-providers-filters">
          <div className="home-search-section">
            <div className="home-search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="home-filter-section">
            <div className="home-filter-group">
              <label>Distance (KM)</label>
              <select
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
              >
                <option value={50}>All Distances</option>
                <option value={1}>Within 1 KM</option>
                <option value={3}>Within 3 KM</option>
                <option value={5}>Within 5 KM</option>
                <option value={8}>Within 8 KM</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="wash">Wash & Fold</option>
                <option value="dry">Dry Cleaning</option>
                <option value="iron">Ironing Service</option>
                <option value="steam">Steam Press</option>
                <option value="premium">Premium Care</option>
                <option value="express">Express Service</option>
              </select>
            </div>

            <div className="home-filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="reviews">Reviews</option>
              </select>
            </div>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="home-providers-grid">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="home-provider-card">
              <div className="home-provider-image">
                <img src={provider.image} alt={provider.name} />
                <div className="home-distance-badge">
                  <MapPin size={14} />
                  {provider.distance} km
                </div>
              </div>

              <div className="home-provider-content">
                <div className="home-provider-header">
                  <h3>{provider.name}</h3>
                  <div className="home-rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{provider.rating}</span>
                    <span className="home-reviews">({provider.reviews} reviews)</span>
                  </div>
                </div>

                <div className="home-provider-details">
                  <div className="home-address">
                    <MapPin size={14} />
                    <span>{provider.address}</span>
                  </div>
                  
                  <div className="home-contact-info">
                    <div className="home-contact-item">
                      <Clock size={14} />
                      <span>{provider.hours}</span>
                    </div>
                    <div className="home-contact-item">
                      <Phone size={14} />
                      <span>{provider.phone}</span>
                    </div>
                  </div>

                  <p className="home-description">{provider.description}</p>

                  <div className="home-services">
                    {provider.services.slice(0, 3).map((service, index) => (
                      <span key={index} className="home-service-tag">
                        <Package size={12} />
                        {service}
                      </span>
                    ))}
                    {provider.services.length > 3 && (
                      <span className="home-service-tag home-more">
                        +{provider.services.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="home-features">
                    {provider.features.map((feature, index) => (
                      <span key={index} className="home-feature-tag">{feature}</span>
                    ))}
                  </div>

                  <div className="home-pricing">
                    <div className="home-price-item">
                      <span>Regular Wash</span>
                      <span>Rs {provider.pricing.regular}</span>
                    </div>
                    <div className="home-price-item">
                      <span>Express Wash</span>
                      <span>Rs {provider.pricing.express}</span>
                    </div>
                    <div className="home-price-item">
                      <span>Dry Cleaning</span>
                      <span>Rs {provider.pricing.dryClean}</span>
                    </div>
                  </div>
                </div>

                <div className="home-provider-actions">
                  <button 
                    className="home-view-details-btn"
                    onClick={() => navigate(`/provider-details/${provider.id}`)}
                  >
                    View Details
                  </button>
                  <button 
                    className="home-book-order-btn"
                    onClick={() => handleBookOrder(provider.id)}
                  >
                    <Calendar size={16} />
                    Book Order
                  </button>
                </div>

                {!isAuthenticated && (
                  <div className="home-auth-notice">
                    <p>⚠️ Please register or login to book orders</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="home-no-providers">
            <Package size={48} />
            <h3>No providers found</h3>
            <p>Try adjusting your search criteria or expanding the distance range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeProviders;