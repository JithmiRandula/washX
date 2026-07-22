import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, Camera, Edit2, Save, X, Clock, Phone, Mail,
  Star, Building2, FileText, ShieldCheck, AlertCircle, RefreshCw, Truck
} from 'lucide-react';
import './ProviderProfile.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = {
  monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday',
  thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday'
};

const DEFAULT_HOURS = { open: '09:00', close: '18:00', closed: false };

const DEFAULT_BUSINESS_HOURS = {
  monday:    { open: '09:00', close: '18:00', closed: false },
  tuesday:   { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday:  { open: '09:00', close: '18:00', closed: false },
  friday:    { open: '09:00', close: '18:00', closed: false },
  saturday:  { open: '09:00', close: '18:00', closed: false },
  sunday:    { open: '',      close: '',       closed: true  },
};

// Backend stores operating hours as a JSON string: { monday: { open, close, isClosed }, ... }
const parseOperatingHours = (raw) => {
  if (!raw) return DEFAULT_BUSINESS_HOURS;
  try {
    const parsed = JSON.parse(raw);
    return Object.fromEntries(
      DAYS.map((day) => {
        const h = parsed[day];
        return [day, h ? { open: h.open || '', close: h.close || '', closed: Boolean(h.isClosed) } : DEFAULT_BUSINESS_HOURS[day]];
      })
    );
  } catch {
    return DEFAULT_BUSINESS_HOURS;
  }
};

const ProviderProfile = () => {
  const { providerId } = useParams();
  const { user }       = useAuth();

  const [profile,     setProfile]     = useState(null);
  const [tempProfile, setTempProfile] = useState(null);
  const [isEditing,   setIsEditing]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [toast,       setToast]       = useState(null);
  const fileInputRef = useRef(null);

  const [delivery,        setDelivery]        = useState({ offersDelivery: false, deliveryFee: 0 });
  const [deliveryDraft,   setDeliveryDraft]   = useState({ offersDelivery: false, deliveryFee: 0 });
  const [deliveryEditing, setDeliveryEditing] = useState(false);
  const [deliverySaving,  setDeliverySaving]  = useState(false);

  useEffect(() => { if (providerId) fetchProfile(); }, [providerId]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfile = async () => {
    if (!providerId) { setError('Provider ID missing.'); setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/providers/${providerId}`);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        const formatted = {
          businessName:    d.businessName || '',
          ownerName:       d.name || user?.name || '',
          email:           d.email || user?.email || '',
          phone:           d.phone || '',
          address:         d.businessAddress || '',
          city:            d.city || '',
          zipCode:         d.zipCode || '',
          state:           d.state || '',
          latitude:        Number(d.latitude ?? 0),
          longitude:       Number(d.longitude ?? 0),
          description:     d.description || '',
          businessLicense: d.businessLicense || '',
          services:        d.services || [],
          rating:          Number(d.rating ?? 0),
          totalReviews:    d.totalReviews || 0,
          logoUrl:         d.images?.length ? d.images[0] : null,
          businessHours: parseOperatingHours(d.operatingHours),
        };
        setProfile(formatted);
        setTempProfile(formatted);

        const deliveryInfo = {
          offersDelivery: Boolean(d.offersDelivery),
          deliveryFee: Number(d.deliveryFee ?? 0)
        };
        setDelivery(deliveryInfo);
        setDeliveryDraft(deliveryInfo);
      } else {
        setError('Failed to load profile data.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit   = () => { setTempProfile(profile); setIsEditing(true); };
  const handleCancel = () => { setTempProfile(profile); setIsEditing(false); };

  const handleInputChange = (field, value) =>
    setTempProfile(p => ({ ...p, [field]: value }));

  const handleHoursChange = (day, field, value) => {
    setTempProfile(p => {
      const updated = { ...p.businessHours[day], [field]: value };
      if (field === 'closed' && value)  { updated.open = ''; updated.close = ''; }
      if (field === 'closed' && !value) {
        if (!updated.open)  updated.open  = '09:00';
        if (!updated.close) updated.close = '18:00';
      }
      return { ...p, businessHours: { ...p.businessHours, [day]: updated } };
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const required = {
        'Business Name':  tempProfile.businessName,
        'Owner Name':     tempProfile.ownerName,
        'Description':    tempProfile.description,
        'Street Address': tempProfile.address,
        'Phone':          tempProfile.phone,
      };
      const missing = Object.entries(required)
        .filter(([, v]) => !v?.trim())
        .map(([k]) => k);
      if (missing.length) {
        showToast(`Please fill: ${missing.join(', ')}`, 'error');
        setSaveLoading(false);
        return;
      }

      const payload = {
        businessName:    tempProfile.businessName,
        ownerName:       tempProfile.ownerName,
        description:     tempProfile.description,
        businessLicense: tempProfile.businessLicense,
        address: {
          street:  tempProfile.address,
          city:    tempProfile.city,
          state:   tempProfile.state,
          zipCode: tempProfile.zipCode,
          coordinates: { lat: tempProfile.latitude, lng: tempProfile.longitude },
        },
        phone: tempProfile.phone,
        operatingHours: Object.fromEntries(
          DAYS.map(day => {
            const h = tempProfile.businessHours[day];
            return [day, { open: h.closed ? '' : h.open, close: h.closed ? '' : h.close, isClosed: h.closed }];
          })
        ),
      };

      const res = await api.put(`/providers/${providerId}/profile`, payload);
      if (res.data.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        showToast('Profile saved successfully!');
        await fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving profile.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeliveryEdit   = () => { setDeliveryDraft(delivery); setDeliveryEditing(true); };
  const handleDeliveryCancel = () => { setDeliveryDraft(delivery); setDeliveryEditing(false); };

  const handleDeliverySave = async () => {
    setDeliverySaving(true);
    try {
      const payload = {
        offersDelivery: Boolean(deliveryDraft.offersDelivery),
        deliveryFee: Number(deliveryDraft.deliveryFee) || 0
      };
      const res = await api.put(`/providers/${providerId}/delivery-settings`, payload);
      if (res.data.success) {
        setDelivery(payload);
        setDeliveryDraft(payload);
        setDeliveryEditing(false);
        showToast('Delivery settings saved!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving delivery settings.', 'error');
    } finally {
      setDeliverySaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { showToast('File must be under 5 MB.', 'error'); return; }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post(`/providers/${providerId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const url = res.data.data;
        setProfile(p  => ({ ...p,  logoUrl: url }));
        setTempProfile(p => ({ ...p, logoUrl: url }));
        showToast('Logo updated!');
        await fetchProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  /* ─── Loading / Error ─── */
  if (loading || !profile) {
    return (
      <div className="ppf-page">
        <div className="ppf-content ppf-center">
          {loading ? (
            <>
              <div className="ppf-spinner" />
              <p className="ppf-loading-text">Loading profile…</p>
            </>
          ) : error ? (
            <div className="ppf-error-box">
              <AlertCircle size={40} style={{ color: '#dc2626' }} />
              <h3>Could not load profile</h3>
              <p>{error}</p>
              <button className="ppf-btn-primary" onClick={fetchProfile}>
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : (
            <div className="ppf-error-box">
              <p>No profile data found.</p>
              <button className="ppf-btn-primary" onClick={fetchProfile}>Reload</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ppf-page">

      {/* Toast */}
      {toast && (
        <div className={`ppf-toast ppf-toast-${toast.type}`}>
          {toast.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="ppf-content">

        {/* ── Page Header ── */}
        <div className="ppf-header">
          <div className="ppf-header-left">
            <h1 className="ppf-title">Business Profile</h1>
            <p className="ppf-sub">Manage your business information and location</p>
          </div>
          <div className="ppf-header-actions">
            {isEditing ? (
              <>
                <button className="ppf-btn-ghost" onClick={handleCancel} disabled={saveLoading}>
                  <X size={16} /> Cancel
                </button>
                <button className="ppf-btn-primary" onClick={handleSave} disabled={saveLoading}>
                  <Save size={16} />
                  {saveLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button className="ppf-btn-primary" onClick={handleEdit}>
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ── Business Info Card ── */}
        <div className="ppf-card ppf-card-blue">
          <div className="ppf-card-head">
            <div className="ppf-card-head-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Building2 size={18} />
            </div>
            <h2 className="ppf-section-title">Business Information</h2>
          </div>

          {/* Logo + Business Name row */}
          <div className="ppf-biz-top">
            {/* Logo */}
            <div className="ppf-logo-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {uploading ? (
                <div className="ppf-logo-box ppf-logo-uploading">
                  <div className="ppf-spinner ppf-spinner-sm" />
                  <span>Uploading…</span>
                </div>
              ) : profile.logoUrl ? (
                <div className="ppf-logo-box ppf-logo-img-wrap" onClick={() => fileInputRef.current?.click()}>
                  <img src={profile.logoUrl} alt="Business logo" className="ppf-logo-img" />
                  <div className="ppf-logo-overlay">
                    <Camera size={22} />
                    <span>Change</span>
                  </div>
                </div>
              ) : (
                <div className="ppf-logo-box ppf-logo-empty" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={30} />
                  <span>Upload Logo</span>
                </div>
              )}
              <p className="ppf-logo-hint">JPG / PNG · max 5 MB</p>
            </div>

            {/* Business name + rating */}
            <div className="ppf-biz-details">
              {isEditing ? (
                <div className="ppf-field">
                  <label className="ppf-label">Business Name</label>
                  <input
                    className="ppf-input"
                    type="text"
                    value={tempProfile.businessName}
                    onChange={e => handleInputChange('businessName', e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
              ) : (
                <>
                  <h3 className="ppf-biz-name">{profile.businessName || '—'}</h3>
                  <div className="ppf-rating">
                    {[1,2,3,4,5].map(n => (
                      <Star
                        key={n}
                        size={16}
                        fill={n <= Math.round(profile.rating) ? '#f59e0b' : 'none'}
                        color={n <= Math.round(profile.rating) ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                    <span className="ppf-rating-num">{Number(profile.rating).toFixed(1)}</span>
                    <span className="ppf-rating-cnt">({profile.totalReviews} reviews)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="ppf-info-grid">
            {/* Owner Name */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">Owner Name</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.ownerName}
                  onChange={e => handleInputChange('ownerName', e.target.value)} />
              ) : (
                <div className="ppf-info-val">{profile.ownerName || '—'}</div>
              )}
            </div>

            {/* Email — login identifier, not editable here */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">Email</label>
              <div className="ppf-info-val ppf-info-icon-val">
                <Mail size={15} className="ppf-field-icon" /> {profile.email || '—'}
              </div>
              {isEditing && <small className="ppf-note">Email cannot be changed</small>}
            </div>

            {/* Phone */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">Phone</label>
              {isEditing ? (
                <input className="ppf-input" type="tel" value={tempProfile.phone}
                  onChange={e => handleInputChange('phone', e.target.value)} />
              ) : (
                <div className="ppf-info-val ppf-info-icon-val">
                  <Phone size={15} className="ppf-field-icon" /> {profile.phone || '—'}
                </div>
              )}
            </div>

            {/* Business License */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">Business License</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.businessLicense}
                  onChange={e => handleInputChange('businessLicense', e.target.value)}
                  placeholder="License number" />
              ) : (
                profile.businessLicense
                  ? <span className="ppf-license-badge">{profile.businessLicense}</span>
                  : <div className="ppf-info-val ppf-muted">Not provided</div>
              )}
            </div>

            {/* Description — full width */}
            <div className="ppf-info-item ppf-full">
              <label className="ppf-info-label">Business Description</label>
              {isEditing ? (
                <textarea className="ppf-textarea" rows={3}
                  value={tempProfile.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business…" />
              ) : (
                <div className="ppf-description">{profile.description || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Location Card ── */}
        <div className="ppf-card ppf-card-sky">
          <div className="ppf-card-head">
            <div className="ppf-card-head-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <MapPin size={18} />
            </div>
            <h2 className="ppf-section-title">Location & Address</h2>
          </div>

          <div className="ppf-info-grid">
            {/* Street — full width */}
            <div className="ppf-info-item ppf-full">
              <label className="ppf-info-label">Street Address</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.address}
                  onChange={e => handleInputChange('address', e.target.value)} />
              ) : (
                <div className="ppf-info-val ppf-info-icon-val">
                  <MapPin size={15} className="ppf-field-icon" /> {profile.address || '—'}
                </div>
              )}
            </div>

            {/* City */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">City</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.city}
                  onChange={e => handleInputChange('city', e.target.value)} />
              ) : (
                <div className="ppf-info-val">{profile.city || '—'}</div>
              )}
            </div>

            {/* State */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">State / Province</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  placeholder="e.g. Western" />
              ) : (
                <div className="ppf-info-val">{profile.state || '—'}</div>
              )}
            </div>

            {/* ZIP */}
            <div className="ppf-info-item">
              <label className="ppf-info-label">ZIP / Postal Code</label>
              {isEditing ? (
                <input className="ppf-input" type="text" value={tempProfile.zipCode}
                  onChange={e => handleInputChange('zipCode', e.target.value)} />
              ) : (
                <div className="ppf-info-val">{profile.zipCode || '—'}</div>
              )}
            </div>
          </div>

          {/* Map placeholder */}
          <div className="ppf-map">
            <MapPin size={40} style={{ color: '#0284c7' }} />
            <p className="ppf-map-addr">
              {[profile.address, profile.city, profile.zipCode].filter(Boolean).join(', ') || 'No address set'}
            </p>
            <button className="ppf-map-btn">
              <MapPin size={14} /> View on Map
            </button>
          </div>
        </div>

        {/* ── Business Hours Card ── */}
        <div className="ppf-card ppf-card-indigo">
          <div className="ppf-card-head">
            <div className="ppf-card-head-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Clock size={18} />
            </div>
            <h2 className="ppf-section-title">Business Hours</h2>
          </div>

          <div className="ppf-hours-grid">
            {DAYS.map(day => {
              const h  = profile.businessHours?.[day]     || DEFAULT_HOURS;
              const th = tempProfile.businessHours?.[day] || DEFAULT_HOURS;
              return (
                <div key={day} className={`ppf-hour-row${h.closed && !isEditing ? ' ppf-hr-closed' : ''}`}>
                  <div className="ppf-day-label">
                    <span className="ppf-day-name">{DAY_LABELS[day]}</span>
                  </div>

                  {isEditing ? (
                    <div className="ppf-hour-edit">
                      <label className="ppf-closed-toggle">
                        <input
                          type="checkbox"
                          checked={th.closed}
                          onChange={e => handleHoursChange(day, 'closed', e.target.checked)}
                        />
                        <span>Closed</span>
                      </label>
                      {!th.closed && (
                        <div className="ppf-time-row">
                          <input className="ppf-time-input" type="time" value={th.open}
                            onChange={e => handleHoursChange(day, 'open', e.target.value)} />
                          <span className="ppf-time-sep">to</span>
                          <input className="ppf-time-input" type="time" value={th.close}
                            onChange={e => handleHoursChange(day, 'close', e.target.value)} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ppf-hour-display">
                      {h.closed
                        ? <span className="ppf-closed-tag">Closed</span>
                        : <span className="ppf-open-time">{h.open} – {h.close}</span>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery Settings Card ── */}
        <div className="ppf-card ppf-card-amber">
          <div className="ppf-card-head">
            <div className="ppf-card-head-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Truck size={18} />
            </div>
            <h2 className="ppf-section-title" style={{ flex: 1 }}>Delivery Settings</h2>
            {!deliveryEditing && (
              <button className="ppf-btn-ghost" onClick={handleDeliveryEdit}>
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>

          <p className="ppf-delivery-hint">
            Offer your own pickup &amp; delivery so customers don't have to drop off or collect their laundry themselves.
          </p>

          <div className="ppf-info-grid">
            <div className="ppf-info-item">
              <label className="ppf-info-label">Pickup &amp; Delivery</label>
              {deliveryEditing ? (
                <label className="ppf-delivery-toggle">
                  <input
                    type="checkbox"
                    checked={deliveryDraft.offersDelivery}
                    onChange={e => setDeliveryDraft(d => ({ ...d, offersDelivery: e.target.checked }))}
                  />
                  <span>{deliveryDraft.offersDelivery ? 'Offered' : 'Not offered'}</span>
                </label>
              ) : (
                <div className={`ppf-info-val${delivery.offersDelivery ? ' ppf-delivery-on' : ' ppf-muted'}`}>
                  {delivery.offersDelivery ? 'Offered to customers' : 'Not offered'}
                </div>
              )}
            </div>

            <div className="ppf-info-item">
              <label className="ppf-info-label">Delivery Fee (Rs)</label>
              {deliveryEditing ? (
                <input
                  className="ppf-input"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!deliveryDraft.offersDelivery}
                  value={deliveryDraft.deliveryFee}
                  onChange={e => setDeliveryDraft(d => ({ ...d, deliveryFee: e.target.value }))}
                />
              ) : (
                <div className="ppf-info-val">
                  {delivery.offersDelivery ? `Rs ${Number(delivery.deliveryFee).toFixed(2)}` : '—'}
                </div>
              )}
            </div>
          </div>

          {deliveryEditing && (
            <div className="ppf-delivery-actions">
              <button className="ppf-btn-ghost" onClick={handleDeliveryCancel} disabled={deliverySaving}>
                <X size={16} /> Cancel
              </button>
              <button className="ppf-btn-primary" onClick={handleDeliverySave} disabled={deliverySaving}>
                <Save size={16} /> {deliverySaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* ── Services Card ── */}
        <div className="ppf-card ppf-card-green">
          <div className="ppf-card-head">
            <div className="ppf-card-head-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <FileText size={18} />
            </div>
            <h2 className="ppf-section-title">Services Offered</h2>
          </div>

          <div className="ppf-services">
            {profile.services?.length ? (
              profile.services.map((s, i) => (
                <span key={i} className="ppf-service-chip">
                  {typeof s === 'string' ? s : s.name || 'Service'}
                </span>
              ))
            ) : (
              <p className="ppf-muted ppf-italic">No services listed yet. Add services from the Services page.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProviderProfile;
