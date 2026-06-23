import { useState, useEffect } from 'react';
import { Star, X, Send, Loader, CheckCircle } from 'lucide-react';
import { reviewsApi } from '../../api/reviewsApi';
import './ReviewModal.css';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const ReviewModal = ({ orderId, providerId, providerName, orderRef, onClose, onSuccess }) => {
  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [submitted,  setSubmitted]  = useState(false);

  // Auto-close 2.5 s after showing the success screen
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => { onSuccess?.(); onClose(); }, 2500);
    return () => clearTimeout(t);
  }, [submitted]);

  const active = hovered || rating;

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating before submitting.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await reviewsApi.add({ orderId, providerId, rating, comment: comment.trim() || null });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="rm-overlay">
        <div className="rm-modal rm-success-modal">
          <div className="rm-success-body">
            <div className="rm-success-icon">
              <CheckCircle size={56} color="#10b981" strokeWidth={1.8} />
            </div>
            <h2 className="rm-success-title">Review Submitted!</h2>
            <p className="rm-success-msg">
              Thank you for your feedback on&nbsp;
              <strong>{providerName}</strong>.
              Your review helps others make better choices.
            </p>
            <div className="rm-success-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={24}
                  fill={n <= rating ? '#fbbf24' : 'none'}
                  color={n <= rating ? '#fbbf24' : '#d1d5db'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="rm-success-label">{LABELS[rating]}</p>
            <div className="rm-success-bar">
              <div className="rm-success-bar-fill" />
            </div>
            <p className="rm-success-closing">Closing automatically…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Review form ───────────────────────────────────────────────────────────
  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="rm-header">
          <div>
            <h2 className="rm-title">Write a Review</h2>
            <p className="rm-subtitle">
              <span className="rm-provider-name">{providerName}</span>
              &nbsp;·&nbsp;Order #{orderRef}
            </p>
          </div>
          <button className="rm-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="rm-body">
          <p className="rm-section-label">How was your experience?</p>
          <div className="rm-stars-row">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className="rm-star-btn"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} stars`}
              >
                <Star
                  size={36}
                  fill={n <= active ? '#fbbf24' : 'none'}
                  color={n <= active ? '#fbbf24' : '#d1d5db'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {active > 0 && <p className="rm-rating-label">{LABELS[active]}</p>}

          <p className="rm-section-label" style={{ marginTop: '1.5rem' }}>
            Share your thoughts&nbsp;
            <span className="rm-optional">(optional)</span>
          </p>
          <textarea
            className="rm-textarea"
            placeholder="Tell others about your experience — quality, speed, customer service…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <p className="rm-char-count">{comment.length} / 500</p>

          {error && <p className="rm-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="rm-footer">
          <button className="rm-btn-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="rm-btn-submit"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting
              ? <><Loader size={16} className="rm-spin" /> Submitting…</>
              : <><Send size={16} /> Submit Review</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
