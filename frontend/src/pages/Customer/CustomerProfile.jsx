import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Shield, CreditCard, Bell } from 'lucide-react';
import CustomerNavigation from '../../components/CustomerNavigation/CustomerNavigation';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@email.com',
    phone: user?.phone || '+1 (555) 123-4567',
    address: user?.address || '123 Main Street, Downtown, NY 10001',
    dateOfBirth: user?.dateOfBirth || '1990-05-15',
    gender: user?.gender || 'Male',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false,
      promotionalEmails: true
    }
  });
  const [activeTab, setActiveTab] = useState('profile');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const profileTabs = [
    { id: 'profile', label: 'Personal Info', icon: <User size={18} /> },
    { id: 'preferences', label: 'Preferences', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={18} /> }
  ];

  return (
    <CustomerNavigation>
      <div className="profile-main">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

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
                    <User size={60} />
                  </div>
                  <button className="profile-avatar-btn">
                    <Camera size={16} />
                    Change Photo
                  </button>
                </div>

                <div className="profile-form">
                  <div className="profile-form-grid">
                    <div className="profile-form-group">
                      <label>Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{formData.name}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{formData.email}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{formData.phone}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="profile-input"
                        />
                      ) : (
                        <div className="profile-display-value">{formData.dateOfBirth}</div>
                      )}
                    </div>

                    <div className="profile-form-group profile-form-group-full">
                      <label>Address</label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="profile-input profile-textarea"
                          rows={3}
                        />
                      ) : (
                        <div className="profile-display-value">{formData.address}</div>
                      )}
                    </div>

                    <div className="profile-form-group">
                      <label>Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="profile-input"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="profile-display-value">{formData.gender}</div>
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
                        checked={formData.preferences.notifications}
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
                        checked={formData.preferences.emailUpdates}
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
                        checked={formData.preferences.smsAlerts}
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
                        checked={formData.preferences.promotionalEmails}
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
                
                <div className="security-options">
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Change Password</h4>
                      <p>Update your account password</p>
                    </div>
                    <button className="security-btn">Change Password</button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <button className="security-btn secondary">Enable 2FA</button>
                  </div>

                  <div className="security-item">
                    <div className="security-info">
                      <h4>Login Activity</h4>
                      <p>View recent login attempts and devices</p>
                    </div>
                    <button className="security-btn secondary">View Activity</button>
                  </div>
                </div>
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
                  <div className="payment-item">
                    <div className="payment-info">
                      <CreditCard size={24} />
                      <div>
                        <h4>Visa ending in 1234</h4>
                        <p>Expires 12/2027</p>
                      </div>
                    </div>
                    <div className="payment-actions">
                      <span className="payment-default">Default</span>
                      <button className="payment-edit">Edit</button>
                    </div>
                  </div>

                  <div className="payment-item">
                    <div className="payment-info">
                      <CreditCard size={24} />
                      <div>
                        <h4>Mastercard ending in 5678</h4>
                        <p>Expires 08/2026</p>
                      </div>
                    </div>
                    <div className="payment-actions">
                      <button className="payment-edit">Edit</button>
                      <button className="payment-remove">Remove</button>
                    </div>
                  </div>

                  <button className="add-payment-btn">
                    + Add New Payment Method
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerNavigation>
  );
};

export default CustomerProfile;