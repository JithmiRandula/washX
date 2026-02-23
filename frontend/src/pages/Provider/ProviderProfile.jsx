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
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState(null);

  // Fetch provider profile on mount
  useEffect(() => {
    if (providerId) {
      fetchProviderProfile();
    }
  }, [providerId]);

  const fetchProviderProfile = async () => {
    if (!providerId) {
      console.error('Provider ID is missing');
      setError('Provider ID is missing. Please login again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/providers/${providerId}`);
      
      if (response.data.success && response.data.data) {
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
            monday: {
              open: providerData.operatingHours?.monday?.open || '09:00',
              close: providerData.operatingHours?.monday?.close || '18:00',
              closed: providerData.operatingHours?.monday?.isClosed || false
            },
            tuesday: {
              open: providerData.operatingHours?.tuesday?.open || '09:00',
              close: providerData.operatingHours?.tuesday?.close || '18:00',
              closed: providerData.operatingHours?.tuesday?.isClosed || false
            },
            wednesday: {
              open: providerData.operatingHours?.wednesday?.open || '09:00',
              close: providerData.operatingHours?.wednesday?.close || '18:00',
              closed: providerData.operatingHours?.wednesday?.isClosed || false
            },
            thursday: {
              open: providerData.operatingHours?.thursday?.open || '09:00',
              close: providerData.operatingHours?.thursday?.close || '18:00',
              closed: providerData.operatingHours?.thursday?.isClosed || false
            },
            friday: {
              open: providerData.operatingHours?.friday?.open || '09:00',
              close: providerData.operatingHours?.friday?.close || '18:00',
              closed: providerData.operatingHours?.friday?.isClosed || false
            },
            saturday: {
              open: providerData.operatingHours?.saturday?.open || '09:00',
              close: providerData.operatingHours?.saturday?.close || '18:00',
              closed: providerData.operatingHours?.saturday?.isClosed || false
            },
            sunday: {
              open: providerData.operatingHours?.sunday?.open || '',
              close: providerData.operatingHours?.sunday?.close || '',
              closed: providerData.operatingHours?.sunday?.isClosed !== false // Default Sunday to closed if not explicitly set
            }
          },
          description: providerData.description || '',
          businessLicense: providerData.businessLicense || '',
          services: providerData.services || [], // Add services array
          rating: providerData.rating?.average || 0,
          totalReviews: providerData.rating?.count || 0,
          logoUrl: providerData.images && providerData.images.length > 0 
            ? `http://localhost:5001${providerData.images[0]}` 
            : null
        };
        
        setProfile(formattedProfile);
        setTempProfile(formattedProfile);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      setError(error.response?.data?.message || 'Error loading profile data. Please try again.');
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
      
      // Validate required fields
      const requiredFields = {
        'Business Name': tempProfile.businessName,
        'Description': tempProfile.description,
        'Business License': tempProfile.businessLicense,
        'Street Address': tempProfile.address,
        'City': tempProfile.city,
        'State': tempProfile.state,
        'ZIP Code': tempProfile.zipCode,
        'Phone': tempProfile.phone,
        'Email': tempProfile.email
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value || value.trim() === '')
        .map(([field, _]) => field);

      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields:\n- ${missingFields.join('\n- ')}`);
        setSaveLoading(false);
        return;
      }

      // Validate business hours for days that are not closed
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const invalidHours = [];
      
      days.forEach(day => {
        const hours = tempProfile.businessHours[day];
        if (!hours.closed) {
          if (!hours.open || !hours.close) {
            invalidHours.push(day.charAt(0).toUpperCase() + day.slice(1));
          } else if (hours.open >= hours.close) {
            invalidHours.push(`${day.charAt(0).toUpperCase() + day.slice(1)} (closing time must be after opening time)`);
          }
        }
      });

      if (invalidHours.length > 0) {
        alert(`Please fix the following business hours:\n- ${invalidHours.join('\n- ')}`);
        setSaveLoading(false);
        return;
      }
      
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
            open: tempProfile.businessHours.monday.closed ? '' : tempProfile.businessHours.monday.open, 
            close: tempProfile.businessHours.monday.closed ? '' : tempProfile.businessHours.monday.close, 
            isClosed: tempProfile.businessHours.monday.closed 
          },
          tuesday: { 
            open: tempProfile.businessHours.tuesday.closed ? '' : tempProfile.businessHours.tuesday.open, 
            close: tempProfile.businessHours.tuesday.closed ? '' : tempProfile.businessHours.tuesday.close, 
            isClosed: tempProfile.businessHours.tuesday.closed 
          },
          wednesday: { 
            open: tempProfile.businessHours.wednesday.closed ? '' : tempProfile.businessHours.wednesday.open, 
            close: tempProfile.businessHours.wednesday.closed ? '' : tempProfile.businessHours.wednesday.close, 
            isClosed: tempProfile.businessHours.wednesday.closed 
          },
          thursday: { 
            open: tempProfile.businessHours.thursday.closed ? '' : tempProfile.businessHours.thursday.open, 
            close: tempProfile.businessHours.thursday.closed ? '' : tempProfile.businessHours.thursday.close, 
            isClosed: tempProfile.businessHours.thursday.closed 
          },
          friday: { 
            open: tempProfile.businessHours.friday.closed ? '' : tempProfile.businessHours.friday.open, 
            close: tempProfile.businessHours.friday.closed ? '' : tempProfile.businessHours.friday.close, 
            isClosed: tempProfile.businessHours.friday.closed 
          },
          saturday: { 
            open: tempProfile.businessHours.saturday.closed ? '' : tempProfile.businessHours.saturday.open, 
            close: tempProfile.businessHours.saturday.closed ? '' : tempProfile.businessHours.saturday.close, 
            isClosed: tempProfile.businessHours.saturday.closed 
          },
          sunday: { 
            open: tempProfile.businessHours.sunday.closed ? '' : tempProfile.businessHours.sunday.open, 
            close: tempProfile.businessHours.sunday.closed ? '' : tempProfile.businessHours.sunday.close, 
            isClosed: tempProfile.businessHours.sunday.closed 
          }
        }
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await api.put(`/providers/${providerId}/profile`, updateData);
      
      if (response.data.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
        
        // Refresh the profile data from server to ensure sync
        await fetchProviderProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error details:', error.response?.data); // Debug log
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
    const updatedDay = {
      ...tempProfile.businessHours[day],
      [field]: value
    };

    // If closing the business for the day, clear the open/close times
    if (field === 'closed' && value === true) {
      updatedDay.open = '';
      updatedDay.close = '';
    }
    
    // If opening the business for the day and times are empty, set default times
    if (field === 'closed' && value === false) {
      if (!updatedDay.open) updatedDay.open = '09:00';
      if (!updatedDay.close) updatedDay.close = '18:00';
    }

    setTempProfile({
      ...tempProfile,
      businessHours: {
        ...tempProfile.businessHours,
        [day]: updatedDay
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
          {loading ? (
            <>
              <div className="spinner"></div>
              <p>Loading profile...</p>
            </>
          ) : error ? (
            <>
              <div style={{ color: '#dc2626', fontSize: '1.2rem', marginBottom: '1rem' }}>
                ⚠️ Error Loading Profile
              </div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</p>
              <button 
                className="btn-primary" 
                onClick={() => fetchProviderProfile()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <p style={{ color: '#6b7280' }}>No profile data available</p>
              <button 
                className="btn-primary" 
                onClick={() => fetchProviderProfile()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}
              >
                Reload Profile
              </button>
            </>
          )}
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

              <div className="form-group">
                <label>Business License Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                    placeholder="Enter your business license number"
                  />
                ) : (
                  <span>{profile.businessLicense}</span>
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
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="e.g., CA, NY, TX"
                  />
                ) : (
                  <span>{profile.state}</span>
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
              {days.map((day) => {
                const dayHours = profile.businessHours?.[day] || { open: '09:00', close: '18:00', closed: false };
                const tempDayHours = tempProfile.businessHours?.[day] || { open: '09:00', close: '18:00', closed: false };
                
                return (
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
                            checked={tempDayHours.closed}
                            onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                          />
                          Closed
                        </label>
                        
                        {!tempDayHours.closed && (
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={tempDayHours.open}
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={tempDayHours.close}
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="hour-display">
                        {dayHours.closed ? (
                          <span className="closed">Closed</span>
                        ) : (
                          <span>
                            {dayHours.open} - {dayHours.close}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services Offered */}
          <div className="profile-section">
            <h2>Services Offered</h2>
            <div className="services-list">
              {profile.services && profile.services.length > 0 ? (
                profile.services.map((service, index) => (
                  <span key={index} className="service-tag">
                    {typeof service === 'string' ? service : service.name || 'Service'}
                  </span>
                ))
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  No services added yet. Add services to display them here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;