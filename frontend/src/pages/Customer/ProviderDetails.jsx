import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, CheckCircle, MessageCircle } from 'lucide-react';
import { getProviderById } from '../../utils/api';
import { reviewsApi } from '../../api/reviewsApi';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ProviderDetails.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const norm = (v) => v ?? 0;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

const maskName = (name) => {
  if (!name) return 'Anonymous';
  const parts = name.trim().split(' ');
  const mask = (s) => s.length <= 1 ? s + '***' : s[0] + '*'.repeat(Math.min(s.length - 1, 3));
  return parts.map(mask).join(' ');
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StarDisplay = ({ rating, size = 16, interactive = false, onRate }) => (
  <span className="pd-star-display">
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={size}
        fill={n <= Math.round(rating) ? '#fbbf24' : 'none'}
        color={n <= Math.round(rating) ? '#fbbf24' : '#d1d5db'}
        strokeWidth={1.5}
        style={interactive ? { cursor: 'pointer' } : {}}
        onClick={() => interactive && onRate?.(n)}
      />
    ))}
  </span>
);

const RatingSummaryBlock = ({ summary }) => {
  const total = norm(summary.totalReviews ?? summary.TotalReviews);
  const avg   = norm(summary.averageRating ?? summary.AverageRating);

  const bars = [
    { label: '5', count: norm(summary.star5 ?? summary.Star5) },
    { label: '4', count: norm(summary.star4 ?? summary.Star4) },
    { label: '3', count: norm(summary.star3 ?? summary.Star3) },
    { label: '2', count: norm(summary.star2 ?? summary.Star2) },
    { label: '1', count: norm(summary.star1 ?? summary.Star1) },
  ];

  if (total === 0) {
    return (
      <div className="pd-no-reviews">
        <Star size={36} color="#d1d5db" />
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="pd-rating-summary">
      <div className="pd-rating-avg-block">
        <span className="pd-rating-big">{avg.toFixed(1)}</span>
        <StarDisplay rating={avg} size={22} />
        <span className="pd-rating-count">{total} review{total !== 1 ? 's' : ''}</span>
      </div>
      <div className="pd-rating-bars">
        {bars.map(({ label, count }) => (
          <div key={label} className="pd-bar-row">
            <span className="pd-bar-label">{label} ★</span>
            <div className="pd-bar-track">
              <div
                className="pd-bar-fill"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="pd-bar-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const rating      = review.rating      ?? review.Rating      ?? 0;
  const comment     = review.comment     ?? review.Comment     ?? '';
  const createdAt   = review.createdAt   ?? review.CreatedAt;
  const customerName = review.customerName ?? review.CustomerName ?? '';
  const orderRef    = review.orderReference ?? review.OrderReference ?? '';

  return (
    <div className="pd-review-card">
      <div className="pd-review-top">
        <div className="pd-reviewer-info">
          <div className="pd-reviewer-avatar">
            {(customerName[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <p className="pd-reviewer-name">{maskName(customerName)}</p>
            {orderRef && <p className="pd-review-ref">Order #{orderRef}</p>}
          </div>
        </div>
        <div className="pd-review-meta">
          <StarDisplay rating={rating} size={14} />
          <span className="pd-review-date">{fmtDate(createdAt)}</span>
        </div>
      </div>
      {comment && <p className="pd-review-comment">"{comment}"</p>}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentBooking } = useBooking();

  const [provider,       setProvider]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [selectedServices, setSelected]     = useState([]);
  const [quantities,     setQuantities]     = useState({});
  const [reviews,        setReviews]        = useState([]);
  const [summary,        setSummary]        = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => { loadProvider(); }, [id]);

  useEffect(() => {
    if (!id) return;
    loadReviews(id);
  }, [id]);

  const loadProvider = async () => {
    try {
      const data = await getProviderById(id);
      setProvider(data);
    } catch (err) {
      console.error('Error loading provider:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (providerId) => {
    setReviewsLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        reviewsApi.getByProvider(providerId),
        reviewsApi.getSummary(providerId)
      ]);
      setReviews(reviewsRes?.data ?? []);
      setSummary(summaryRes?.data ?? null);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelected(selectedServices.filter(s => s !== serviceId));
      const q = { ...quantities };
      delete q[serviceId];
      setQuantities(q);
    } else {
      setSelected([...selectedServices, serviceId]);
      setQuantities({ ...quantities, [serviceId]: 1 });
    }
  };

  const handleQuantityChange = (serviceId, qty) =>
    setQuantities({ ...quantities, [serviceId]: parseInt(qty) || 1 });

  const calculateTotal = () =>
    selectedServices.reduce((sum, sid) => {
      const svc = provider.services.find(s => s.id === sid);
      return sum + (svc?.price ?? 0) * (quantities[sid] || 1);
    }, 0);

  const handleMessageProvider = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/customer/${user.customerId}/messages`, {
      state: { startWith: { providerId: provider.id, name: provider.name } }
    });
  };

  const handleBookNow = () => {
    if (!user) { navigate('/login'); return; }
    setCurrentBooking({
      providerId:   provider.id,
      providerName: provider.name,
      services: selectedServices.map(sid => {
        const svc = provider.services.find(s => s.id === sid);
        return { ...svc, quantity: quantities[sid] || 1 };
      }),
      totalAmount: calculateTotal()
    });
    navigate('/booking/schedule');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!provider) return <div className="error-page">Provider not found</div>;

  const avgRating = summary
    ? (summary.averageRating ?? summary.AverageRating ?? 0)
    : (provider.rating ?? 0);
  const totalReviews = summary
    ? (summary.totalReviews ?? summary.TotalReviews ?? 0)
    : 0;

  return (
    <div className="provider-details-page">
      {/* ── Header ── */}
      <div className="provider-header">
        <div className="provider-header-content">
          <div className="provider-banner">
            <img src={provider.image} alt={provider.name} />
            {provider.verified && (
              <span className="verified-badge-large">
                <CheckCircle size={24} /> Verified Provider
              </span>
            )}
          </div>

          <div className="provider-main-info">
            <h1>{provider.name}</h1>
            <div className="provider-meta">
              <div className="rating-section">
                <Star size={24} fill="#fbbf24" color="#fbbf24" />
                <span className="rating">{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
                <span className="reviews">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
              </div>
              {provider.address && (
                <div className="location-info">
                  <MapPin size={20} /><span>{provider.address}</span>
                </div>
              )}
              {provider.deliveryTime && (
                <div className="delivery-info">
                  <Clock size={20} /><span>Delivery: {provider.deliveryTime}</span>
                </div>
              )}
            </div>

            <div className="provider-contact">
              <div className="contact-item"><Phone size={18} /><span>+94 77 000 0000</span></div>
              <div className="contact-item">
                <Mail size={18} />
                <span>contact@{provider.name.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <button className="btn-message" onClick={handleMessageProvider}>
                <MessageCircle size={18} /> Message Provider
              </button>
            </div>

            {provider.promotions?.length > 0 && (
              <div className="promotions-section">
                <h3>Active Promotions</h3>
                <div className="promotions-list">
                  {provider.promotions.map((p, i) => (
                    <div key={i} className="promo-item">
                      <span className="promo-icon">🎁</span><span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <div className="provider-content">
        <div className="services-section">
          <h2>Services &amp; Pricing</h2>
          <div className="services-list">
            {provider.services.map(svc => (
              <div
                key={svc.id}
                className={`service-item ${selectedServices.includes(svc.id) ? 'selected' : ''}`}
              >
                <div className="service-info">
                  <div className="service-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(svc.id)}
                      onChange={() => handleServiceToggle(svc.id)}
                    />
                  </div>
                  <div>
                    <h4>{svc.name}</h4>
                    <p className="service-price">Rs {svc.price} per {svc.unit}</p>
                  </div>
                </div>
                {selectedServices.includes(svc.id) && (
                  <div className="quantity-selector">
                    <label>Quantity ({svc.unit}):</label>
                    <input
                      type="number"
                      min="1"
                      value={quantities[svc.id] || 1}
                      onChange={e => handleQuantityChange(svc.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedServices.length > 0 && (
          <div className="booking-summary">
            <div className="summary-content">
              <h3>Booking Summary</h3>
              <div className="summary-items">
                {selectedServices.map(sid => {
                  const svc = provider.services.find(s => s.id === sid);
                  const qty = quantities[sid] || 1;
                  return (
                    <div key={sid} className="summary-item">
                      <span>{svc.name} x {qty}</span>
                      <span>Rs {svc.price * qty}</span>
                    </div>
                  );
                })}
              </div>
              <div className="summary-total">
                <span>Total</span><span>Rs {calculateTotal()}</span>
              </div>
              <button className="btn-book" onClick={handleBookNow}>Book Now</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Reviews Section ── */}
      <div className="pd-reviews-section">
        <div className="pd-reviews-inner">
          <h2 className="pd-reviews-title">
            <Star size={22} fill="#fbbf24" color="#fbbf24" />
            Reviews &amp; Ratings
          </h2>

          {reviewsLoading ? (
            <div className="pd-reviews-loading">Loading reviews…</div>
          ) : (
            <>
              {summary && <RatingSummaryBlock summary={summary} />}

              {reviews.length > 0 && (
                <div className="pd-reviews-list">
                  {reviews.map(r => (
                    <ReviewCard key={r.reviewId ?? r.ReviewId} review={r} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetails;
