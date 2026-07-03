import { useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import {
  Settings, User, Shield, Bell, Database,
  Mail, Globe, Lock, Save, CheckCircle
} from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName:             'WashX',
    siteDescription:      'Premium Laundry & Dry Cleaning Services',
    contactEmail:         'admin@washx.com',
    supportPhone:         '+94-11-234-5678',
    currency:             'LKR',
    timezone:             'Asia/Colombo',
    emailNotifications:   true,
    smsNotifications:     false,
    autoApproveProviders: false,
    maintenanceMode:      false,
    maxOrdersPerDay:      100,
    commissionRate:       15,
  });

  const [saved, setSaved] = useState(false);

  const set = (field, value) =>
    setSettings(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  /* ── Sub-components ── */
  const Field = ({ label, children }) => (
    <div className="ast-field">
      <label className="ast-label">{label}</label>
      {children}
    </div>
  );

  const Input = ({ label, value, onChange, type = 'text', placeholder }) => (
    <Field label={label}>
      <input
        className="ast-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );

  const Select = ({ label, value, onChange, options }) => (
    <Field label={label}>
      <select className="ast-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );

  const Toggle = ({ label, description, value, onChange }) => (
    <div className={`ast-toggle-row ${value ? 'ast-toggle-on' : ''}`}>
      <div className="ast-toggle-text">
        <span className="ast-toggle-label">{label}</span>
        {description && <span className="ast-toggle-desc">{description}</span>}
      </div>
      <label className="ast-switch">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
        <span className="ast-thumb" />
      </label>
    </div>
  );

  const Section = ({ title, icon: Icon, accent, children }) => (
    <div className="ast-section" style={{ borderTopColor: accent }}>
      <div className="ast-section-head">
        <div className="ast-section-icon" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={18} />
        </div>
        <h3 className="ast-section-title">{title}</h3>
      </div>
      <div className="ast-section-body">{children}</div>
    </div>
  );

  return (
    <div className="ast-page">
      <AdminNavbar />

      <div className="ast-content">
        {/* Header */}
        <div className="ast-header">
          <div>
            <h1 className="ast-title">System Settings</h1>
            <p className="ast-sub">Configure your WashX platform preferences</p>
          </div>
          <button className={`ast-save-btn ${saved ? 'ast-save-ok' : ''}`} onClick={handleSave}>
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

        {/* Toast */}
        {saved && (
          <div className="ast-toast">
            <CheckCircle size={16} />
            Settings saved successfully!
          </div>
        )}

        <div className="ast-grid">

          {/* General Settings */}
          <Section title="General Settings" icon={Settings} accent="#1d4ed8">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={v => set('siteName', v)}
              placeholder="Enter site name"
            />
            <Input
              label="Site Description"
              value={settings.siteDescription}
              onChange={v => set('siteDescription', v)}
              placeholder="Enter site description"
            />
            <Select
              label="Currency"
              value={settings.currency}
              onChange={v => set('currency', v)}
              options={[
                { value: 'LKR', label: 'Sri Lankan Rupee (LKR)' },
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' },
              ]}
            />
            <Select
              label="Timezone"
              value={settings.timezone}
              onChange={v => set('timezone', v)}
              options={[
                { value: 'Asia/Colombo',       label: 'Sri Lanka Time (UTC+5:30)' },
                { value: 'America/New_York',   label: 'Eastern Time (UTC-5)' },
                { value: 'America/Chicago',    label: 'Central Time (UTC-6)' },
                { value: 'America/Los_Angeles',label: 'Pacific Time (UTC-8)' },
                { value: 'UTC',                label: 'UTC' },
              ]}
            />
          </Section>

          {/* Contact Information */}
          <Section title="Contact Information" icon={Mail} accent="#0284c7">
            <Input
              label="Contact Email"
              value={settings.contactEmail}
              onChange={v => set('contactEmail', v)}
              type="email"
              placeholder="admin@example.com"
            />
            <Input
              label="Support Phone"
              value={settings.supportPhone}
              onChange={v => set('supportPhone', v)}
              type="tel"
              placeholder="+94-11-234-5678"
            />
            <div className="ast-info-box">
              <Mail size={14} />
              <span>These details appear on customer-facing pages and emails.</span>
            </div>
          </Section>

          {/* Business Settings */}
          <Section title="Business Settings" icon={Globe} accent="#0369a1">
            <Input
              label="Commission Rate (%)"
              value={settings.commissionRate}
              onChange={v => set('commissionRate', parseInt(v) || 0)}
              type="number"
              placeholder="15"
            />
            <Input
              label="Max Orders Per Day"
              value={settings.maxOrdersPerDay}
              onChange={v => set('maxOrdersPerDay', parseInt(v) || 0)}
              type="number"
              placeholder="100"
            />
            <Toggle
              label="Auto Approve Providers"
              description="Automatically approve new provider applications without manual review"
              value={settings.autoApproveProviders}
              onChange={v => set('autoApproveProviders', v)}
            />
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={Bell} accent="#d97706">
            <Toggle
              label="Email Notifications"
              description="Receive email alerts for new orders, registrations and issues"
              value={settings.emailNotifications}
              onChange={v => set('emailNotifications', v)}
            />
            <Toggle
              label="SMS Notifications"
              description="Receive SMS alerts for urgent platform events"
              value={settings.smsNotifications}
              onChange={v => set('smsNotifications', v)}
            />
          </Section>

          {/* Security & Maintenance */}
          <Section title="Security & Maintenance" icon={Lock} accent="#dc2626">
            <Toggle
              label="Maintenance Mode"
              description="Disable public access while you perform maintenance tasks"
              value={settings.maintenanceMode}
              onChange={v => set('maintenanceMode', v)}
            />
            {settings.maintenanceMode && (
              <div className="ast-warn-box">
                <Shield size={14} />
                <span>Maintenance mode is ON — the site is not accessible to regular users.</span>
              </div>
            )}
            <div className="ast-action-row">
              <button className="ast-action-btn">
                <Database size={15} />
                Backup Database
              </button>
              <button className="ast-action-btn">
                <Shield size={15} />
                Security Logs
              </button>
            </div>
          </Section>

          {/* User Management */}
          <Section title="User Management" icon={User} accent="#059669">
            <div className="ast-mini-stats">
              <div className="ast-mini-stat ast-ms-blue">
                <span className="ast-ms-num">19</span>
                <span className="ast-ms-lbl">Total Users</span>
              </div>
              <div className="ast-mini-stat ast-ms-sky">
                <span className="ast-ms-num">6</span>
                <span className="ast-ms-lbl">Providers</span>
              </div>
              <div className="ast-mini-stat ast-ms-amber">
                <span className="ast-ms-num">5</span>
                <span className="ast-ms-lbl">Pending</span>
              </div>
            </div>
            <div className="ast-action-row">
              <button className="ast-action-btn">
                <Database size={15} />
                Export User Data
              </button>
              <button className="ast-action-btn">
                <Mail size={15} />
                Send Bulk Email
              </button>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
