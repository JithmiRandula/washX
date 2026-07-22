// Shared status vocabulary for the weight-based bulk laundry workflow —
// used by both the customer and provider Bulk Requests pages.

export const BULK_STATUS_META = {
  pending_request:      { label: 'Pending Request',              color: '#d97706', bg: '#fffbeb' },
  pickup_scheduled:     { label: 'Pickup Scheduled',              color: '#0369a1', bg: '#e0f2fe' },
  awaiting_dropoff:     { label: 'Awaiting Drop-off',             color: '#0369a1', bg: '#e0f2fe' },
  received:             { label: 'Received — Weighing Pending',   color: '#7c3aed', bg: '#f3e8ff' },
  awaiting_confirmation:{ label: 'Weighed — Awaiting Your Confirmation', color: '#c026d3', bg: '#fae8ff' },
  payment_pending:      { label: 'Payment Pending',               color: '#dc2626', bg: '#fef2f2' },
  paid:                 { label: 'Payment Completed',             color: '#059669', bg: '#ecfdf5' },
  processing:           { label: 'Processing',                    color: '#0284c7', bg: '#e0f2fe' },
  ready:                { label: 'Ready',                         color: '#059669', bg: '#ecfdf5' },
  completed:             { label: 'Completed',                     color: '#64748b', bg: '#f1f5f9' },
  cancelled:              { label: 'Cancelled',                     color: '#dc2626', bg: '#fef2f2' },
};

export const bulkStatusMeta = (status) => BULK_STATUS_META[status] ?? BULK_STATUS_META.pending_request;

// Ordered steps for a progress tracker — pickup_scheduled/awaiting_dropoff share one slot.
export const BULK_STEPS = [
  { key: 'pending_request',  label: 'Requested' },
  { key: 'scheduled',        label: 'Scheduled' },     // pickup_scheduled | awaiting_dropoff
  { key: 'received',         label: 'Received' },
  { key: 'awaiting_confirmation', label: 'Weighed' },
  { key: 'paid',             label: 'Paid' },
  { key: 'processing',       label: 'Processing' },
  { key: 'ready',            label: 'Ready' },
  { key: 'completed',        label: 'Completed' },
];

const STEP_INDEX_BY_STATUS = {
  pending_request: 0,
  pickup_scheduled: 1,
  awaiting_dropoff: 1,
  received: 2,
  awaiting_confirmation: 3,
  payment_pending: 3,
  paid: 4,
  processing: 5,
  ready: 6,
  completed: 7,
};

export const bulkStepIndex = (status) => STEP_INDEX_BY_STATUS[status] ?? 0;
