import React, { useState, useRef } from 'react';
import { MapPin, Camera, Edit, Save, X, Clock, Phone, Mail, Star, Upload } from 'lucide-react';
import './ProviderProfile.css';
import api from '../../utils/api';

const ProviderProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    businessName: 'Clean & Fresh Laundry',
    ownerName: 'John Smith',
    email: 'john@cleanfresh.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Downtown',
    city: 'New York',
    zipCode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    businessHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    description: 'Professional laundry service with over 10 years of experience. We use eco-friendly products and offer same-day service.',
    services: ['Regular Wash', 'Dry Cleaning', 'Express Wash', 'Iron Service'],
    rating: 4.8,
    totalReviews: 156,
    logoUrl: null // Add logo URL
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const handleHoursChange = (day, field, value) => {
    setTempProfile({
      ...tempProfile,
      businessHours: {
        ...tempProfile.businessHours,
        [day]: {
          ...tempProfile.businessHours[day],
          [field]: value
        }
      }
    });
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // For now, we'll use a mock provider ID. In production, get this from auth context
      const providerId = '507f1f77bcf86cd799439011'; // Replace with actual provider ID from context
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/providers/${providerId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const imageUrl = `http://localhost:5001${response.data.data}`;
        setProfile({ ...profile, logoUrl: imageUrl });
        setTempProfile({ ...tempProfile, logoUrl: imageUrl });
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="provider-profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <h1>Business Profile</h1>
            <p>Manage your business information and location</p>
          </div>
          
          {!isEditing ? (
            <button className="btn-primary" onClick={handleEdit}>
              <Edit size={20} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-secondary" onClick={handleCancel}>
                <X size={20} />
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Save size={20} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="profile-content">
          {/* Business Information */}
          <div className="profile-section">
            <h2>Business Information</h2>
            
            <div className="business-header">
              <div className="business-logo">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div className="logo-placeholder" onClick={handleLogoClick}>
                  {uploading ? (
                    <div className="uploading-state">
                      <div className="spinner"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : profile.logoUrl ? (
                    <div className="logo-image-container">
                      <img src={profile.logoUrl} alt="Business Logo" className="logo-image" />
                      <div className="logo-overlay">
                        <Camera size={24} />
                        <span>Change Logo</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} />
                      <span>Upload Logo</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="business-details">
                {isEditing ? (
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      value={tempProfile.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h3>{profile.businessName}</h3>
                    <div className="rating">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span>{profile.rating}</span>
                      <span>({profile.totalReviews} reviews)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Owner Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  />
                ) : (
                  <span>{profile.ownerName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <span className="contact-info">
                    <Mail size={16} />
                    {profile.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={tempProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <span className="contact-info">
                    <Phone size={16} />
                    {profile.phone}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label>Business Description</label>
                {isEditing ? (
                  <textarea
                    value={tempProfile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <p>{profile.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="profile-section">
            <h2>Location & Address</h2>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <span className="contact-info">
                    <MapPin size={16} />
                    {profile.address}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                ) : (
                  <span>{profile.city}</span>
                )}
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                ) : (
                  <span>{profile.zipCode}</span>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="map-container">
              <div className="map-placeholder">
                <MapPin size={48} />
                <h3>Business Location</h3>
                <p>{profile.address}, {profile.city} {profile.zipCode}</p>
                <button className="map-btn">
                  <MapPin size={16} />
                  View on Map
                </button>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="profile-section">
            <h2>Business Hours</h2>
            
            <div className="hours-grid">
              {days.map((day) => (
                <div key={day} className="hour-row">
                  <div className="day-label">
                    <Clock size={16} />
                    <span>{dayLabels[day]}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="hour-inputs">
                      <label className="closed-label">
                        <input
                          type="checkbox"
                          checked={tempProfile.businessHours[day].closed}
                          onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        />
                        Closed
                      </label>
                      
                      {!tempProfile.businessHours[day].closed && (
                        <div className="time-inputs">
                          <input
                            type="time"
                            value={tempProfile.businessHours[day].open}
                            onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={tempProfile.businessHours[day].close}
                            onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="hour-display">
                      {profile.businessHours[day].closed ? (
                        <span className="closed">Closed</span>
                      ) : (
                        <span>
                          {profile.businessHours[day].open} - {profile.businessHours[day].close}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="profile-section">
            <h2>Services Offered</h2>
            <div className="services-list">
              {profile.services.map((service, index) => (
                <span key={index} className="service-tag">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;