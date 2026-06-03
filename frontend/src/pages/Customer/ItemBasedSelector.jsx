import { useMemo, useState } from 'react';
import './ItemBasedSelector.css';

const CATEGORY_CONFIG = [
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'dress', label: 'Dress' },
  { key: 'suits', label: 'Suits' },
  { key: 'deals', label: 'Deals' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'press-only', label: 'Press Only' },
  { key: 'shop', label: 'Shop' },
  { key: 'nightwear', label: 'Nightwear' },
  { key: 'kids', label: 'Kids' },
  { key: 'uniform', label: 'Uniform' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'bedding', label: 'Bedding' }
];

const ITEM_LIBRARY = {
  tops: [
    { name: 'Shirt on Hanger', description: 'Washed, pressed and hung', image: '/search2.jpg', multiplier: 1.0 },
    { name: 'Folded Shirt', description: 'Washed, ironed and folded', image: '/search3.jpg', multiplier: 1.0 },
    { name: 'Shirt Dry Clean', description: 'Carefully dry cleaned and hung', image: '/search4.jpg', multiplier: 1.12 }
  ],
  bottoms: [
    { name: 'Trouser', description: 'Washed and steam pressed', image: '/search5.jpg', multiplier: 1.08 },
    { name: 'Jeans', description: 'Deep clean and fold', image: '/search6.jpg', multiplier: 1.15 },
    { name: 'Shorts', description: 'Quick wash and fold', image: '/search7.jpg', multiplier: 0.85 }
  ],
  dress: [
    { name: 'Casual Dress', description: 'Soft wash and fold', image: '/search8.jpg', multiplier: 1.2 },
    { name: 'Party Dress', description: 'Premium clean and finish', image: '/search9.jpg', multiplier: 1.45 },
    { name: 'Long Dress', description: 'Delicate care with steaming', image: '/search10.jpg', multiplier: 1.55 }
  ],
  suits: [
    { name: 'Two-Piece Suit', description: 'Premium dry clean package', image: '/search11.jpg', multiplier: 1.8 },
    { name: 'Blazer', description: 'Dry clean and press', image: '/search12.jpg', multiplier: 1.5 },
    { name: 'Suit Pants', description: 'Steam press finish', image: '/search13.jpg', multiplier: 1.25 }
  ],
  deals: [
    { name: 'Office Combo', description: '2 shirts + 1 pant combo', image: '/card2.jpg', multiplier: 2.6 },
    { name: 'Weekly Combo', description: '5 mixed garments package', image: '/card3.jpg', multiplier: 4.8 },
    { name: 'Family Combo', description: '10 garments package', image: '/card4.jpg', multiplier: 9.2 }
  ],
  laundry: [
    { name: 'Standard Laundry Item', description: 'Washed and folded', image: '/wash1.jpg', multiplier: 1.0 },
    { name: 'Premium Laundry Item', description: 'Stain treatment included', image: '/wash2.jpg', multiplier: 1.25 },
    { name: 'Express Laundry Item', description: 'Priority same day care', image: '/wash3.jpg', multiplier: 1.5 }
  ],
  'press-only': [
    { name: 'Shirt Press', description: 'Steam pressed only', image: '/work3.jpg', multiplier: 0.6 },
    { name: 'Trouser Press', description: 'Crisp crease finish', image: '/work4.jpg', multiplier: 0.7 },
    { name: 'Dress Press', description: 'Soft steam finish', image: '/work5.jpg', multiplier: 0.9 }
  ],
  shop: [
    { name: 'Laundry Bag', description: 'Reusable premium bag', image: '/card5.jpg', multiplier: 0.5 },
    { name: 'Detergent Pack', description: 'Mild fabric detergent', image: '/card6.jpg', multiplier: 0.9 },
    { name: 'Softener Bottle', description: 'Long-lasting fragrance', image: '/card7.jpg', multiplier: 0.85 }
  ],
  nightwear: [
    { name: 'Night Suit', description: 'Gentle wash and fold', image: '/search14.jpg', multiplier: 0.95 },
    { name: 'Pajama Set', description: 'Soft wash cycle', image: '/search15.jpg', multiplier: 0.9 },
    { name: 'Robe', description: 'Delicate care finish', image: '/search16.jpg', multiplier: 1.1 }
  ],
  kids: [
    { name: 'Kids Shirt', description: 'Baby-safe detergent wash', image: '/signup3.jpg', multiplier: 0.7 },
    { name: 'Kids Uniform', description: 'Wash and iron', image: '/signup4.jpg', multiplier: 0.82 },
    { name: 'Kids Dress', description: 'Soft cycle and fold', image: '/signup5.jpg', multiplier: 0.88 }
  ],
  uniform: [
    { name: 'School Uniform', description: 'Pressed and ready to wear', image: '/work1.jpg', multiplier: 1.05 },
    { name: 'Nurse Uniform', description: 'Hygienic clean and press', image: '/work6.jpg', multiplier: 1.15 },
    { name: 'Chef Uniform', description: 'Heavy-duty cleaning', image: '/work.jpg', multiplier: 1.2 }
  ],
  accessories: [
    { name: 'Tie', description: 'Hand washed and pressed', image: '/card8.jpg', multiplier: 0.45 },
    { name: 'Scarf', description: 'Delicate dry clean', image: '/find1.jpg', multiplier: 0.58 },
    { name: 'Cap', description: 'Shape-safe cleaning', image: '/find.jpg', multiplier: 0.52 }
  ],
  bedding: [
    { name: 'Bed Sheet', description: 'Deep wash and fold', image: '/services1.jpg', multiplier: 1.4 },
    { name: 'Blanket', description: 'Heavy fabric clean', image: '/services2.jpg', multiplier: 1.8 },
    { name: 'Pillow Cover', description: 'Quick wash and fold', image: '/wash4.jpg', multiplier: 0.7 }
  ]
};

const toMoney = (value) => {
  const n = Number(value || 0);
  return `Rs.${n.toFixed(2)}`;
};

const VISIBLE_CATEGORY_COUNT = 8;

const ItemBasedSelector = ({ provider, service, onBack, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORY_CONFIG[0].key);
  const [categoryStartIndex, setCategoryStartIndex] = useState(0);
  const [quantities, setQuantities] = useState({});

  const basePrice = Number(service?.price ?? 0);

  const allItems = useMemo(() => {
    return CATEGORY_CONFIG.flatMap((category) => {
      const items = ITEM_LIBRARY[category.key] || [];
      return items.map((item, idx) => {
        const price = Math.max(50, Math.round(basePrice * Number(item.multiplier || 1)));
        return {
          id: `${category.key}-${idx}`,
          category: category.key,
          categoryLabel: category.label,
          name: item.name,
          description: item.description,
          image: item.image,
          price
        };
      });
    });
  }, [basePrice]);

  const visibleItems = allItems.filter((item) => item.category === activeCategory);

  const selectedCount = Object.values(quantities).reduce((sum, qty) => sum + Number(qty || 0), 0);

  const selectedTotal = allItems.reduce((sum, item) => {
    const qty = Number(quantities[item.id] || 0);
    return sum + qty * Number(item.price || 0);
  }, 0);

  const visibleCategories = CATEGORY_CONFIG.slice(
    categoryStartIndex,
    categoryStartIndex + VISIBLE_CATEGORY_COUNT
  );

  const increaseQty = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: Number(prev[id] || 0) + 1 }));
  };

  const decreaseQty = (id) => {
    setQuantities((prev) => {
      const current = Number(prev[id] || 0);
      const next = Math.max(0, current - 1);
      return { ...prev, [id]: next };
    });
  };

  const handleAddSelected = () => {
    const selectedItems = allItems
      .filter((item) => Number(quantities[item.id] || 0) > 0)
      .map((item) => {
        const quantity = Number(quantities[item.id] || 0);
        return {
          itemId: item.id,
          itemName: item.name,
          category: item.categoryLabel,
          quantity,
          unitPrice: Number(item.price || 0),
          lineTotal: quantity * Number(item.price || 0)
        };
      });

    if (selectedItems.length === 0) {
      return;
    }

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
            From {toMoney(basePrice)}/item
          </div>
        </div>
      </header>

      <section className="ibs-categories-section">
        <div className="ibs-categories-label">Browse by category</div>

        <div className="ibs-categories-wrap">
          <button
            type="button"
            className="ibs-cat-nav"
            onClick={() => setCategoryStartIndex((prev) => Math.max(0, prev - 1))}
            disabled={categoryStartIndex === 0}
            aria-label="Previous categories"
          >
            Prev
          </button>

          <div className="ibs-categories">
            {visibleCategories.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`ibs-category-chip ${activeCategory === category.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="ibs-cat-nav"
            onClick={() =>
              setCategoryStartIndex((prev) =>
                Math.min(CATEGORY_CONFIG.length - VISIBLE_CATEGORY_COUNT, prev + 1)
              )
            }
            disabled={categoryStartIndex >= CATEGORY_CONFIG.length - VISIBLE_CATEGORY_COUNT}
            aria-label="Next categories"
          >
            Next
          </button>
        </div>
      </section>

      <div className="ibs-grid">
        {visibleItems.map((item) => {
          const qty = Number(quantities[item.id] || 0);
          const inCart = qty > 0;

          return (
            <article className={`ibs-card ${inCart ? 'selected' : ''}`} key={item.id}>
              <div className="ibs-card-image-wrap">
                <img src={item.image} alt={item.name} className="ibs-card-image" loading="lazy" />
                <div className="ibs-card-image-overlay" />
                <span className="ibs-card-price">{toMoney(item.price)}</span>
              </div>

              <div className="ibs-card-body">
                <div className="ibs-card-copy">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>

                {qty === 0 ? (
                  <button type="button" className="ibs-add-btn" onClick={() => increaseQty(item.id)}>
                    Add item
                  </button>
                ) : (
                  <div className="ibs-qty-control">
                    <button type="button" onClick={() => decreaseQty(item.id)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span>{qty}</span>
                    <button type="button" onClick={() => increaseQty(item.id)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="ibs-footer-bar">
        <div className="ibs-summary">
          <span className="ibs-summary-count">{selectedCount} item(s) selected</span>
          <strong>{toMoney(selectedTotal)}</strong>
        </div>
        <button
          type="button"
          className="ibs-cart-submit"
          disabled={selectedCount === 0}
          onClick={handleAddSelected}
        >
          Add Selected to Cart
        </button>
      </footer>
    </div>
  );
};

export default ItemBasedSelector;
