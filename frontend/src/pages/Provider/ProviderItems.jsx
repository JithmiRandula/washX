import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Package, ImagePlus } from 'lucide-react';
import { serviceItemsAPI } from '../../api/commerceApi';
import './ProviderItems.css';

const emptyForm = {
  itemName: '',
  description: '',
  price: '',
  imageUrl: '/wash1.jpg'
};

const ProviderItems = () => {
  const { providerId, serviceId: serviceIdParam, serviceTypeId: legacyServiceId } = useParams();
  const serviceId = serviceIdParam || legacyServiceId;
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('/wash1.jpg');

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await serviceItemsAPI.getByService(Number(serviceId));
      setItems(result?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      setError('Invalid service id in URL');
      return;
    }
    loadItems();
  }, [serviceId]);

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview('/wash1.jpg');
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.itemId);
    setForm({
      itemName: item.itemName,
      description: item.description || '',
      price: String(item.price),
      imageUrl: item.imageUrl || '/wash1.jpg'
    });
    setImagePreview(item.imageUrl || '/wash1.jpg');
    setShowForm(true);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setImagePreview(url);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.price) {
      setError('Item name and price are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      serviceId: Number(serviceId),
      itemName: form.itemName.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl || '/wash1.jpg'
    };

    try {
      if (editingId) {
        await serviceItemsAPI.update(editingId, payload);
        setSuccess('Item updated successfully');
      } else {
        await serviceItemsAPI.add(payload);
        setSuccess('Item added successfully');
      }

      setShowForm(false);
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"?`)) return;

    try {
      await serviceItemsAPI.delete(item.itemId, Number(serviceId));
      setSuccess('Item deleted');
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  return (
    <div className="provider-items-page">
      <header className="pi-header">
        <button
          type="button"
          className="pi-back-btn"
          onClick={() => navigate(`/provider/${providerId}/services`)}
        >
          <ArrowLeft size={18} /> Back to Services
        </button>
        <div>
          <h1>Manage Service Items</h1>
          <p>Service ID: {serviceId} — add items customers can order</p>
        </div>
        <button type="button" className="pi-add-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Item
        </button>
      </header>

      {success && <div className="pi-alert pi-alert-success">{success}</div>}
      {error && <div className="pi-alert pi-alert-error">{error}</div>}

      {showForm && (
        <form className="pi-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="pi-form-body">
            <div className="pi-form-fields">
              <label>
                Item Name *
                <input
                  value={form.itemName}
                  onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value }))}
                  placeholder="e.g. Shirt on Hanger"
                  required
                />
              </label>
              <label>
                Price (Rs) *
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </label>
              <label className="pi-full">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description for customers"
                />
              </label>
              <label className="pi-full">
                Image URL (optional)
                <input
                  value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, imageUrl: e.target.value }));
                    setImagePreview(e.target.value || '/wash1.jpg');
                  }}
                  placeholder="/wash1.jpg or https://..."
                />
              </label>
              <label className="pi-full pi-upload-label">
                <ImagePlus size={16} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageFile} />
              </label>
            </div>
            <div className="pi-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          </div>
          <div className="pi-form-actions">
            <button
              type="button"
              className="pi-btn-secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="pi-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="pi-muted">Loading items...</p>
      ) : items.length === 0 ? (
        <div className="pi-empty">
          <Package size={48} />
          <h3>No items yet</h3>
          <p>Add your first item for this service type.</p>
        </div>
      ) : (
        <div className="pi-table-wrap">
          <table className="pi-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td>
                    <img
                      src={item.imageUrl || '/wash1.jpg'}
                      alt={item.itemName}
                      className="pi-thumb"
                    />
                  </td>
                  <td>{item.itemName}</td>
                  <td>{item.description || '—'}</td>
                  <td>Rs.{Number(item.price).toFixed(2)}</td>
                  <td className="pi-actions">
                    <button type="button" onClick={() => openEditForm(item)} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(item)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProviderItems;
