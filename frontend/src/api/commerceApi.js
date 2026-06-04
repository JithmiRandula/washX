import api from '../utils/api';

export const serviceItemsAPI = {
  getByServiceType: async (serviceTypeId) => {
    const response = await api.get(`/serviceitems/by-service-type/${serviceTypeId}`);
    return response.data;
  },

  add: async (payload) => {
    const response = await api.post('/serviceitems', payload);
    return response.data;
  },

  update: async (itemId, payload) => {
    const response = await api.put(`/serviceitems/${itemId}`, payload);
    return response.data;
  },

  delete: async (itemId, serviceTypeId) => {
    const response = await api.delete(`/serviceitems/${itemId}`, {
      params: { serviceTypeId }
    });
    return response.data;
  }
};
