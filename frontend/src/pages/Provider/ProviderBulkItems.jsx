import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Package, ImagePlus, RotateCcw } from 'lucide-react';
import { bulkItemsAPI, uploadAPI } from '../../api/commerceApi';
import './ProviderItems.css';

const emptyForm = {
  name: '',
  includedCount: 1,
  maxWeightKg: '',
  description: '',
  price: '',
  imageUrl: ''
};

const ProviderBulkItems = () => {
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

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await bulkItemsAPI.getForManage(Number(serviceId));
      setItems(result?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bulk items');
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
    setImagePreview('');
    setEditingId(null);
    setImageFile(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.bulkItemId);
    setImageFile(null);
    // prefer explicit fields returned by API
    const baseDesc = item.description || '';
    const includedCount = Number(item.includedCount ?? 1);
    const maxWeightKg = item.maxWeightKg != null ? String(item.maxWeightKg) : '';

    setForm({
      name: item.name,
      includedCount: includedCount,
      maxWeightKg: String(maxWeightKg),
      
      description: baseDesc,
      price: String(item.price ?? ''),
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
    if (!form.name.trim() || !form.price) {
      setError('Name and price are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = form.imageUrl || null;

      // If user selected a local file, upload it to Cloudinary first
      if (imageFile) {
        const upload = await uploadAPI.uploadBulkItemImage(imageFile, Number(serviceId));
        if (!upload?.success || !upload?.url) {
          throw new Error(upload?.message || 'Image upload failed');
        }
        imageUrl = upload.url;
      }

      // description (no per-bag weights UI)
      const composedDescription = form.description?.trim() || '';

      const payload = {
        serviceId: Number(serviceId),
        name: form.name.trim(),
        includedCount: Number(form.includedCount) || 1,
        maxWeightKg: form.maxWeightKg ? Number(form.maxWeightKg) : null,
        price: Number(form.price),
        imageUrl,
        description: composedDescription || null
      };

      if (editingId) {
        await bulkItemsAPI.update(editingId, payload);
        setSuccess('Bulk item updated successfully');
      } else {
        await bulkItemsAPI.add(payload);
        setSuccess('Bulk item added successfully');
      }

      setShowForm(false);
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bulk item');
    } finally {
      setSaving(false);
    }
  };

  const isItemActive = (item) => item.isAvailable !== false;

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" permanently? This operation cannot be undone.`)) return;

    try {
      setError('');
      await bulkItemsAPI.delete(item.bulkItemId, Number(serviceId));
      setSuccess('Bulk item deleted');
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bulk item');
    }
  };

  const handleRestore = async (item) => {
    try {
      setError('');
      await bulkItemsAPI.restore(item.bulkItemId, Number(serviceId));
      setSuccess('Bulk item restored and visible to customers');
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore bulk item');
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
          <h1>Manage Bulk Items</h1>
        </div>
        <button type="button" className="pi-add-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Bulk Item
        </button>
      </header>

      {success && <div className="pi-alert pi-alert-success">{success}</div>}
      {error && <div className="pi-alert pi-alert-error">{error}</div>}

      {showForm && (
        <form className="pi-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit Bulk Item' : 'Add New Bulk Item'}</h3>
          <div className="pi-form-body">
            <div className="pi-form-fields">
              <label>
                Name *
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 1 BAG"
                  required
                />
              </label>
              <label>
                Bags *
                <select
                  value={form.includedCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setForm((p) => {
                      const next = { ...p, includedCount: val };
                      // auto-fill name when it matches a simple pattern or is empty
                      const nameLooksAuto = !p.name || /^\d+\s*bag(s)?$/i.test(p.name.trim()) || /^\d+\s*bag(s)?/i.test(p.name.trim());
                      if (nameLooksAuto) next.name = `${val} BAG`;
                      
                      return next;
                    });
                  }}
                  required
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Up to (kg)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.maxWeightKg}
                  onChange={(e) => setForm((p) => ({ ...p, maxWeightKg: e.target.value }))}
                  placeholder="e.g. 5"
                />
              </label>
              <label className="pi-full">
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
              {/* per-bag weights removed as requested */}
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
              {saving ? 'Saving...' : editingId ? 'Update Bulk Item' : 'Save Bulk Item'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="pi-muted">Loading items...</p>
      ) : items.filter(isItemActive).length === 0 && items.length === 0 ? (
        <div className="pi-empty">
          <div className="pi-empty-icon"><Package size={36} /></div>
          <h3>No bulk items yet</h3>
          <p>Add your first bulk option for this service.</p>
          <button type="button" className="pi-add-btn" onClick={openAddForm}>
            <Plus size={18} /> Add Your First Bulk Item
          </button>
        </div>
      ) : (
        <div className="pi-cards-grid">
          {items.map((item) => {
            const active = isItemActive(item);
            const includedCount = Number(item.includedCount ?? 1);
            const maxWeightKg = item.maxWeightKg != null ? item.maxWeightKg : '';

            return (
              <div key={item.bulkItemId} className={`pi-card ${active ? '' : 'pi-row-inactive'}`}>
                <div className="pi-card-header">
                  <div className="pi-card-title">{item.name}</div>
                  <div className="pi-card-actions">
                    {active ? (
                      <>
                        <button type="button" onClick={() => openEditForm(item)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => handleDelete(item)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => handleRestore(item)} title="Restore">
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pi-card-body">
                  <div className="pi-card-image-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="pi-card-image-empty">
                        <Package size={22} />
                      </div>
                    )}
                  </div>
                  <div className="pi-card-price">Rs.{Number(item.price).toFixed(2)}</div>
                  <div className="pi-card-meta">{includedCount} bag{includedCount > 1 ? 's' : ''} included</div>
                  <div className="pi-card-meta">{maxWeightKg ? `Up to ${Number(maxWeightKg)}Kg` : '—'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProviderBulkItems;
