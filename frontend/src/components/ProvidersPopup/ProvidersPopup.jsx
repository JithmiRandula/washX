import React, { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import './ProvidersPopup.css';

const ProvidersPopup = ({ onClose, onUseCurrentLocation }) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setError('');
    try {
      await onUseCurrentLocation();
    } catch (err) {
      setError('Unable to get location. Please ensure location access is enabled.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="providers-popup-overlay" onClick={() => onClose(false)}>
      <div className="providers-popup-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="providers-popup-title">
          <MapPin size={28} style={{ color: '#ef4444' }} /> Find laundries near you
        </h2>
        <p className="providers-popup-message">
          To show laundry providers within your area and calculate distances accurately,
          please allow location access.
        </p>

        {error && <div className="providers-popup-error">{error}</div>}

        <div className="providers-popup-actions">
          <button
            className="providers-popup-button"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <>
                <Loader size={18} className="providers-popup-spinner" />
                Getting Location...
              </>
            ) : (
              'Use My Current Location'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProvidersPopup;
