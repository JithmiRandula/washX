import api from '../utils/api';

const mapCartRow = (row) => ({
  cartItemId: Number(row?.cartItemId ?? row?.CartItemId ?? 0),
  itemId: Number(row?.itemId ?? row?.ItemId ?? 0),
  providerId: Number(row?.providerId ?? row?.ProviderId ?? 0),
  providerName: row?.providerName ?? row?.ProviderName ?? '',
  serviceId: Number(row?.serviceId ?? row?.ServiceId ?? row?.serviceTypeId ?? row?.ServiceTypeId ?? 0),
  itemName: row?.itemName ?? row?.ItemName ?? '',
  description: row?.description ?? row?.Description ?? '',
  quantity: Number(row?.quantity ?? row?.Quantity ?? 0),
  unitPrice: Number(row?.price ?? row?.Price ?? 0),
  imageUrl: row?.imageUrl ?? row?.ImageUrl ?? '/wash1.jpg',
  price: Number(row?.price ?? row?.Price ?? 0) * Number(row?.quantity ?? row?.Quantity ?? 0),
  kind: 'item'
});

export const cartAPI = {
  get: async () => {
    const response = await api.get('/cart');
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  add: async ({ providerId, itemId, quantity = 1 }) => {
    const response = await api.post('/cart', { providerId, itemId, quantity });
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  increase: async (cartItemId) => {
    const response = await api.post(`/cart/${cartItemId}/increase`);
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  decrease: async (cartItemId) => {
    const response = await api.post(`/cart/${cartItemId}/decrease`);
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  remove: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  clear: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};

export const serviceItemsAPI = {
  getByService: async (serviceId) => {
    const response = await api.get(`/serviceitems/by-service/${serviceId}`);
    return response.data;
  },

  /** @deprecated use getByService */
  getByServiceType: async (serviceId) => serviceItemsAPI.getByService(serviceId),

  add: async (payload) => {
    const response = await api.post('/serviceitems', {
      serviceId: payload.serviceId ?? payload.serviceTypeId,
      itemName: payload.itemName,
      description: payload.description,
      price: payload.price,
      imageUrl: payload.imageUrl
    });
    return response.data;
  },

  update: async (itemId, payload) => {
    const response = await api.put(`/serviceitems/${itemId}`, {
      serviceId: payload.serviceId ?? payload.serviceTypeId,
      itemName: payload.itemName,
      description: payload.description,
      price: payload.price,
      imageUrl: payload.imageUrl
    });
    return response.data;
  },

  delete: async (itemId, serviceId) => {
    const response = await api.delete(`/serviceitems/${itemId}`, {
      params: { serviceId }
    });
    return response.data;
  }
};
