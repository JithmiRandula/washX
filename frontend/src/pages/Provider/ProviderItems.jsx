import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Package, ImagePlus, RotateCcw } from 'lucide-react';
import { serviceItemsAPI, uploadAPI } from '../../api/commerceApi';
import './ProviderItems.css';

const emptyForm = {
  itemName: '',
  description: '',
  price: '',
  imageUrl: ''
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
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await serviceItemsAPI.getByService(Number(serviceId));
      setItems(result?.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
    setImagePreview('');
    setEditingId(null);
    setImageFile(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.itemId);
    setImageFile(null);
    setForm({
      itemName: item.itemName,
      description: item.description || '',
      price: String(item.price),
      imageUrl: item.imageUrl || ''
    });
    setImagePreview(item.imageUrl || '');
    setShowForm(true);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setImagePreview(url);
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

    try {
      let imageUrl = form.imageUrl || null;

      // If user selected a local file, upload it to Cloudinary first
      if (imageFile) {
        const upload = await uploadAPI.uploadServiceItemImage(imageFile, Number(serviceId));
        if (!upload?.success || !upload?.url) {
          throw new Error(upload?.message || 'Image upload failed');
        }
        imageUrl = upload.url;
      }

      const payload = {
        serviceId: Number(serviceId),
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        imageUrl
      };

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

  const isItemActive = (item) => item.isAvailable !== false;

  const handleDelete = async (item) => {
    if (!window.confirm(`Hide "${item.itemName}" from customers?\n\nThe item stays in the database (IsAvailable = 0) but won't appear for customers.`)) return;

    try {
      setError('');
      await serviceItemsAPI.delete(item.itemId, Number(serviceId));
      setSuccess('Item hidden from customers (saved in database as inactive)');
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleRestore = async (item) => {
    try {
      setError('');
      await serviceItemsAPI.restore(item.itemId, Number(serviceId));
      setSuccess('Item restored and visible to customers');
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore item');
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
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                />
              </label>
              <label className="pi-full pi-upload-label">
                <ImagePlus size={16} /> Upload Image
                <input type="file" accept="image/*" onChange={handleImageFile} />
              </label>
            </div>
            <div className="pi-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <div className="pi-preview-empty">
                  <Package size={28} />
                  <span>No image</span>
                </div>
              )}
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
      ) : items.filter(isItemActive).length === 0 && items.length === 0 ? (
        <div className="pi-empty">
          <div className="pi-empty-icon"><Package size={36} /></div>
          <h3>No items yet</h3>
          <p>Add your first item for this service type.</p>
          <button type="button" className="pi-add-btn" onClick={openAddForm}>
            <Plus size={18} /> Add Your First Item
          </button>
        </div>
      ) : (
        <>
          <div className="pi-table-wrap">
            <table className="pi-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item) => {
                  const active = isItemActive(item);
                  return (
                  <tr key={item.itemId} className={active ? '' : 'pi-row-inactive'}>
                    <td>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="pi-thumb" />
                      ) : (
                        <div className="pi-thumb pi-thumb-empty">
                          <Package size={16} />
                        </div>
                      )}
                    </td>
                    <td className="pi-name-cell">{item.itemName}</td>
                    <td className="pi-desc-cell">{item.description || '—'}</td>
                    <td className="pi-price-cell">Rs.{Number(item.price).toFixed(2)}</td>
                    <td>
                      <span className={`pi-status-badge ${active ? 'pi-status-active' : 'pi-status-deleted'}`}>
                        {active ? 'Active' : 'Deleted'}
                      </span>
                    </td>
                    <td className="pi-actions">
                      {active ? (
                        <>
                          <button type="button" onClick={() => openEditForm(item)} title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(item)} title="Soft delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => handleRestore(item)} title="Restore">
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pi-pagination-wrap">
              <div className="pi-pagination">
                <button
                  className="pi-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pi-page-btn ${page === safePage ? 'pi-page-btn--active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pi-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  Next
                </button>
              </div>
              <div className="pi-pagination-meta">
                Page {safePage} of {totalPages} · {items.length} item{items.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderItems;
