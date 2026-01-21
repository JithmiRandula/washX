import { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';
import { Search, Filter, CheckCircle, XCircle, Eye, Building2, Star, Phone, Mail } from 'lucide-react';
import './AdminProviders.css';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Sample providers data
  useEffect(() => {
    const sampleProviders = [
      {
        id: '1',
        name: 'CleanWash Express',
        email: 'info@cleanwash.com',
        phone: '+1 234-567-8900',
        address: '123 Main St, Downtown',
        status: 'active',
        registrationDate: '2025-01-10',
        rating: 4.5,
        totalOrders: 156,
        revenue: 12450.00,
        services: ['Dry Cleaning', 'Wash & Fold', 'Express Service'],
        documents: {
          businessLicense: 'uploaded',
          insurance: 'uploaded',
          certification: 'pending'
        }
      },
      {
        id: '2',
        name: 'Premium Laundry Care',
        email: 'contact@premium.com',
        phone: '+1 234-567-8901',
        address: '456 Oak Ave, Midtown',
        status: 'pending',
        registrationDate: '2025-01-18',
        rating: 0,
        totalOrders: 0,
        revenue: 0,
        services: ['Premium Care', 'Steam Press', 'Alterations'],
        documents: {
          businessLicense: 'uploaded',
          insurance: 'pending',
          certification: 'uploaded'
        }
      },
      {
        id: '3',
        name: 'Express Wash Co.',
        email: 'hello@expresswash.com',
        phone: '+1 234-567-8902',
        address: '789 Pine St, Uptown',
        status: 'active',
        registrationDate: '2024-12-15',
        rating: 4.3,
        totalOrders: 89,
        revenue: 7890.50,
        services: ['Express Service', 'Ironing', 'Commercial Cleaning'],
        documents: {
          businessLicense: 'uploaded',
          insurance: 'uploaded',
          certification: 'uploaded'
        }
      },
      {
        id: '4',
        name: 'Fresh Laundry Co.',
        email: 'fresh@laundry.com',
        phone: '+1 234-567-8903',
        address: '321 Elm Dr, Suburbs',
        status: 'suspended',
        registrationDate: '2024-11-20',
        rating: 3.8,
        totalOrders: 45,
        revenue: 3200.75,
        services: ['Eco-Friendly Cleaning', 'Organic Care'],
        documents: {
          businessLicense: 'uploaded',
          insurance: 'expired',
          certification: 'uploaded'
        }
      },
      {
        id: '5',
        name: 'Quick Clean Services',
        email: 'info@quickclean.com',
        phone: '+1 234-567-8904',
        address: '654 Maple Ave, Downtown',
        status: 'pending',
        registrationDate: '2025-01-20',
        rating: 0,
        totalOrders: 0,
        revenue: 0,
        services: ['Quick Wash', 'Same Day Service'],
        documents: {
          businessLicense: 'pending',
          insurance: 'uploaded',
          certification: 'pending'
        }
      }
    ];
    
    setTimeout(() => {
      setProviders(sampleProviders);
      setFilteredProviders(sampleProviders);
      setLoading(false);
    }, 500);
  }, []);

  // Filter providers based on search and status
  useEffect(() => {
    let filtered = providers;

    if (searchTerm) {
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.phone.includes(searchTerm) ||
        provider.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(provider => provider.status === filterStatus);
    }

    setFilteredProviders(filtered);
  }, [providers, searchTerm, filterStatus]);

  const handleApproveProvider = (providerId) => {
    setProviders(providers.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: 'active' }
        : provider
    ));
  };

  const handleRejectProvider = (providerId) => {
    if (window.confirm('Are you sure you want to reject this provider?')) {
      setProviders(providers.filter(provider => provider.id !== providerId));
    }
  };

  const handleSuspendProvider = (providerId) => {
    setProviders(providers.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: provider.status === 'suspended' ? 'active' : 'suspended' }
        : provider
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Provider Management</h1>
            <p>Manage and approve service providers</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{providers.filter(p => p.status === 'active').length}</h3>
              <p>Active Providers</p>
            </div>
            <div className="stat-icon active">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{providers.filter(p => p.status === 'pending').length}</h3>
              <p>Pending Approval</p>
            </div>
            <div className="stat-icon warning">
              <Eye size={24} />
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>{providers.filter(p => p.status === 'suspended').length}</h3>
              <p>Suspended</p>
            </div>
            <div className="stat-icon danger">
              <XCircle size={24} />
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-content">
              <h3>${providers.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
            <div className="stat-icon total">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="admin-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search providers by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <Filter size={20} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Providers Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="loading-state">Loading providers...</div>
          ) : (
            <div className="providers-grid">
              {filteredProviders.map((provider) => (
                <div key={provider.id} className="provider-card">
                  <div className="provider-header">
                    <div className="provider-info">
                      <h3>{provider.name}</h3>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: `${getStatusColor(provider.status)}20`, color: getStatusColor(provider.status) }}
                      >
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </span>
                    </div>
                    {provider.rating > 0 && (
                      <div className="provider-rating">
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <span>{provider.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="provider-contact">
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>{provider.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{provider.phone}</span>
                    </div>
                  </div>

                  <div className="provider-stats">
                    <div className="stat-item">
                      <span className="stat-value">{provider.totalOrders}</span>
                      <span className="stat-label">Orders</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">${provider.revenue.toLocaleString()}</span>
                      <span className="stat-label">Revenue</span>
                    </div>
                  </div>

                  <div className="provider-actions">
                    {provider.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn approve"
                          onClick={() => handleApproveProvider(provider.id)}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => handleRejectProvider(provider.id)}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {provider.status === 'active' && (
                      <button 
                        className="action-btn suspend"
                        onClick={() => handleSuspendProvider(provider.id)}
                      >
                        <XCircle size={16} />
                        Suspend
                      </button>
                    )}
                    
                    {provider.status === 'suspended' && (
                      <button 
                        className="action-btn activate"
                        onClick={() => handleSuspendProvider(provider.id)}
                      >
                        <CheckCircle size={16} />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProviders.length === 0 && (
            <div className="empty-state">
              <Building2 size={48} />
              <h3>No providers found</h3>
              <p>No providers match your current search and filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProviders;