import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Clock, Tag, AlertCircle, Star, ChevronDown, List } from 'lucide-react';
import { serviceAPI } from '../../utils/api';
import './ProviderServices.css';

const ProviderServices = () => {
  const { providerId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    category: 'Washing',
    prices: [{ unit: 'per kg', price: '' }],
    duration: '',
    description: '',
    minOrder: '',
    features: '',
    specialInstructions: '',
    active: true
  });

  const categories = ['Washing', 'Dry Clean', 'Ironing', 'Premium'];
  const unitTypes = ['per kg', 'per piece', 'per item', 'per bundle', 'per set'];

  const categoryColors = {
    'Washing': { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
    'Dry Clean': { bg: '#f3e8ff', text: '#7e22ce', dot: '#a855f7' },
    'Ironing': { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
    'Premium': { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899' },
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceAPI.getMyServices();
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.value)
        ? result.value
        : Array.isArray(result?.data)
        ? result.data
        : [];

      const mapped = rows.map((s) => ({
        _id: String(s.serviceId),
        name: s.serviceName,
        category: s.category,
        prices: [{ unit: s.pricingType, price: s.price }],
        duration: s.turnaroundTime || '',
        description: s.description || '',
        minOrder: s.minimumOrder,
        features: s.keyFeatures || '',
        specialInstructions: s.specialInstructions || '',
        active: true
      }));
      setServices(mapped);
      setCurrentPage(1);
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const pagedServices = services.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...newService.prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setNewService({ ...newService, prices: updatedPrices });
  };

  const resetForm = () => {
    setNewService({
      name: '',
      category: 'Washing',
      prices: [{ unit: 'per kg', price: '' }],
      duration: '',
      description: '',
      minOrder: '',
      features: '',
      specialInstructions: '',
      active: true
    });
    setEditingService(null);
    setIsAddModalOpen(false);
  };

  const handleAddService = async () => {
    try {
      const primaryPrice = newService.prices?.[0];
      await serviceAPI.createService({
        serviceName: newService.name,
        category: newService.category,
        pricingType: primaryPrice?.unit ?? '',
        price: Number(primaryPrice?.price ?? 0),
        minimumOrder: Number(newService.minOrder ?? 0),
        turnaroundTime: newService.duration,
        description: newService.description,
        keyFeatures: newService.features,
        specialInstructions: newService.specialInstructions
      });
      await loadServices();
      resetForm();
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to create service');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({
      ...service,
      minOrder: service.minOrder || '',
      features: service.features || '',
      specialInstructions: service.specialInstructions || ''
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      const primaryPrice = newService.prices?.[0];
      await serviceAPI.updateService(editingService._id, {
        serviceName: newService.name,
        category: newService.category,
        pricingType: primaryPrice?.unit ?? '',
        price: Number(primaryPrice?.price ?? 0),
        minimumOrder: Number(newService.minOrder ?? 0),
        turnaroundTime: newService.duration,
        description: newService.description,
        keyFeatures: newService.features,
        specialInstructions: newService.specialInstructions
      });
      await loadServices();
      resetForm();
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to update service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceAPI.deleteService(id);
      setServices((prev) => {
        const next = prev.filter((s) => s._id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setCurrentPage((p) => Math.min(p, nextTotalPages));
        return next;
      });
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to delete service');
    }
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(s =>
      s._id === id ? { ...s, active: !s.active } : s
    ));
  };

  return (
    <div className="ps-root">
      <div className="ps-container">

        {/* Header */}
        <div className="ps-header">
          <div className="ps-header-left">
            <div className="ps-header-icon">
              <Package size={22} />
            </div>
            <div>
              <h1 className="ps-title">Manage Services</h1>
              <p className="ps-subtitle">Add and manage your laundry offerings</p>
            </div>
          </div>
          <button className="ps-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} />
            <span>Add Service</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="ps-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="ps-loading">
            <div className="ps-spinner"></div>
            <p>Loading your services…</p>
          </div>
        ) : services.length === 0 ? (
          <div className="ps-empty">
            <div className="ps-empty-icon"><Package size={40} /></div>
            <h3>No services yet</h3>
            <p>Get started by adding your first laundry service</p>
            <button className="ps-add-btn" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} /> Add Your First Service
            </button>
          </div>
        ) : (
          <>
            <div className="ps-grid">
              {pagedServices.map((service) => {
              const cat = categoryColors[service.category] || categoryColors['Washing'];
              return (
                <div key={service._id} className={`ps-card ${service.active ? '' : 'ps-card--inactive'}`}>

                  {/* Card Top Bar */}
                  <div className="ps-card-top">
                    <div className="ps-card-name-row">
                      <h3 className="ps-card-name">{service.name}</h3>
                      <span className={`ps-status-badge ${service.active ? 'ps-status-badge--active' : 'ps-status-badge--inactive'}`}>
                        <span className="ps-status-dot"></span>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="ps-card-actions">
                      <button className="ps-icon-btn ps-icon-btn--edit" onClick={() => handleEditService(service)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="ps-icon-btn ps-icon-btn--delete" onClick={() => handleDeleteService(service._id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Category Chip */}
                  <div className="ps-category-chip" style={{ background: cat.bg, color: cat.text }}>
                    <span className="ps-category-dot" style={{ background: cat.dot }}></span>
                    {service.category}
                  </div>

                  {/* Pricing */}
                  <div className="ps-pricing-block">
                    <div className="ps-pricing-label">
                      <Tag size={12} />
                      Pricing
                    </div>
                    {service.prices.map((p, i) => (
                      <div key={i} className="ps-price-row">
                        <span className="ps-price-unit">{p.unit}</span>
                        <span className="ps-price-amount">Rs {p.price}</span>
                      </div>
                    ))}
                    {service.minOrder && (
                      <div className="ps-min-order">
                        <span>Min. Order</span>
                        <span className="ps-min-order-val">{service.minOrder}</span>
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  {service.duration && (
                    <div className="ps-duration">
                      <Clock size={14} />
                      <span>{service.duration}</span>
                    </div>
                  )}

                  {/* Description */}
                  {service.description && (
                    <p className="ps-description">{service.description}</p>
                  )}

                  {/* Features */}
                  {service.features && (
                    <div className="ps-info-block ps-info-block--features">
                      <div className="ps-info-label">
                        <Star size={11} />
                        Key Features
                      </div>
                      <p className="ps-info-text">{service.features}</p>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {service.specialInstructions && (
                    <div className="ps-info-block ps-info-block--instructions">
                      <div className="ps-info-label">
                        <AlertCircle size={11} />
                        Special Instructions
                      </div>
                      <p className="ps-info-text">{service.specialInstructions}</p>
                    </div>
                  )}

                  {['per item', 'per piece', 'per unit'].includes(
                    String(service.prices?.[0]?.unit || '').toLowerCase()
                  ) && (
                    <Link
                      to={`/provider/${providerId}/items/${service._id}`}
                      className="ps-manage-items-link"
                    >
                      <List size={14} /> Manage Items
                    </Link>
                  )}

                  {/* Toggle */}
                  <button
                    className={`ps-toggle-btn ${service.active ? 'ps-toggle-btn--deactivate' : 'ps-toggle-btn--activate'}`}
                    onClick={() => toggleServiceStatus(service._id)}
                  >
                    {service.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              );
              })}
            </div>

            {totalPages > 1 && (
              <div className="ps-pagination-wrap">
                <div className="ps-pagination">
                  <button
                    className="ps-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`ps-page-btn ${page === safeCurrentPage ? 'ps-page-btn--active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="ps-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
                <div className="ps-pagination-meta">
                  Page {safeCurrentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {isAddModalOpen && (
          <div className="ps-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
            <div className="ps-modal">
              <div className="ps-modal-header">
                <div>
                  <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                  <p>{editingService ? 'Update your service details' : 'Fill in the details for your new service'}</p>
                </div>
                <button className="ps-close-btn" onClick={resetForm}>×</button>
              </div>

              <div className="ps-modal-body">

                {/* Section: Basic Info */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Basic Info</h4>
                  <div className="ps-field">
                    <label>Service Name</label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g., Premium Wash, Express Iron"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Category</label>
                    <div className="ps-select-wrap">
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={16} className="ps-select-arrow" />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Pricing</h4>
                  <div className="ps-form-row">
                    <div className="ps-field">
                      <label>Unit Type</label>
                      <div className="ps-select-wrap">
                        <select
                          value={newService.prices[0].unit}
                          onChange={(e) => handlePriceChange(0, 'unit', e.target.value)}
                        >
                          {unitTypes.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={16} className="ps-select-arrow" />
                      </div>
                    </div>
                    <div className="ps-field">
                      <label>Price (Rs)</label>
                      <input
                        type="number"
                        value={newService.prices[0].price}
                        onChange={(e) => handlePriceChange(0, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="ps-field">
                    <label>Minimum Order</label>
                    <input
                      type="number"
                      value={newService.minOrder}
                      onChange={(e) => setNewService({ ...newService, minOrder: e.target.value })}
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                {/* Section: Details */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Service Details</h4>
                  <div className="ps-field">
                    <label>Turnaround Time</label>
                    <input
                      type="text"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="e.g., 2 hours, 24 hours, 1-2 days"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Description</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Describe your service…"
                      rows="3"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Key Features</label>
                    <textarea
                      value={newService.features}
                      onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                      placeholder="e.g., Eco-friendly detergent, Fabric softener included"
                      rows="2"
                    />
                  </div>
                  <div className="ps-field">
                    <label>Special Instructions</label>
                    <textarea
                      value={newService.specialInstructions}
                      onChange={(e) => setNewService({ ...newService, specialInstructions: e.target.value })}
                      placeholder="e.g., Separate whites from colors, Available 24/7"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Status toggle */}
                <label className="ps-check-label">
                  <input
                    type="checkbox"
                    checked={newService.active}
                    onChange={(e) => setNewService({ ...newService, active: e.target.checked })}
                  />
                  <span className="ps-check-box"></span>
                  <span>Service is active and visible to customers</span>
                </label>

              </div>

              <div className="ps-modal-footer">
                <button className="ps-btn-cancel" onClick={resetForm}>Cancel</button>
                <button className="ps-btn-submit" onClick={editingService ? handleUpdateService : handleAddService}>
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProviderServices;