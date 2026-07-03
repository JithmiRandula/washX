import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Shield, CreditCard, Bell, Eye, EyeOff, Plus } from 'lucide-react';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardType: 'Visa',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    isDefault: false
  });

  useEffect(() => { fetchProfile(); }, []);

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
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
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
    if (file.size > 2 * 1024 * 1024) { showMessage('error', 'Image size should be less than 2MB'); return; }
    if (!file.type.startsWith('image/')) { showMessage('error', 'Please upload an image file'); return; }

    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const response = await api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
      const response = await api.put('/users/preferences', { preferences: newPreferences });
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
    if (passwordData.newPassword !== passwordData.confirmPassword) { showMessage('error', 'New passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { showMessage('error', 'Password must be at least 6 characters'); return; }
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

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    const cardNumberClean = paymentForm.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length !== 16 || !/^\d+$/.test(cardNumberClean)) { showMessage('error', 'Please enter a valid 16-digit card number'); return; }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiryDate)) { showMessage('error', 'Please enter expiry date in MM/YY format'); return; }
    if (paymentForm.cvv.length < 3 || paymentForm.cvv.length > 4 || !/^\d+$/.test(paymentForm.cvv)) { showMessage('error', 'Please enter a valid CVV (3 or 4 digits)'); return; }
    try {
      const last4 = cardNumberClean.slice(-4);
      const response = await api.post('/users/payment-methods', {
        type: 'card',
        cardType: paymentForm.cardType,
        last4,
        expiryDate: paymentForm.expiryDate,
        isDefault: paymentForm.isDefault,
        stripePaymentMethodId: ''
      });
      if (response.data.success) {
        setProfile(prev => ({ ...prev, paymentMethods: response.data.data }));
        setShowPaymentModal(false);
        setPaymentForm({ cardType: 'Visa', cardNumber: '', expiryDate: '', cvv: '', isDefault: false });
        showMessage('success', 'Payment method added successfully');
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      showMessage('error', error.response?.data?.message || 'Failed to add payment method');
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId, isDefault) => {
    const msg = isDefault
      ? 'This is your default payment method. Are you sure you want to remove it?'
      : 'Are you sure you want to remove this payment method?';
    if (!window.confirm(msg)) return;
    try {
      const response = await api.delete(`/users/payment-methods/${paymentMethodId}`);
      if (response.data.success) {
        setProfile(prev => ({ ...prev, paymentMethods: response.data.data }));
        showMessage('success', 'Payment method removed successfully');
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      showMessage('error', 'Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      const response = await api.put(`/users/payment-methods/${paymentMethodId}/default`);
      if (response.data.success) {
        setProfile(prev => ({ ...prev, paymentMethods: response.data.data }));
        showMessage('success', 'Default payment method updated');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      showMessage('error', 'Failed to set default payment method');
    }
  };

  const TABS = [
    { id: 'profile',     label: 'Personal Info',    icon: <User size={17} />       },
    { id: 'preferences', label: 'Preferences',      icon: <Bell size={17} />       },
    { id: 'security',    label: 'Security',         icon: <Shield size={17} />     },
    { id: 'payment',     label: 'Payment Methods',  icon: <CreditCard size={17} /> },
  ];

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <div className="cpf-page">
          <div className="cpf-loading">Loading profile…</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <CustomerNavbar />
        <div className="cpf-page">
          <div className="cpf-error-state">Failed to load profile</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="cpf-page">
        <div className="cpf-main">

          {/* ── Header ── */}
          <div className="cpf-header">
            <h1 className="cpf-title">Profile Settings</h1>
            <p className="cpf-sub">Manage your account information and preferences</p>
          </div>

          {/* ── Toast ── */}
          {message.text && (
            <div className={`cpf-toast cpf-toast-${message.type}`}>
              {message.text}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="cpf-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`cpf-tab${activeTab === tab.id ? ' cpf-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Personal Info ── */}
          {activeTab === 'profile' && (
            <div className="cpf-card cpf-card-blue">
              <div className="cpf-card-head">
                <div>
                  <h3 className="cpf-card-title">Personal Information</h3>
                </div>
                <button
                  className={`cpf-edit-btn${isEditing ? ' cpf-edit-btn-save' : ''}`}
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? <Save size={16} /> : <Edit size={16} />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              {/* Avatar */}
              <div className="cpf-avatar-row">
                <div className="cpf-avatar">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="Profile" />
                    : <User size={48} />
                  }
                </div>
                <label className="cpf-avatar-btn">
                  <Camera size={15} />
                  {uploading ? 'Uploading…' : 'Change Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Form grid */}
              <div className="cpf-form-grid">
                <div className="cpf-form-group">
                  <label className="cpf-label">Full Name</label>
                  {isEditing
                    ? <input className="cpf-input" type="text" value={tempProfile.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
                    : <div className="cpf-display">{profile.name}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">Email Address</label>
                  <div className="cpf-display">{profile.email}</div>
                  <small className="cpf-note">Email cannot be changed</small>
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">Phone Number</label>
                  {isEditing
                    ? <input className="cpf-input" type="tel" value={tempProfile.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} />
                    : <div className="cpf-display">{profile.phone || 'Not provided'}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">Date of Birth</label>
                  {isEditing
                    ? <input className="cpf-input" type="date" value={tempProfile.dateOfBirth ? new Date(tempProfile.dateOfBirth).toISOString().split('T')[0] : ''} onChange={e => handleInputChange('dateOfBirth', e.target.value)} />
                    : <div className="cpf-display">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">Gender</label>
                  {isEditing
                    ? (
                      <select className="cpf-input" value={tempProfile.gender || 'Prefer not to say'} onChange={e => handleInputChange('gender', e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    )
                    : <div className="cpf-display">{profile.gender || 'Prefer not to say'}</div>
                  }
                </div>

                <div className="cpf-form-group cpf-form-group-full">
                  <label className="cpf-label">Street Address</label>
                  {isEditing
                    ? <input className="cpf-input" type="text" value={tempProfile.address?.street || ''} onChange={e => handleAddressChange('street', e.target.value)} />
                    : <div className="cpf-display">{profile.address?.street || 'Not provided'}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">City</label>
                  {isEditing
                    ? <input className="cpf-input" type="text" value={tempProfile.address?.city || ''} onChange={e => handleAddressChange('city', e.target.value)} />
                    : <div className="cpf-display">{profile.address?.city || 'Not provided'}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">State</label>
                  {isEditing
                    ? <input className="cpf-input" type="text" value={tempProfile.address?.state || ''} onChange={e => handleAddressChange('state', e.target.value)} />
                    : <div className="cpf-display">{profile.address?.state || 'Not provided'}</div>
                  }
                </div>

                <div className="cpf-form-group">
                  <label className="cpf-label">ZIP Code</label>
                  {isEditing
                    ? <input className="cpf-input" type="text" value={tempProfile.address?.zipCode || ''} onChange={e => handleAddressChange('zipCode', e.target.value)} />
                    : <div className="cpf-display">{profile.address?.zipCode || 'Not provided'}</div>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── Preferences ── */}
          {activeTab === 'preferences' && (
            <div className="cpf-card cpf-card-sky">
              <div className="cpf-card-head">
                <div>
                  <h3 className="cpf-card-title">Notification Preferences</h3>
                  <p className="cpf-card-sub">Choose how you want to receive updates</p>
                </div>
              </div>
              <div className="cpf-pref-list">
                {[
                  { key: 'notifications',    title: 'Push Notifications', desc: 'Receive notifications about order updates' },
                  { key: 'emailUpdates',     title: 'Email Updates',      desc: 'Get order confirmations and status updates via email' },
                  { key: 'smsAlerts',        title: 'SMS Alerts',         desc: 'Receive text messages for urgent updates' },
                  { key: 'promotionalEmails',title: 'Promotional Emails', desc: 'Receive offers and promotions from WashX' },
                ].map(pref => (
                  <div key={pref.key} className="cpf-pref-item">
                    <div className="cpf-pref-info">
                      <h4 className="cpf-pref-title">{pref.title}</h4>
                      <p className="cpf-pref-desc">{pref.desc}</p>
                    </div>
                    <label className="cpf-toggle">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.[pref.key] || false}
                        onChange={() => handlePreferenceChange(pref.key)}
                      />
                      <span className="cpf-toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="cpf-card cpf-card-amber">
              <div className="cpf-card-head">
                <div>
                  <h3 className="cpf-card-title">Security Settings</h3>
                  <p className="cpf-card-sub">Manage your account security</p>
                </div>
              </div>

              {profile?.googleId ? (
                <div className="cpf-security-info">
                  <p>⚠️ You signed in with Google. Password change is not available for Google accounts.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="cpf-pwd-form">
                  {[
                    { key: 'currentPassword', label: 'Current Password',     vis: 'current',  ph: 'Enter current password'                  },
                    { key: 'newPassword',      label: 'New Password',         vis: 'new',      ph: 'Enter new password (min 6 characters)'   },
                    { key: 'confirmPassword',  label: 'Confirm New Password', vis: 'confirm',  ph: 'Confirm new password'                    },
                  ].map(f => (
                    <div key={f.key} className="cpf-form-group">
                      <label className="cpf-label">{f.label}</label>
                      <div className="cpf-pwd-wrap">
                        <input
                          type={showPassword[f.vis] ? 'text' : 'password'}
                          value={passwordData[f.key]}
                          onChange={e => setPasswordData(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="cpf-input"
                          required
                          minLength={f.key !== 'currentPassword' ? 6 : undefined}
                          placeholder={f.ph}
                        />
                        <button
                          type="button"
                          className="cpf-pwd-eye"
                          onClick={() => setShowPassword(prev => ({ ...prev, [f.vis]: !prev[f.vis] }))}
                        >
                          {showPassword[f.vis] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="cpf-btn-primary">Change Password</button>
                </form>
              )}
            </div>
          )}

          {/* ── Payment Methods ── */}
          {activeTab === 'payment' && (
            <div className="cpf-card cpf-card-green">
              <div className="cpf-card-head">
                <div>
                  <h3 className="cpf-card-title">Payment Methods</h3>
                  <p className="cpf-card-sub">Manage your payment options</p>
                </div>
              </div>

              <div className="cpf-payments">
                {profile.paymentMethods && profile.paymentMethods.length > 0
                  ? profile.paymentMethods.map((method, index) => (
                    <div key={method._id || index} className="cpf-payment-item">
                      <div className="cpf-payment-info">
                        <div className="cpf-payment-icon"><CreditCard size={22} /></div>
                        <div>
                          <h4 className="cpf-payment-name">{method.cardType} ending in {method.last4}</h4>
                          <p className="cpf-payment-exp">Expires {method.expiryDate}</p>
                        </div>
                      </div>
                      <div className="cpf-payment-actions">
                        {method.isDefault
                          ? <span className="cpf-payment-default">Default</span>
                          : <button className="cpf-payment-setdefault" onClick={() => handleSetDefaultPaymentMethod(method._id)}>Set as Default</button>
                        }
                        <button className="cpf-payment-remove" onClick={() => handleRemovePaymentMethod(method._id, method.isDefault)}>Remove</button>
                      </div>
                    </div>
                  ))
                  : (
                    <div className="cpf-no-payments">
                      <CreditCard size={40} />
                      <p>No payment methods added yet</p>
                    </div>
                  )
                }

                <button className="cpf-add-payment" onClick={() => setShowPaymentModal(true)}>
                  <Plus size={18} /> Add New Payment Method
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal && (
        <div className="cpf-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="cpf-modal" onClick={e => e.stopPropagation()}>
            <div className="cpf-modal-head">
              <h3 className="cpf-modal-title">Add Payment Method</h3>
              <button className="cpf-modal-close" onClick={() => setShowPaymentModal(false)}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddPaymentMethod} className="cpf-payment-form">
              <div className="cpf-form-group">
                <label className="cpf-label">Card Type</label>
                <select className="cpf-input" value={paymentForm.cardType} onChange={e => setPaymentForm(prev => ({ ...prev, cardType: e.target.value }))} required>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
              </div>

              <div className="cpf-form-group">
                <label className="cpf-label">Card Number</label>
                <input
                  type="text"
                  className="cpf-input"
                  value={paymentForm.cardNumber}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setPaymentForm(prev => ({ ...prev, cardNumber: v.match(/.{1,4}/g)?.join(' ') || v }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="cpf-payment-form-row">
                <div className="cpf-form-group">
                  <label className="cpf-label">Expiry Date</label>
                  <input
                    type="text"
                    className="cpf-input"
                    value={paymentForm.expiryDate}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, '');
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                      setPaymentForm(prev => ({ ...prev, expiryDate: v }));
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="cpf-form-group">
                  <label className="cpf-label">CVV</label>
                  <input
                    type="text"
                    className="cpf-input"
                    value={paymentForm.cvv}
                    onChange={e => setPaymentForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="cpf-form-group">
                <label className="cpf-checkbox-lbl">
                  <input
                    type="checkbox"
                    checked={paymentForm.isDefault}
                    onChange={e => setPaymentForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <span>Set as default payment method</span>
                </label>
              </div>

              <div className="cpf-modal-actions">
                <button type="button" className="cpf-modal-cancel" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="cpf-modal-submit">Add Payment Method</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerProfile;
