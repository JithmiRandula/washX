import { useEffect, useMemo, useState } from 'react';
import { serviceItemsAPI } from '../../api/commerceApi';
import './ItemBasedSelector.css';

const toMoney = (value) => {
  const n = Number(value || 0);
  return `Rs.${n.toFixed(2)}`;
};

const normalizeItem = (raw) => ({
  itemId: Number(raw?.itemId ?? raw?.ItemId ?? 0),
  itemName: String(raw?.itemName ?? raw?.ItemName ?? ''),
  description: String(raw?.description ?? raw?.Description ?? ''),
  price: Number(raw?.price ?? raw?.Price ?? 0),
  imageUrl: raw?.imageUrl ?? raw?.ImageUrl ?? '/wash1.jpg'
});

const ItemBasedSelector = ({ provider, service, onBack, onAddToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});

  const serviceTypeId = Number(service?.serviceId ?? 0);

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      if (!serviceTypeId) {
        setItems([]);
        setLoading(false);
        setError('Service not selected');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const result = await serviceItemsAPI.getByServiceType(serviceTypeId);
        if (cancelled) return;

        const list = (result?.data || []).map(normalizeItem).filter((i) => i.itemId > 0);
        setItems(list);
        setQuantities({});
      } catch (err) {
        if (cancelled) return;
        setItems([]);
        setError(err.response?.data?.message || 'Failed to load service items');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [serviceTypeId]);

  const priceFrom = useMemo(() => {
    if (items.length === 0) return Number(service?.price ?? 0);
    return Math.min(...items.map((i) => i.price));
  }, [items, service?.price]);

  const selectedCount = Object.values(quantities).reduce((sum, qty) => sum + Number(qty || 0), 0);

  const selectedTotal = items.reduce((sum, item) => {
    const qty = Number(quantities[item.itemId] || 0);
    return sum + qty * Number(item.price || 0);
  }, 0);

  const increaseQty = (itemId) => {
    setQuantities((prev) => ({ ...prev, [itemId]: Number(prev[itemId] || 0) + 1 }));
  };

  const decreaseQty = (itemId) => {
    setQuantities((prev) => {
      const current = Number(prev[itemId] || 0);
      return { ...prev, [itemId]: Math.max(0, current - 1) };
    });
  };

  const handleAddSelected = () => {
    const selectedItems = items
      .filter((item) => Number(quantities[item.itemId] || 0) > 0)
      .map((item) => {
        const quantity = Number(quantities[item.itemId] || 0);
        return {
          itemId: item.itemId,
          itemName: item.itemName,
          quantity,
          unitPrice: Number(item.price || 0),
          lineTotal: quantity * Number(item.price || 0)
        };
      });

    if (selectedItems.length === 0) return;
    onAddToCart(selectedItems);
  };

  return (
    <div className="ibs-page">
      <header className="ibs-header">
        <button type="button" className="ibs-back-btn" onClick={onBack}>
          Back
        </button>

        <div className="ibs-header-content">
          <div className="ibs-header-text">
            <span className="ibs-eyebrow">Item-based booking</span>
            <h2>Select Your Items</h2>
            <p>
              <strong>{provider?.name}</strong>
              <span className="ibs-dot">•</span>
              {service?.serviceName}
            </p>
          </div>
          <div className="ibs-header-badge">
            {items.length > 0
              ? `From ${toMoney(priceFrom)}/item`
              : `Service from ${toMoney(service?.price)}/item`}
          </div>
        </div>
      </header>

      {loading && (
        <div className="ibs-state">
          <p>Loading items from provider...</p>
        </div>
      )}

      {!loading && error && (
        <div className="ibs-state ibs-state-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="ibs-state">
          <h3>No items available yet</h3>
          <p>This provider has not added items for {service?.serviceName}. Try another service or check back later.</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="ibs-grid">
          {items.map((item) => {
            const qty = Number(quantities[item.itemId] || 0);
            const inCart = qty > 0;

            return (
              <article className={`ibs-card ${inCart ? 'selected' : ''}`} key={item.itemId}>
                <div className="ibs-card-image-wrap">
                  <img
                    src={item.imageUrl || '/wash1.jpg'}
                    alt={item.itemName}
                    className="ibs-card-image"
                    loading="lazy"
                  />
                  <div className="ibs-card-image-overlay" />
                  <span className="ibs-card-price">{toMoney(item.price)}</span>
                </div>

                <div className="ibs-card-body">
                  <div className="ibs-card-copy">
                    <h3>{item.itemName}</h3>
                    <p>{item.description || 'No description'}</p>
                  </div>

                  {qty === 0 ? (
                    <button
                      type="button"
                      className="ibs-add-btn"
                      onClick={() => increaseQty(item.itemId)}
                    >
                      Add item
                    </button>
                  ) : (
                    <div className="ibs-qty-control">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.itemId)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        onClick={() => increaseQty(item.itemId)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="ibs-footer-bar">
        <div className="ibs-summary">
          <span className="ibs-summary-count">{selectedCount} item(s) selected</span>
          <strong>{toMoney(selectedTotal)}</strong>
        </div>
        <button
          type="button"
          className="ibs-cart-submit"
          disabled={selectedCount === 0 || loading}
          onClick={handleAddSelected}
        >
          Add Selected to Cart
        </button>
      </footer>
    </div>
  );
};

export default ItemBasedSelector;
