import { Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProviderCard.css';

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/provider/${provider.id}`);
  };

  return (
    <div className="provider-card" onClick={handleClick}>
      <div className="provider-image">
        <img src={provider.image} alt={provider.name} />
        {provider.verified && (
          <span className="verified-badge">
            <CheckCircle size={16} />
            Verified
          </span>
        )}
      </div>
      
      <div className="provider-content">
        <h3 className="provider-name">{provider.name}</h3>
        
        <div className="provider-rating">
          <Star size={16} fill="#fbbf24" color="#fbbf24" />
          <span className="rating-value">{provider.rating}</span>
          <span className="rating-count">({provider.reviews} reviews)</span>
        </div>

        <div className="provider-info">
          <div className="info-item">
            <MapPin size={16} />
            <span>{provider.distance} km away</span>
          </div>
          <div className="info-item">
            <Clock size={16} />
            <span>{provider.deliveryTime}</span>
          </div>
        </div>

        <div className="provider-services">
          {provider.services.slice(0, 3).map(service => (
            <span key={service.id} className="service-tag">
              {service.name}
            </span>
          ))}
          {provider.services.length > 3 && (
            <span className="service-tag more">+{provider.services.length - 3} more</span>
          )}
        </div>

        {provider.promotions && provider.promotions.length > 0 && (
          <div className="provider-promotions">
            {provider.promotions.slice(0, 2).map((promo, index) => (
              <span key={index} className="promotion-badge">
                {promo}
              </span>
            ))}
          </div>
        )}

        <div className="provider-price">
          <span className="price-label">Starting from</span>
          <span className="price-value">
            Rs {provider.services[0]?.price || 0}/{provider.services[0]?.unit || 'item'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
