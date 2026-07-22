import api from '../utils/api';

const bulkRequestsApi = {
  create:           (payload)   => api.post('/bulkrequests', payload),
  getMine:          ()          => api.get('/bulkrequests/mine'),
  getProviderMine:  ()          => api.get('/bulkrequests/provider/mine'),
  getById:          (id)        => api.get(`/bulkrequests/${id}`),

  // Provider actions
  accept:           (id)        => api.post(`/bulkrequests/${id}/accept`),
  reject:           (id)        => api.post(`/bulkrequests/${id}/reject`),
  receive:          (id)        => api.post(`/bulkrequests/${id}/receive`),
  weigh:            (id, actualWeightKg) => api.post(`/bulkrequests/${id}/weigh`, { actualWeightKg }),
  startProcessing:  (id)        => api.post(`/bulkrequests/${id}/start-processing`),
  ready:            (id)        => api.post(`/bulkrequests/${id}/ready`),
  complete:         (id)        => api.post(`/bulkrequests/${id}/complete`),

  // Customer actions
  confirm:          (id)        => api.post(`/bulkrequests/${id}/confirm`),
  markPaid:         (id, paymentProvider = 'PayHere') => api.post(`/bulkrequests/${id}/mark-paid`, { paymentProvider }),
  cancel:           (id)        => api.post(`/bulkrequests/${id}/cancel`),
};

export default bulkRequestsApi;
