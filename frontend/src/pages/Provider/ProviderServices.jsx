import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Clock, DollarSign } from 'lucide-react';
import './ProviderServices.css';

const ProviderServices = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Regular Wash',
      category: 'Washing',
      prices: [
        { unit: 'per kg', price: 250 }
      ],
      duration: '2 hours',
      description: 'Standard washing service with eco-friendly detergent',
      active: true
    },
    {
      id: 2,
      name: 'Express Wash',
      category: 'Washing',
      prices: [
        { unit: 'per kg', price: 400 }
      ],
      duration: '1 hour',
      description: 'Quick washing service for urgent needs',
      active: true
    },
    {
      id: 3,
      name: 'Dry Cleaning',
      category: 'Dry Clean',
      prices: [
        { unit: 'per item', price: 350 }
      ],
      duration: '4 hours',
      description: 'Professional dry cleaning for delicate items',
      active: false
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    category: 'Washing',
    prices: [{ unit: 'per kg', price: '' }],
    duration: '',
    description: '',
    active: true
  });

  const categories = ['Washing', 'Dry Clean', 'Iron', 'Premium'];
  const unitTypes = ['per kg', 'per piece', 'per item', 'per bundle', 'per set'];

  // Update price unit
  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...newService.prices];
    updatedPrices[index] = { ...updatedPrices[index], [field]: value };
    setNewService({ ...newService, prices: updatedPrices });
  };

  const handleAddService = () => {
    const service = {
      id: Date.now(),
      ...newService,
      prices: newService.prices.map(p => ({ ...p, price: Number(p.price) }))
    };
    setServices([...services, service]);
    setNewService({
      name: '',
      category: 'Washing',
      prices: [{ unit: 'per kg', price: '' }],
      duration: '',
      description: '',
      active: true
    });
    setIsAddModalOpen(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService({...service});
    setIsAddModalOpen(true);
  };

  const handleUpdateService = () => {
    setServices(services.map(service => 
      service.id === editingService.id 
        ? { ...newService, prices: newService.prices.map(p => ({ ...p, price: Number(p.price) })) }
        : service
    ));
    setEditingService(null);
    setNewService({
      name: '',
      category: 'Washing',
      prices: [{ unit: 'per kg', price: '' }],
      duration: '',
      description: '',
      active: true
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteService = (id) => {
    setServices(services.filter(service => service.id !== id));
  };

  const toggleServiceStatus = (id) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, active: !service.active } : service
    ));
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

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <span className={`service-status ${service.active ? 'active' : 'inactive'}`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="service-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 size={16} />
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
                    <DollarSign size={16} />
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
                </div>

                <div className="service-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{service.duration}</span>
                  </div>
                </div>

                <p className="service-description">{service.description}</p>

                <button 
                  className={`toggle-btn ${service.active ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleServiceStatus(service.id)}
                >
                  {service.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

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
                      active: true
                    });
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>SERVICE NAME</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Enter service name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CATEGORY</label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing Section */}
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
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>DURATION</label>
                  <input
                    type="text"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="e.g., 2 hours, 30 minutes"
                  />
                </div>

                <div className="form-group">
                  <label>DESCRIPTION</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Enter service description"
                    rows="3"
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newService.active}
                      onChange={(e) => setNewService({ ...newService, active: e.target.checked })}
                    />
                    <span className="checkmark"></span>
                    Service is active
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