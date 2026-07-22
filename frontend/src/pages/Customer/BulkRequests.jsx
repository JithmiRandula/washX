import { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Truck, Calendar, RefreshCw, Loader, X, Scale } from 'lucide-react';
import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import bulkRequestsApi from '../../api/bulkRequestsApi';
import api from '../../utils/api';
import { redirectToPayHereCheckout } from '../../utils/payhere';
import { useAuth } from '../../context/AuthContext';
import { bulkStatusMeta, BULK_STEPS, bulkStepIndex } from '../../utils/bulkRequestStatus';
import './BulkRequests.css';

const POLL_INTERVAL = 15_000;

const fmt = {
  date: (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
  money: (n) => `Rs ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};

const norm = (r) => ({
  id:                r.bulkRequestId      ?? r.BulkRequestId,
  reference:         r.requestReference   ?? r.RequestReference,
  serviceName:       r.serviceName        ?? r.ServiceName,
  providerName:      r.providerName       ?? r.ProviderName,
  fulfillmentMethod: r.fulfillmentMethod  ?? r.FulfillmentMethod,
  address:           r.address            ?? r.Address,
  preferredDate:     r.preferredDate      ?? r.PreferredDate,
  preferredSlot:     r.preferredSlot      ?? r.PreferredSlot,
  notes:             r.notes              ?? r.Notes,
  status:            r.status             ?? r.Status,
  pricePerKg:        Number(r.pricePerKg  ?? r.PricePerKg  ?? 0),
  actualWeightKg:    r.actualWeightKg     ?? r.ActualWeightKg,
  finalPrice:        r.finalPrice         ?? r.FinalPrice,
  createdAt:         r.createdAt          ?? r.CreatedAt,
});

const CustomerBulkRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState(null);

  const load = useCallback(async (opts = {}) => {
    if (!opts.silent) setLoading(true);
    try {
      const res = await bulkRequestsApi.getMine();
      setRequests((res?.data?.data ?? []).map(norm));
    } catch {
      /* keep previous list on transient error */
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => load({ silent: true }), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [load]);

  const startPayment = async (req) => {
    setBusyId(req.id);
    try {
      const nameParts = String(user?.name || 'Customer').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'WashX';

      const response = await api.post('/payments/payhere/checkout', {
        amount: req.finalPrice,
        items: `${req.serviceName} — ${Number(req.actualWeightKg).toFixed(2)}kg bulk laundry (${req.reference})`,
        firstName,
        lastName,
        email: user?.email || '',
        phone: user?.phone || '',
        address: req.address || user?.address || 'Colombo',
        city: 'Colombo'
      });

      if (!response.data?.success || !response.data?.data) {
        throw new Error(response.data?.message || 'Failed to start payment');
      }

      const payment = response.data.data;
      sessionStorage.setItem('washx_bulk_payment', JSON.stringify({ bulkRequestId: req.id }));
      sessionStorage.setItem('washx_payhere_order', payment.order_id);
      redirectToPayHereCheckout(payment);
      // Page navigates to PayHere — no further UI updates needed
    } catch {
      alert('Failed to start payment. Please try again.');
      setBusyId(null);
    }
  };

  const handleConfirm = async (req) => {
    setBusyId(req.id);
    try {
      await bulkRequestsApi.confirm(req.id);
      await startPayment(req);
    } catch {
      alert('Failed to confirm. Please try again.');
      setBusyId(null);
    }
  };

  const handleCancel = async (req) => {
    if (!window.confirm('Cancel this bulk laundry request?')) return;
    setBusyId(req.id);
    try {
      await bulkRequestsApi.cancel(req.id);
      await load();
    } catch {
      alert('Failed to cancel this request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="cbr-page">
        <div className="cbr-content">

          <div className="cbr-header">
            <div>
              <h1 className="cbr-title">Bulk Laundry Requests</h1>
              <p className="cbr-sub">Track your weight-based bookings from request to delivery</p>
            </div>
            <button className="cbr-refresh-btn" onClick={() => load()}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="cbr-loading">
              <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <p>Loading your bulk requests…</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="cbr-empty">
              <Package size={44} />
              <h3>No bulk requests yet</h3>
              <p>Book a weight-based (per kg) service from a provider to see it here.</p>
            </div>
          ) : (
            <div className="cbr-list">
              {requests.map((req) => {
                const meta = bulkStatusMeta(req.status);
                const stepIdx = bulkStepIndex(req.status);
                const cancelled = req.status === 'cancelled';
                const cancellable = ['pending_request', 'pickup_scheduled', 'awaiting_dropoff'].includes(req.status);

                return (
                  <div key={req.id} className="cbr-card">
                    <div className="cbr-card-top">
                      <div>
                        <h3 className="cbr-service-name">{req.serviceName}</h3>
                        <p className="cbr-provider-name">{req.providerName}</p>
                        <p className="cbr-ref">Ref: {req.reference}</p>
                      </div>
                      <span className="cbr-status-badge" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>

                    {!cancelled && (
                      <div className="cbr-tracker">
                        {BULK_STEPS.map((step, i) => (
                          <div key={step.key} className={`cbr-step${i <= stepIdx ? ' cbr-step-done' : ''}`}>
                            <span className="cbr-step-dot" />
                            <span className="cbr-step-label">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="cbr-meta-row">
                      <span className="cbr-meta-item">
                        {req.fulfillmentMethod === 'pickup' ? <MapPin size={13} /> : <Truck size={13} />}
                        {req.fulfillmentMethod === 'pickup' ? `Pickup from ${req.address}` : 'Drop-off at laundry'}
                      </span>
                      {req.preferredDate && (
                        <span className="cbr-meta-item">
                          <Calendar size={13} /> {fmt.date(req.preferredDate)}{req.preferredSlot ? ` · ${req.preferredSlot}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="cbr-price-block">
                      <span>Rs {req.pricePerKg.toFixed(2)}/kg</span>
                      {req.actualWeightKg != null && (
                        <>
                          <span className="cbr-price-sep">·</span>
                          <span className="cbr-weight-pill"><Scale size={12} /> {Number(req.actualWeightKg).toFixed(2)} kg</span>
                        </>
                      )}
                      {req.finalPrice != null && (
                        <span className="cbr-final-price">{fmt.money(req.finalPrice)}</span>
                      )}
                    </div>

                    {req.status === 'awaiting_confirmation' && (
                      <div className="cbr-confirm-box">
                        <p>Your laundry weighed <strong>{Number(req.actualWeightKg).toFixed(2)} kg</strong>. Final price:</p>
                        <p className="cbr-confirm-price">{fmt.money(req.finalPrice)}</p>
                        <button className="cbr-confirm-btn" disabled={busyId === req.id} onClick={() => handleConfirm(req)}>
                          {busyId === req.id ? 'Please wait…' : `Confirm & Pay ${fmt.money(req.finalPrice)}`}
                        </button>
                      </div>
                    )}

                    {req.status === 'payment_pending' && (
                      <div className="cbr-confirm-box">
                        <button className="cbr-confirm-btn" disabled={busyId === req.id} onClick={() => startPayment(req)}>
                          {busyId === req.id ? 'Please wait…' : `Pay Now ${fmt.money(req.finalPrice)}`}
                        </button>
                      </div>
                    )}

                    {cancellable && (
                      <button className="cbr-cancel-btn" disabled={busyId === req.id} onClick={() => handleCancel(req)}>
                        <X size={13} /> Cancel Request
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerBulkRequests;
