import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Clock } from 'lucide-react';
import { serviceAPI } from '../../utils/api';
import './ProviderServices.css';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceAPI.getMyServices();
      setServices(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update price unit
  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...newService.prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setNewService({ ...newService, prices: updatedPrices });
  };

  const handleAddService = async () => {
    try {
      const serviceData = {
        ...newService,
        prices: newService.prices.map(p => ({ ...p, price: Number(p.price) }))
      };
      
      const response = await serviceAPI.createService(serviceData);
      setServices([...services, response.data]);
      
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
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create service');
      console.error('Error creating service:', err);
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
      const serviceData = {
        ...newService,
        prices: newService.prices.map(p => ({ ...p, price: Number(p.price) }))
      };
      
      const response = await serviceAPI.updateService(editingService._id, serviceData);
      
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === editingService._id ? response.data : service
        )
      );
      
      setEditingService(null);
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
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to update service');
      console.error('Error updating service:', err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      await serviceAPI.deleteService(id);
      setServices(services.filter(service => service._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete service');
      console.error('Error deleting service:', err);
    }
  };

  const toggleServiceStatus = async (id) => {
    try {
      const response = await serviceAPI.toggleServiceStatus(id);
      setServices(services.map(service =>
        service._id === id ? response.data : service
      ));
    } catch (err) {
      setError(err.message || 'Failed to toggle service status');
      console.error('Error toggling service status:', err);
    }
  };

  return (
    <div className="provider-services">
      <div className="services-container">
        <div className="services-header">
          <div>
            <h1>Manage Services</h1>
            <p>Add and manage your laundry services</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Add New Service
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No Services Yet</h3>
            <p>Get started by adding your first laundry service</p>
            <button 
              className="btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              Add Your First Service
            </button>
          </div>
        ) : (
          /* Services Grid */
          <div className="services-grid">
            {services.map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <div className="service-info">
                    <h3>{service.name}</h3>
                    <span className={`service-status ${service.active ? 'active' : 'inactive'}`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="service-actions">
                    <button 
                      className="service-action-btn service-edit-btn"
                      onClick={() => handleEditService(service)}
                      title="Edit Service"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="service-action-btn service-delete-btn"
                      onClick={() => handleDeleteService(service._id)}
                      title="Delete Service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

              <div className="service-details">
                <div className="service-category">
                  <Package size={16} />
                  <span>{service.category}</span>
                </div>
                
                {/* Multiple Prices Display */}
                <div className="service-prices">
                  <div className="prices-header">
                    <span>Pricing</span>
                  </div>
                  <div className="prices-list">
                    {service.prices.map((priceItem, idx) => (
                      <div key={idx} className="price-item">
                        <span className="price-unit">{priceItem.unit}</span>
                        <span className="price-value">Rs {priceItem.price}</span>
                      </div>
                    ))}
                  </div>
                  {service.minOrder && (
                    <div className="min-order-info">
                      <span className="min-order-label">Min Order:</span>
                      <span className="min-order-value">{service.minOrder}</span>
                    </div>
                  )}
                </div>

                <div className="service-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <p className="service-description">{service.description}</p>

                {service.features && (
                  <div className="service-features">
                    <h4 className="features-title">Key Features</h4>
                    <p className="features-text">{service.features}</p>
                  </div>
                )}

                {service.specialInstructions && (
                  <div className="service-instructions">
                    <h4 className="instructions-title">Special Instructions</h4>
                    <p className="instructions-text">{service.specialInstructions}</p>
                  </div>
                )}

                <button 
                  className={`toggle-btn ${service.active ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleServiceStatus(service._id)}
                >
                  {service.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Add/Edit Service Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingService(null);
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
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Service Name */}
                <div className="form-group">
                  <label>SERVICE NAME</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g., Premium Wash, Express Iron"
                    className="input-with-icon"
                  />
                </div>

                <div className="form-divider"></div>

                {/* Category */}
                <div className="form-group">
                  <label>CATEGORY</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="select-with-icon"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-divider"></div>

                {/* Pricing Section */}
                <div className="pricing-section">
                  <h3 className="section-title">Pricing Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>UNIT TYPE</label>
                      <select
                        value={newService.prices[0].unit}
                        onChange={(e) => handlePriceChange(0, 'unit', e.target.value)}
                      >
                        {unitTypes.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>PRICE (RS)</label>
                      <input
                        type="number"
                        value={newService.prices[0].price}
                        onChange={(e) => handlePriceChange(0, 'price', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>MINIMUM ORDER</label>
                    <input
                      type="text"
                      value={newService.minOrder}
                      onChange={(e) => setNewService({ ...newService, minOrder: e.target.value })}
                      placeholder="e.g., 2 kg, 5 pieces, 1 item"
                    />
                  </div>
                </div>

                <div className="form-divider"></div>

                {/* Service Details */}
                <div className="service-details-section">
                  <h3 className="section-title">Service Details</h3>
                  <div className="form-group">
                    <label>TURNAROUND TIME</label>
                    <input
                      type="text"
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder="e.g., 2 hours, 24 hours, 1-2 days"
                    />
                  </div>

                  <div className="form-group">
                    <label>DESCRIPTION</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Describe your service, what makes it special..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>KEY FEATURES</label>
                    <textarea
                      value={newService.features}
                      onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                      placeholder="e.g., Eco-friendly detergent, Fabric softener included, Professional equipment"
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>SPECIAL INSTRUCTIONS</label>
                    <textarea
                      value={newService.specialInstructions}
                      onChange={(e) => setNewService({ ...newService, specialInstructions: e.target.value })}
                      placeholder="e.g., Separate whites from colors, Available 24/7, Check care labels"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="form-divider"></div>

                {/* Service Status */}
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newService.active}
                      onChange={(e) => setNewService({ ...newService, active: e.target.checked })}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-text">
                      Service is active and visible to customers
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingService(null);
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
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={editingService ? handleUpdateService : handleAddService}
                >
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