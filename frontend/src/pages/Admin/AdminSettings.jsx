import React, { useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { Settings, User, Shield, Bell, Database, Mail, Globe, Lock } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'WashX',
    siteDescription: 'Premium Laundry & Dry Cleaning Services',
    contactEmail: 'admin@washx.com',
    supportPhone: '+1-800-WASHX-01',
    currency: 'USD',
    timezone: 'America/New_York',
    emailNotifications: true,
    smsNotifications: false,
    autoApproveProviders: false,
    maintenanceMode: false,
    maxOrdersPerDay: 100,
    commissionRate: 15
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="setting-section">
      <div className="section-header">
        <h3>
          <Icon size={20} />
          {title}
        </h3>
      </div>
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div className="input-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }) => (
    <div className="input-field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ToggleField = ({ label, value, onChange, description }) => (
    <div className="toggle-field">
      <div className="toggle-info">
        <label>{label}</label>
        {description && <span className="description">{description}</span>}
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );

  return (
    <div className="admin-settings">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="page-header">
          <h1>System Settings</h1>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>

        <div className="settings-grid">
          <SettingSection title="General Settings" icon={Settings}>
            <InputField
              label="Site Name"
              value={settings.siteName}
              onChange={(value) => handleInputChange('siteName', value)}
              placeholder="Enter site name"
            />
            <InputField
              label="Site Description"
              value={settings.siteDescription}
              onChange={(value) => handleInputChange('siteDescription', value)}
              placeholder="Enter site description"
            />
            <SelectField
              label="Currency"
              value={settings.currency}
              onChange={(value) => handleInputChange('currency', value)}
              options={[
                { value: 'USD', label: 'US Dollar (USD)' },
                { value: 'EUR', label: 'Euro (EUR)' },
                { value: 'GBP', label: 'British Pound (GBP)' }
              ]}
            />
            <SelectField
              label="Timezone"
              value={settings.timezone}
              onChange={(value) => handleInputChange('timezone', value)}
              options={[
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Chicago', label: 'Central Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'UTC', label: 'UTC' }
              ]}
            />
          </SettingSection>

          <SettingSection title="Contact Information" icon={Mail}>
            <InputField
              label="Contact Email"
              value={settings.contactEmail}
              onChange={(value) => handleInputChange('contactEmail', value)}
              type="email"
              placeholder="admin@example.com"
            />
            <InputField
              label="Support Phone"
              value={settings.supportPhone}
              onChange={(value) => handleInputChange('supportPhone', value)}
              type="tel"
              placeholder="+1-800-000-0000"
            />
          </SettingSection>

          <SettingSection title="Business Settings" icon={Globe}>
            <InputField
              label="Commission Rate (%)"
              value={settings.commissionRate}
              onChange={(value) => handleInputChange('commissionRate', parseInt(value))}
              type="number"
              placeholder="15"
            />
            <InputField
              label="Max Orders Per Day"
              value={settings.maxOrdersPerDay}
              onChange={(value) => handleInputChange('maxOrdersPerDay', parseInt(value))}
              type="number"
              placeholder="100"
            />
            <ToggleField
              label="Auto Approve Providers"
              value={settings.autoApproveProviders}
              onChange={(value) => handleInputChange('autoApproveProviders', value)}
              description="Automatically approve new provider applications"
            />
          </SettingSection>

          <SettingSection title="Notifications" icon={Bell}>
            <ToggleField
              label="Email Notifications"
              value={settings.emailNotifications}
              onChange={(value) => handleInputChange('emailNotifications', value)}
              description="Receive email notifications for important events"
            />
            <ToggleField
              label="SMS Notifications"
              value={settings.smsNotifications}
              onChange={(value) => handleInputChange('smsNotifications', value)}
              description="Receive SMS notifications for urgent matters"
            />
          </SettingSection>

          <SettingSection title="Security & Maintenance" icon={Lock}>
            <ToggleField
              label="Maintenance Mode"
              value={settings.maintenanceMode}
              onChange={(value) => handleInputChange('maintenanceMode', value)}
              description="Put the site in maintenance mode (users can't access)"
            />
            <div className="security-actions">
              <button className="security-btn">
                <Database size={16} />
                Backup Database
              </button>
              <button className="security-btn">
                <Shield size={16} />
                View Security Logs
              </button>
            </div>
          </SettingSection>

          <SettingSection title="User Management" icon={User}>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">1,234</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Providers</span>
                <span className="stat-value">56</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Approvals</span>
                <span className="stat-value">8</span>
              </div>
            </div>
            <div className="user-actions">
              <button className="action-btn">Export User Data</button>
              <button className="action-btn">Send Bulk Email</button>
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;