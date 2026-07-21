import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Clock, Tag, AlertCircle, Star, ChevronDown, List, Settings } from 'lucide-react';
import { serviceAPI } from '../../utils/api';
import './ProviderServices.css';

const ITEM_PRICING_UNITS = ['per item', 'per piece', 'per bundle', 'per set'];
const BULK_PRICING_UNIT = 'per kg';

const ITEM_CATEGORIES = [
  'Washing (per item)',
  'Dry Cleaning (per item)',
  'Ironing',
  'Premium Express',
  'Fabric Care',
  'Shoe Cleaning',
  'Stain Removal'
];

const BULK_CATEGORIES = [
  'General Laundry (kg-based)',
  'Household Linen Bundle',
  'Commercial Laundry',
  'Subscription Laundry Plans',
  'Bulk Premium Wash'
];

const getServiceMode = (pricingType) => {
  const t = String(pricingType || '').toLowerCase();
  if (t.includes('kg') || t.includes('bulk') || t.includes('per_kg') || t.includes('perkg')) {
    return 'bulk';
  }
  return 'item';
};

const ProviderServices = () => {
  const { providerId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 3;
  const [itemPage, setItemPage] = useState(1);
  const [bulkPage, setBulkPage] = useState(1);
  const [activeTab, setActiveTab] = useState('item'); // 'item' | 'bulk'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    category: ITEM_CATEGORIES[0],
    serviceMode: 'item',
    prices: [{ unit: 'per item', price: '' }],
    duration: '',
    description: '',
    minOrder: '',
    features: '',
    specialInstructions: '',
    active: true
  });

  const categoryColors = {
    'Washing (per item)': { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
    'Dry Cleaning (per item)': { bg: '#f3e8ff', text: '#7e22ce', dot: '#a855f7' },
    Ironing: { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
    'Premium Express': { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899' },
    'Fabric Care': { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
    'Shoe Cleaning': { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
    'Stain Removal': { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
    'General Laundry (kg-based)': { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
    'Household Linen Bundle': { bg: '#ecfccb', text: '#3f6212', dot: '#84cc16' },
    'Commercial Laundry': { bg: '#e0e7ff', text: '#3730a3', dot: '#6366f1' },
    'Subscription Laundry Plans': { bg: '#fae8ff', text: '#86198f', dot: '#d946ef' },
    'Bulk Premium Wash': { bg: '#cffafe', text: '#0e7490', dot: '#06b6d4' },
    Washing: { bg: '#e0f2fe', text: '#0369a1', dot: '#0ea5e9' },
    'Dry Clean': { bg: '#f3e8ff', text: '#7e22ce', dot: '#a855f7' },
    Premium: { bg: '#fce7f3', text: '#9d174d', dot: '#ec4899' },
    _default: { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' }
  };

  const getCategoriesForMode = (mode) => (mode === 'bulk' ? BULK_CATEGORIES : ITEM_CATEGORIES);

  const resolveCategoryForMode = (mode, currentCategory) => {
    const list = getCategoriesForMode(mode);
    if (list.includes(currentCategory)) return currentCategory;
    return list[0];
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

      const mapped = rows.map((s) => {
        const pricingType = String(s.pricingType ?? '');
        const serviceMode = getServiceMode(pricingType);
        return {
          _id: String(s.serviceId),
          name: s.serviceName,
          category: s.category,
          serviceMode,
          prices: [{ unit: pricingType, price: s.price ?? s.basePrice }],
          duration: s.turnaroundTime || '',
          description: s.description || '',
          minOrder: s.minimumOrder,
          features: s.keyFeatures || '',
          specialInstructions: s.specialInstructions || '',
          active: true
        };
      });
      setServices(mapped);
      setItemPage(1);
      setBulkPage(1);
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const modeOf = (s) => s.serviceMode || getServiceMode(s.prices?.[0]?.unit);
  const itemServices = services.filter((s) => modeOf(s) === 'item');
  const bulkServices = services.filter((s) => modeOf(s) === 'bulk');

  const itemTotalPages = Math.max(1, Math.ceil(itemServices.length / PAGE_SIZE));
  const bulkTotalPages = Math.max(1, Math.ceil(bulkServices.length / PAGE_SIZE));
  const safeItemPage = Math.min(itemPage, itemTotalPages);
  const safeBulkPage = Math.min(bulkPage, bulkTotalPages);
  const pagedItemServices = itemServices.slice((safeItemPage - 1) * PAGE_SIZE, safeItemPage * PAGE_SIZE);
  const pagedBulkServices = bulkServices.slice((safeBulkPage - 1) * PAGE_SIZE, safeBulkPage * PAGE_SIZE);

  useEffect(() => {
    if (itemPage > itemTotalPages) setItemPage(itemTotalPages);
  }, [itemPage, itemTotalPages]);

  useEffect(() => {
    if (bulkPage > bulkTotalPages) setBulkPage(bulkTotalPages);
  }, [bulkPage, bulkTotalPages]);

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...newService.prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setNewService({ ...newService, prices: updatedPrices });
  };

  const setServiceMode = (mode) => {
    setNewService((prev) => ({
      ...prev,
      serviceMode: mode,
      category: resolveCategoryForMode(mode, prev.category),
      prices: [
        {
          unit: mode === 'bulk' ? BULK_PRICING_UNIT : (ITEM_PRICING_UNITS.includes(prev.prices[0]?.unit) ? prev.prices[0].unit : 'per item'),
          price: prev.prices[0]?.price ?? ''
        }
      ]
    }));
  };

  const resetForm = () => {
    setNewService({
      name: '',
      category: ITEM_CATEGORIES[0],
      serviceMode: 'item',
      prices: [{ unit: 'per item', price: '' }],
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

  const resolvePricingType = () => {
    if (newService.serviceMode === 'bulk') return BULK_PRICING_UNIT;
    return newService.prices?.[0]?.unit || 'per item';
  };

  const handleAddService = async () => {
    try {
      const primaryPrice = newService.prices?.[0];
      await serviceAPI.createService({
        serviceName: newService.name,
        category: newService.category,
        pricingType: resolvePricingType(),
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
    const serviceMode = service.serviceMode || getServiceMode(service.prices?.[0]?.unit);
    setEditingService(service);
    setNewService({
      ...service,
      serviceMode,
      category: resolveCategoryForMode(serviceMode, service.category),
      minOrder: service.minOrder || '',
      features: service.features || '',
      specialInstructions: service.specialInstructions || '',
      prices: [
        {
          unit: serviceMode === 'bulk' ? BULK_PRICING_UNIT : (service.prices?.[0]?.unit || 'per item'),
          price: service.prices?.[0]?.price ?? ''
        }
      ]
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateService = async () => {
    try {
      const primaryPrice = newService.prices?.[0];
      await serviceAPI.updateService(editingService._id, {
        serviceName: newService.name,
        category: newService.category,
        pricingType: resolvePricingType(),
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
      // Per-section page clamping happens automatically via the itemPage/bulkPage effects.
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError((typeof err === 'string' ? err : err?.message) || 'Failed to delete service');
    }
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(s =>
      s._id === id ? { ...s, active: !s.active } : s
    ));
  };

  const renderServiceCard = (service) => {
    const cat = categoryColors[service.category] || categoryColors._default;
    const mode = modeOf(service);
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

        {/* Category + service type */}
        <div className="ps-card-badges">
          <div className="ps-category-chip" style={{ background: cat.bg, color: cat.text }}>
            <span className="ps-category-dot" style={{ background: cat.dot }}></span>
            {service.category}
          </div>
          <span className={`ps-type-badge ps-type-badge--${mode}`}>
            {mode === 'bulk' ? 'Bulk (per kg)' : 'Item-based'}
          </span>
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

        {mode === 'item' && (
          <Link to={`/provider/${providerId}/items/${service._id}`} className="ps-manage-items-link">
            <List size={14} /> Manage Items
          </Link>
        )}
        {mode === 'bulk' && (
          <Link to={`/provider/${providerId}/bulk-items/${service._id}`} className="ps-manage-items-link">
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
  };

  const renderPagination = (safePage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="ps-pagination-wrap">
        <div className="ps-pagination">
          <button
            className="ps-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`ps-page-btn ${page === safePage ? 'ps-page-btn--active' : ''}`}
              onClick={() => setPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="ps-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
        <div className="ps-pagination-meta">
          Page {safePage} of {totalPages}
        </div>
      </div>
    );
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
            {/* Tab switcher */}
            <div className="ps-tabs">
              <button
                type="button"
                className={`ps-tab-btn ${activeTab === 'item' ? 'ps-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('item')}
              >
                <Package size={16} />
                Item-Based
                <span className="ps-tab-count">{itemServices.length}</span>
              </button>
              <button
                type="button"
                className={`ps-tab-btn ${activeTab === 'bulk' ? 'ps-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('bulk')}
              >
                <Settings size={16} />
                Bulk-Based (per kg)
                <span className="ps-tab-count">{bulkServices.length}</span>
              </button>
            </div>

            {activeTab === 'item' ? (
              itemServices.length === 0 ? (
                <div className="ps-empty-inline">
                  <p>No item-based services yet.</p>
                </div>
              ) : (
                <>
                  <div className="ps-grid">
                    {pagedItemServices.map(renderServiceCard)}
                  </div>
                  {renderPagination(safeItemPage, itemTotalPages, setItemPage)}
                </>
              )
            ) : (
              bulkServices.length === 0 ? (
                <div className="ps-empty-inline">
                  <p>No bulk-based services yet.</p>
                </div>
              ) : (
                <>
                  <div className="ps-grid">
                    {pagedBulkServices.map(renderServiceCard)}
                  </div>
                  {renderPagination(safeBulkPage, bulkTotalPages, setBulkPage)}
                </>
              )
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
                </div>

                {/* Section: Service type */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Service Type</h4>
                  <p className="ps-section-hint">Choose how customers will book this service.</p>
                  <div className="ps-service-type-options">
                    <button
                      type="button"
                      className={`ps-service-type-card ${newService.serviceMode === 'item' ? 'active' : ''}`}
                      onClick={() => setServiceMode('item')}
                    >
                      <Package size={22} />
                      <span className="ps-service-type-title">Item-based services</span>
                      <small>Priced per item, piece, bundle, or set</small>
                    </button>
                    <button
                      type="button"
                      className={`ps-service-type-card ${newService.serviceMode === 'bulk' ? 'active' : ''}`}
                      onClick={() => setServiceMode('bulk')}
                    >
                      <Settings size={22} />
                      <span className="ps-service-type-title">Bulk (per kg) services</span>
                      <small>Priced per kilogram</small>
                    </button>
                  </div>
                </div>

                {/* Section: Category (depends on service type) */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Category</h4>
                  <p className="ps-section-hint">
                    {newService.serviceMode === 'bulk'
                      ? 'Bulk-based categories (priced per kg)'
                      : 'Item-based categories (priced per item/piece)'}
                  </p>
                  <div className="ps-field">
                    <label>
                      {newService.serviceMode === 'bulk' ? 'Bulk-Based Category' : 'Item-Based Category'}
                    </label>
                    <div className="ps-select-wrap">
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      >
                        <optgroup
                          label={newService.serviceMode === 'bulk' ? 'Bulk-Based' : 'Item-Based'}
                        >
                          {getCategoriesForMode(newService.serviceMode).map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <ChevronDown size={16} className="ps-select-arrow" />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div className="ps-form-section">
                  <h4 className="ps-section-heading">Pricing</h4>
                  <div className="ps-form-row">
                    {newService.serviceMode === 'item' ? (
                      <div className="ps-field">
                        <label>Unit Type</label>
                        <div className="ps-select-wrap">
                          <select
                            value={newService.prices[0].unit}
                            onChange={(e) => handlePriceChange(0, 'unit', e.target.value)}
                          >
                            {ITEM_PRICING_UNITS.map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="ps-select-arrow" />
                        </div>
                      </div>
                    ) : (
                      <div className="ps-field">
                        <label>Unit Type</label>
                        <input type="text" value="per kg" readOnly className="ps-readonly-input" />
                      </div>
                    )}
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