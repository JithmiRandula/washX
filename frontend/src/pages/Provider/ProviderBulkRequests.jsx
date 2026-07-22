import { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Truck, Calendar, Phone, RefreshCw, Loader, Scale, Check, X } from 'lucide-react';
import bulkRequestsApi from '../../api/bulkRequestsApi';
import { bulkStatusMeta, BULK_STEPS, bulkStepIndex } from '../../utils/bulkRequestStatus';
import './ProviderBulkRequests.css';

const POLL_INTERVAL = 15_000;

const fmt = {
  date: (d) => d ? new Date(d).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
  money: (n) => `Rs ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
};

const norm = (r) => ({
  id:                r.bulkRequestId      ?? r.BulkRequestId,
  reference:         r.requestReference   ?? r.RequestReference,
  serviceName:       r.serviceName        ?? r.ServiceName,
  customerName:      r.customerName       ?? r.CustomerName,
  customerPhone:     r.customerPhone      ?? r.CustomerPhone,
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

const ProviderBulkRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busyId, setBusyId]     = useState(null);
  const [weighingId, setWeighingId] = useState(null);
  const [weightInput, setWeightInput] = useState('');

  const load = useCallback(async (opts = {}) => {
    if (!opts.silent) setLoading(true);
    try {
      const res = await bulkRequestsApi.getProviderMine();
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

  const run = async (id, action, errorMsg) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch {
      alert(errorMsg);
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept  = (req) => run(req.id, () => bulkRequestsApi.accept(req.id), 'Failed to accept this request.');
  const handleReject  = (req) => run(req.id, () => bulkRequestsApi.reject(req.id), 'Failed to reject this request.');
  const handleReceive = (req) => run(req.id, () => bulkRequestsApi.receive(req.id), 'Failed to mark as received.');
  const handleProcess = (req) => run(req.id, () => bulkRequestsApi.startProcessing(req.id), 'Failed to start processing.');
  const handleReady   = (req) => run(req.id, () => bulkRequestsApi.ready(req.id), 'Failed to mark ready.');
  const handleComplete= (req) => run(req.id, () => bulkRequestsApi.complete(req.id), 'Failed to mark complete.');

  const openWeighForm = (req) => {
    setWeighingId(req.id);
    setWeightInput('');
  };

  const submitWeight = async (req) => {
    const weight = Number(weightInput);
    if (!weight || weight <= 0) {
      alert('Enter a valid weight in kg.');
      return;
    }
    setBusyId(req.id);
    try {
      await bulkRequestsApi.weigh(req.id, weight);
      setWeighingId(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm weight.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="pbr-page">
      <div className="pbr-content">

        <div className="pbr-header">
          <div>
            <h1 className="pbr-title">Bulk Laundry Requests</h1>
            <p className="pbr-sub">Weight-based requests — accept, weigh, and process</p>
          </div>
          <button className="pbr-refresh-btn" onClick={() => load()}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="pbr-loading">
            <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading bulk requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="pbr-empty">
            <Package size={44} />
            <h3>No bulk requests yet</h3>
            <p>Requests for your per-kg services will appear here.</p>
          </div>
        ) : (
          <div className="pbr-list">
            {requests.map((req) => {
              const meta = bulkStatusMeta(req.status);
              const stepIdx = bulkStepIndex(req.status);
              const cancelled = req.status === 'cancelled';
              const busy = busyId === req.id;

              return (
                <div key={req.id} className="pbr-card">
                  <div className="pbr-card-top">
                    <div>
                      <h3 className="pbr-service-name">{req.serviceName}</h3>
                      <p className="pbr-customer-name">{req.customerName}</p>
                      {req.customerPhone && (
                        <p className="pbr-customer-phone"><Phone size={12} /> {req.customerPhone}</p>
                      )}
                      <p className="pbr-ref">Ref: {req.reference}</p>
                    </div>
                    <span className="pbr-status-badge" style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>

                  {!cancelled && (
                    <div className="pbr-tracker">
                      {BULK_STEPS.map((step, i) => (
                        <div key={step.key} className={`pbr-step${i <= stepIdx ? ' pbr-step-done' : ''}`}>
                          <span className="pbr-step-dot" />
                          <span className="pbr-step-label">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pbr-meta-row">
                    <span className="pbr-meta-item">
                      {req.fulfillmentMethod === 'pickup' ? <MapPin size={13} /> : <Truck size={13} />}
                      {req.fulfillmentMethod === 'pickup' ? `Pickup: ${req.address}` : 'Customer will drop off'}
                    </span>
                    {req.preferredDate && (
                      <span className="pbr-meta-item">
                        <Calendar size={13} /> {fmt.date(req.preferredDate)}{req.preferredSlot ? ` · ${req.preferredSlot}` : ''}
                      </span>
                    )}
                  </div>

                  {req.notes && <p className="pbr-notes">"{req.notes}"</p>}

                  <div className="pbr-price-block">
                    <span>Rs {req.pricePerKg.toFixed(2)}/kg</span>
                    {req.actualWeightKg != null && (
                      <>
                        <span className="pbr-price-sep">·</span>
                        <span className="pbr-weight-pill"><Scale size={12} /> {Number(req.actualWeightKg).toFixed(2)} kg</span>
                      </>
                    )}
                    {req.finalPrice != null && <span className="pbr-final-price">{fmt.money(req.finalPrice)}</span>}
                  </div>

                  {/* ── Actions per status ── */}
                  {req.status === 'pending_request' && (
                    <div className="pbr-actions">
                      <button className="pbr-btn pbr-btn-accept" disabled={busy} onClick={() => handleAccept(req)}>
                        <Check size={14} /> {busy ? 'Updating…' : 'Accept'}
                      </button>
                      <button className="pbr-btn pbr-btn-reject" disabled={busy} onClick={() => handleReject(req)}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {(req.status === 'pickup_scheduled' || req.status === 'awaiting_dropoff') && (
                    <div className="pbr-actions">
                      <button className="pbr-btn pbr-btn-primary" disabled={busy} onClick={() => handleReceive(req)}>
                        {busy ? 'Updating…' : 'Mark as Received'}
                      </button>
                    </div>
                  )}

                  {req.status === 'received' && (
                    weighingId === req.id ? (
                      <div className="pbr-weigh-form">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Actual weight (kg)"
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          autoFocus
                        />
                        <button className="pbr-btn pbr-btn-primary" disabled={busy} onClick={() => submitWeight(req)}>
                          {busy ? 'Saving…' : 'Confirm Weight'}
                        </button>
                        <button className="pbr-btn pbr-btn-ghost" disabled={busy} onClick={() => setWeighingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="pbr-actions">
                        <button className="pbr-btn pbr-btn-primary" onClick={() => openWeighForm(req)}>
                          <Scale size={14} /> Enter Weight
                        </button>
                      </div>
                    )
                  )}

                  {req.status === 'paid' && (
                    <div className="pbr-actions">
                      <button className="pbr-btn pbr-btn-primary" disabled={busy} onClick={() => handleProcess(req)}>
                        {busy ? 'Updating…' : 'Start Processing'}
                      </button>
                    </div>
                  )}

                  {req.status === 'processing' && (
                    <div className="pbr-actions">
                      <button className="pbr-btn pbr-btn-primary" disabled={busy} onClick={() => handleReady(req)}>
                        {busy ? 'Updating…' : 'Mark Ready'}
                      </button>
                    </div>
                  )}

                  {req.status === 'ready' && (
                    <div className="pbr-actions">
                      <button className="pbr-btn pbr-btn-accept" disabled={busy} onClick={() => handleComplete(req)}>
                        <Check size={14} /> {busy ? 'Updating…' : 'Mark Complete'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderBulkRequests;
