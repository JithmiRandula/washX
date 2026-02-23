import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Camera, Edit, Save, X, Clock, Phone, Mail, Star, Upload } from 'lucide-react';
import './ProviderProfile.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ProviderProfile = () => {
  const { providerId } = useParams();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);

  // Fetch provider profile on mount
  useEffect(() => {
    fetchProviderProfile();
  }, [providerId]);

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/providers/${providerId}`);
      
      if (response.data.success) {
        const providerData = response.data.data;
        
        // Transform data to match our state structure
        const formattedProfile = {
          businessName: providerData.businessName || '',
          ownerName: user?.name || '',
          email: providerData.email || '',
          phone: providerData.phone || '',
          address: providerData.address?.street || '',
          city: providerData.address?.city || '',
          zipCode: providerData.address?.zipCode || '',
          state: providerData.address?.state || '',
          latitude: providerData.address?.coordinates?.lat || 0,
          longitude: providerData.address?.coordinates?.lng || 0,
          businessHours: {
            monday: providerData.operatingHours?.monday || { open: '09:00', close: '18:00', closed: false },
            tuesday: providerData.operatingHours?.tuesday || { open: '09:00', close: '18:00', closed: false },
            wednesday: providerData.operatingHours?.wednesday || { open: '09:00', close: '18:00', closed: false },
            thursday: providerData.operatingHours?.thursday || { open: '09:00', close: '18:00', closed: false },
            friday: providerData.operatingHours?.friday || { open: '09:00', close: '18:00', closed: false },
            saturday: providerData.operatingHours?.saturday || { open: '09:00', close: '18:00', closed: false },
            sunday: providerData.operatingHours?.sunday || { open: '', close: '', closed: true }
          },
          description: providerData.description || '',
          businessLicense: providerData.businessLicense || '',
          rating: providerData.rating?.average || 0,
          totalReviews: providerData.rating?.count || 0,
          logoUrl: providerData.images && providerData.images.length > 0 
            ? `http://localhost:5001${providerData.images[0]}` 
            : null
        };
        
        setProfile(formattedProfile);
        setTempProfile(formattedProfile);
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      alert('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      // Transform data back to API format
      const updateData = {
        businessName: tempProfile.businessName,
        description: tempProfile.description,
        businessLicense: tempProfile.businessLicense,
        address: {
          street: tempProfile.address,
          city: tempProfile.city,
          state: tempProfile.state,
          zipCode: tempProfile.zipCode,
          coordinates: {
            lat: tempProfile.latitude,
            lng: tempProfile.longitude
          }
        },
        phone: tempProfile.phone,
        email: tempProfile.email,
        operatingHours: {
          monday: { 
            open: tempProfile.businessHours.monday.open, 
            close: tempProfile.businessHours.monday.close, 
            isClosed: tempProfile.businessHours.monday.closed 
          },
          tuesday: { 
            open: tempProfile.businessHours.tuesday.open, 
            close: tempProfile.businessHours.tuesday.close, 
            isClosed: tempProfile.businessHours.tuesday.closed 
          },
          wednesday: { 
            open: tempProfile.businessHours.wednesday.open, 
            close: tempProfile.businessHours.wednesday.close, 
            isClosed: tempProfile.businessHours.wednesday.closed 
          },
          thursday: { 
            open: tempProfile.businessHours.thursday.open, 
            close: tempProfile.businessHours.thursday.close, 
            isClosed: tempProfile.businessHours.thursday.closed 
          },
          friday: { 
            open: tempProfile.businessHours.friday.open, 
            close: tempProfile.businessHours.friday.close, 
            isClosed: tempProfile.businessHours.friday.closed 
          },
          saturday: { 
            open: tempProfile.businessHours.saturday.open, 
            close: tempProfile.businessHours.saturday.close, 
            isClosed: tempProfile.businessHours.saturday.closed 
          },
          sunday: { 
            open: tempProfile.businessHours.sunday.open, 
            close: tempProfile.businessHours.sunday.close, 
            isClosed: tempProfile.businessHours.sunday.closed 
          }
        }
      };

      const response = await api.put(`/providers/${providerId}/profile`, updateData);
      
      if (response.data.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.response?.data?.message || 'Error saving profile');
    } finally {
      setSaveLoading(false);
    }
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
        alert('Logo uploaded successfully!');
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

  if (loading || !profile) {
    return (
      <div className="provider-profile">
        <div className="profile-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

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
              <button className="btn-secondary" onClick={handleCancel} disabled={saveLoading}>
                <X size={20} />
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saveLoading}>
                <Save size={20} />
                {saveLoading ? 'Saving...' : 'Save Changes'}
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