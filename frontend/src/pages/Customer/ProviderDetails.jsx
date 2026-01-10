import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, CheckCircle } from 'lucide-react';
import { getProviderById } from '../../utils/api';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ProviderDetails.css';

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentBooking } = useBooking();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    try {
      const data = await getProviderById(id);
      setProvider(data);
    } catch (error) {
      console.error('Error loading provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceId));
      const newQuantities = { ...quantities };
      delete newQuantities[serviceId];
      setQuantities(newQuantities);
    } else {
      setSelectedServices([...selectedServices, serviceId]);
      setQuantities({ ...quantities, [serviceId]: 1 });
    }
  };

  const handleQuantityChange = (serviceId, quantity) => {
    setQuantities({ ...quantities, [serviceId]: parseInt(quantity) || 1 });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = provider.services.find(s => s.id === serviceId);
      const quantity = quantities[serviceId] || 1;
      return total + (service.price * quantity);
    }, 0);
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const bookingData = {
      providerId: provider.id,
      providerName: provider.name,
      services: selectedServices.map(serviceId => {
        const service = provider.services.find(s => s.id === serviceId);
        return {
          ...service,
          quantity: quantities[serviceId] || 1
        };
      }),
      totalAmount: calculateTotal()
    };

    setCurrentBooking(bookingData);
    navigate('/booking/schedule');
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!provider) {
    return <div className="error-page">Provider not found</div>;
  }

  return (
    <div className="provider-details-page">
      <div className="provider-header">
        <div className="provider-header-content">
          <div className="provider-banner">
            <img src={provider.image} alt={provider.name} />
            {provider.verified && (
              <span className="verified-badge-large">
                <CheckCircle size={24} />
                Verified Provider
              </span>
            )}
          </div>
          
          <div className="provider-main-info">
            <h1>{provider.name}</h1>
            <div className="provider-meta">
              <div className="rating-section">
                <Star size={24} fill="#fbbf24" color="#fbbf24" />
                <span className="rating">{provider.rating}</span>
                <span className="reviews">({provider.reviews} reviews)</span>
              </div>
              <div className="location-info">
                <MapPin size={20} />
                <span>{provider.address}</span>
              </div>
              <div className="delivery-info">
                <Clock size={20} />
                <span>Delivery: {provider.deliveryTime}</span>
              </div>
            </div>

            <div className="provider-contact">
              <div className="contact-item">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <span>contact@{provider.name.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
            </div>

            {provider.promotions && provider.promotions.length > 0 && (
              <div className="promotions-section">
                <h3>Active Promotions</h3>
                <div className="promotions-list">
                  {provider.promotions.map((promo, index) => (
                    <div key={index} className="promo-item">
                      <span className="promo-icon">🎁</span>
                      <span>{promo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="provider-content">
        <div className="services-section">
          <h2>Services & Pricing</h2>
          <div className="services-list">
            {provider.services.map(service => (
              <div 
                key={service.id}
                className={`service-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
              >
                <div className="service-info">
                  <div className="service-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                    />
                  </div>
                  <div>
                    <h4>{service.name}</h4>
                    <p className="service-price">${service.price} per {service.unit}</p>
                  </div>
                </div>
                {selectedServices.includes(service.id) && (
                  <div className="quantity-selector">
                    <label>Quantity ({service.unit}):</label>
                    <input
                      type="number"
                      min="1"
                      value={quantities[service.id] || 1}
                      onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedServices.length > 0 && (
          <div className="booking-summary">
            <div className="summary-content">
              <h3>Booking Summary</h3>
              <div className="summary-items">
                {selectedServices.map(serviceId => {
                  const service = provider.services.find(s => s.id === serviceId);
                  const quantity = quantities[serviceId] || 1;
                  return (
                    <div key={serviceId} className="summary-item">
                      <span>{service.name} x {quantity}</span>
                      <span>${service.price * quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
              <button className="btn-book" onClick={handleBookNow}>
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;
