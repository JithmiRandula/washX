import React, { useState } from 'react';
import './ProvidersPopup.css';

const ProvidersPopup = ({ onClose, onUseCurrentLocation, onEnterLocation }) => {
  const [manualLocation, setManualLocation] = useState('');

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      onEnterLocation(manualLocation);
    } else {
      alert('Please enter a valid location.');
    }
  };

  return (
    <div className="providers-popup-overlay">
      <div className="providers-popup-container">
        <h2 className="providers-popup-title">📍 Find laundries near you</h2>
        <p className="providers-popup-message">
          To show laundry providers within your area and calculate distances accurately, please allow
          location access or enter your location manually.
        </p>
        <div className="providers-popup-actions">
          <button className="providers-popup-button" onClick={onUseCurrentLocation}>
            Use My Current Location
          </button>
          <button className="providers-popup-button" onClick={() => onClose(false)}>
            Enter Location Manually
          </button>
        </div>
        <div className="providers-popup-manual-location">
          <input
            type="text"
            placeholder="Enter your city, area, or postal code"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            className="providers-popup-input"
          />
          <button className="providers-popup-submit" onClick={handleManualLocationSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProvidersPopup;