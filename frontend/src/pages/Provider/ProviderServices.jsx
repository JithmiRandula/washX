import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package, Clock, DollarSign } from 'lucide-react';
import './ProviderServices.css';

const ProviderServices = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Regular Wash',
      category: 'Washing',
      price: 15,
      duration: '2 hours',
      description: 'Standard washing service with eco-friendly detergent',
      active: true
    },
    {
      id: 2,
      name: 'Express Wash',
      category: 'Washing',
      price: 25,
      duration: '1 hour',
      description: 'Quick washing service for urgent needs',
      active: true
    },
    {
      id: 3,
      name: 'Dry Cleaning',
      category: 'Dry Clean',
      price: 35,
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
    price: '',
    duration: '',
    description: '',
    active: true
  });

  const categories = ['Washing', 'Dry Clean', 'Iron', 'Premium'];

  const handleAddService = () => {
    const service = {
      id: Date.now(),
      ...newService,
      price: Number(newService.price)
    };
    setServices([...services, service]);
    setNewService({
      name: '',
      category: 'Washing',
      price: '',
      duration: '',
      description: '',
      active: true
    });
    setIsAddModalOpen(false);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService(service);
    setIsAddModalOpen(true);
  };

  const handleUpdateService = () => {
    setServices(services.map(service => 
      service.id === editingService.id 
        ? { ...newService, price: Number(newService.price) }
        : service
    ));
    setEditingService(null);
    setNewService({
      name: '',
      category: 'Washing',
      price: '',
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
                
                <div className="service-meta">
                  <div className="meta-item">
                    <DollarSign size={16} />
                    <span>Rs {service.price}</span>
                  </div>
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
                      price: '',
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
                  <label>Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="Enter service name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
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

                  <div className="form-group">
                    <label>Price (Rs)</label>
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="e.g., 2 hours, 30 minutes"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
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
                      price: '',
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