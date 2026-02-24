import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Shield, CreditCard, Bell, Eye, EyeOff } from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import api from '../../utils/api';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tempProfile, setTempProfile] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        setTempProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/profile', {
        name: tempProfile.name,
        phone: tempProfile.phone,
        dateOfBirth: tempProfile.dateOfBirth,
        gender: tempProfile.gender,
        address: tempProfile.address
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setTempProfile(response.data.data);
        updateAuthProfile(response.data.data);
        setIsEditing(false);
        showMessage('success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const response = await api.post('/users/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfile(prev => ({ ...prev, avatar: response.data.data.avatar }));
        setTempProfile(prev => ({ ...prev, avatar: response.data.data.avatar }));
        updateAuthProfile({ avatar: response.data.data.avatar });
        showMessage('success', 'Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showMessage('error', error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePreferenceChange = async (preference) => {
    try {
      const newPreferences = {
        ...profile.preferences,
        [preference]: !profile.preferences[preference]
      };

      const response = await api.put('/users/preferences', {
        preferences: newPreferences
      });

      if (response.data.success) {
        setProfile(prev => ({ ...prev, preferences: response.data.data }));
        setTempProfile(prev => ({ ...prev, preferences: response.data.data }));
        showMessage('success', 'Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      showMessage('error', 'Failed to update preferences');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('success', 'Password changed successfully');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    }
  };

  const profileTabs = [
    { id: 'profile', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={18} /> }
  ];

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <div className="profile-page">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <CustomerNavbar />
        <div className="profile-page">
          <div className="error-message">Failed to load profile</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="profile-page">
        <div className="profile-main">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Profile Tabs */}
        <div className="profile-tabs">
          {profileTabs.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Personal Information</h3>
                  <button 
                    className={`profile-edit-btn ${isEditing ? 'save' : 'edit'}`}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  >
                    {isEditing ? <Save size={18} /> : <Edit size={18} />}
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="profile-avatar-section">
                  <div className="profile-avatar-large">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" />
                    ) : (
                      <User size={60} />
                    )}
                  </div>
                  <label className="profile-avatar-btn">
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : 'Change Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="profile-form">
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.name}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Email Address</label>
                      <div className="profile-display-value">{profile.email}</div>
                      <small className="profile-note">Email cannot be changed</small>
                    </div>

                    <div className="profile-form-group">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={tempProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.phone || 'Not provided'}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={tempProfile.dateOfBirth ? new Date(tempProfile.dateOfBirth).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Gender</label>
                      {isEditing ? (
                        <select
                          value={tempProfile.gender || 'Prefer not to say'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="profile-input"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="profile-display-value">{profile.gender || 'Prefer not to say'}</div>
                      )}
                    </div>

                    <div className="profile-form-group profile-form-group-full">
                      <label>Street Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.address?.street || ''}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.address?.street || 'Not provided'}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.address?.city || ''}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.address?.city || 'Not provided'}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.address?.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.address?.state || 'Not provided'}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>ZIP Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={tempProfile.address?.zipCode || ''}
                          onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{profile.address?.zipCode || 'Not provided'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Notification Preferences</h3>
                  <p>Choose how you want to receive updates</p>
                </div>
                
                <div className="preferences-list">
                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Push Notifications</h4>
                      <p>Receive notifications about order updates</p>
                    </div>
                    <label className="preference-toggle">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.notifications || false}
                        onChange={() => handlePreferenceChange('notifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Email Updates</h4>
                      <p>Get order confirmations and status updates via email</p>
                    </div>
                    <label className="preference-toggle">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.emailUpdates || false}
                        onChange={() => handlePreferenceChange('emailUpdates')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>SMS Alerts</h4>
                      <p>Receive text messages for urgent updates</p>
                    </div>
                    <label className="preference-toggle">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.smsAlerts || false}
                        onChange={() => handlePreferenceChange('smsAlerts')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <h4>Promotional Emails</h4>
                      <p>Receive offers and promotions from WashX</p>
                    </div>
                    <label className="preference-toggle">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.promotionalEmails || false}
                        onChange={() => handlePreferenceChange('promotionalEmails')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Security Settings</h3>
                  <p>Manage your account security</p>
                </div>
                
                {profile?.googleId ? (
                  <div className="security-info-box">
                    <p>⚠️ You signed in with Google. Password change is not available for Google accounts.</p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="profile-form-group">
                      <label>Current Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="profile-input"
                          required
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label>New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="profile-input"
                          required
                          minLength={6}
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="profile-input"
                          required
                          minLength={6}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="security-btn">
                      Change Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3>Payment Methods</h3>
                  <p>Manage your payment options</p>
                </div>
                
                <div className="payment-methods">
                  {profile.paymentMethods && profile.paymentMethods.length > 0 ? (
                    profile.paymentMethods.map((method, index) => (
                      <div key={method._id || index} className="payment-item">
                        <div className="payment-info">
                          <CreditCard size={24} />
                          <div>
                            <h4>{method.cardType} ending in {method.last4}</h4>
                            <p>Expires {method.expiryDate}</p>
                          </div>
                        </div>
                        <div className="payment-actions">
                          {method.isDefault && <span className="payment-default">Default</span>}
                          <button className="payment-edit">Edit</button>
                          {!method.isDefault && <button className="payment-remove">Remove</button>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-payment-methods">
                      <p>No payment methods added yet</p>
                    </div>
                  )}

                  <button className="add-payment-btn">
                    + Add New Payment Method
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;