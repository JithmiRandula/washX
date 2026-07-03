import api from '../utils/api';

export const adminApi = {
  getStats:     () => api.get('/admin/stats').then(r => r.data),
  getUsers:     () => api.get('/admin/users').then(r => r.data),
  getOrders:    () => api.get('/admin/orders').then(r => r.data),
  getProviders: () => api.get('/admin/providers').then(r => r.data),
};
