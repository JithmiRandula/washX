import React, { useState } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
import './ProvidersPopup.css';

const ProvidersPopup = ({ onClose, onUseCurrentLocation, onEnterLocation }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setError('');
    
    try {
      await onUseCurrentLocation();
    } catch (err) {
      setError('Unable to get location. Please try manual entry.');
      setShowManualInput(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleManualLocationSubmit = () => {
    setError('');
    if (manualLocation.trim()) {
      onEnterLocation(manualLocation);
      setManualLocation('');
    } else {
      setError('Please enter a valid location.');
    }
  };

  const handleEnterManually = () => {
    setShowManualInput(true);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualLocationSubmit();
    }
  };

  return (
    <div className="providers-popup-overlay" onClick={() => onClose(false)}>
      <div className="providers-popup-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="providers-popup-title">
          <MapPin size={28} style={{ color: '#ef4444' }} /> Find laundries near you
        </h2>
        <p className="providers-popup-message">
          To show laundry providers within your area and calculate distances accurately, please allow
          location access or enter your location manually.
        </p>
        
        {error && <div className="providers-popup-error">{error}</div>}
        
        {!showManualInput ? (
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
                <>
                  <Navigation size={18} />
                  Use My Current Location
                </>
              )}
            </button>
            <button className="providers-popup-button" onClick={handleEnterManually}>
              <MapPin size={18} />
              Enter Location Manually
            </button>
          </div>
        ) : (
          <div className="providers-popup-manual-location">
            <input
              type="text"
              placeholder="Enter your city, area, or postal code"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="providers-popup-input"
              autoFocus
            />
            <div className="providers-popup-manual-actions">
              <button 
                className="providers-popup-submit" 
                onClick={handleManualLocationSubmit}
                disabled={!manualLocation.trim()}
              >
                Submit
              </button>
              <button 
                className="providers-popup-back" 
                onClick={() => setShowManualInput(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersPopup;