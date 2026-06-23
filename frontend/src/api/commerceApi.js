import api from '../utils/api';

const mapCartRow = (row) => {
  const kind = (row?.kind ?? row?.Kind ?? 'item').toLowerCase();
  const base = {
    cartItemId: Number(row?.cartItemId ?? row?.CartItemId ?? 0),
    providerId: Number(row?.providerId ?? row?.ProviderId ?? 0),
    providerName: row?.providerName ?? row?.ProviderName ?? '',
    kind,
    quantity: Number(row?.quantity ?? row?.Quantity ?? 0),
    unitPrice: Number(row?.unitPrice ?? row?.UnitPrice ?? 0),
    price: Number(row?.price ?? row?.Price ?? 0)
  };

  if (kind === 'bulk') {
    return {
      ...base,
      bulkItemId: Number(row?.bulkItemId ?? row?.BulkItemId ?? 0),
      bags: Number(row?.bags ?? row?.Bags ?? 0),
      maxKg: Number(row?.maxKg ?? row?.MaxKg ?? 0),
      title: row?.bulkName ?? row?.BulkName ?? row?.ItemName ?? '',
      imageUrl: row?.bulkImageUrl ?? row?.BulkImageUrl ?? '/wash1.jpg'
    };
  }

  // default: item
  return {
    ...base,
    itemId: Number(row?.itemId ?? row?.ItemId ?? 0),
    serviceId: Number(row?.serviceId ?? row?.ServiceId ?? row?.serviceTypeId ?? row?.ServiceTypeId ?? 0),
    itemName: row?.itemName ?? row?.ItemName ?? '',
    description: row?.itemDescription ?? row?.ItemDescription ?? row?.Description ?? row?.description ?? '',
    imageUrl: row?.imageUrl ?? row?.ImageUrl ?? '/wash1.jpg',
    price: Number(row?.price ?? row?.Price ?? row?.ItemPrice ?? 0) * Number(row?.quantity ?? row?.Quantity ?? 1)
  };
};

export const cartAPI = {
  get: async () => {
    const response = await api.get('/cart');
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  // payload: { providerId, itemId?, bulkItemId?, kind?, quantity, bags?, maxKg?, unitPrice?, price?, description? }
  add: async (payload) => {
    const response = await api.post('/cart', payload);
    const rows = response.data?.data || [];
    return { ...response.data, data: rows.map(mapCartRow) };
  },

  // Generic add that supports bulk payloads: { providerId, itemId?, bulkItemId?, kind, quantity, bags, maxKg, unitPrice, price, description }
  addGeneric: async (payload) => {
    const response = await api.post('/cart', payload);
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

  /** Provider manage page — includes soft-deleted items */
  getForManage: async (serviceId) => {
    const response = await api.get(`/serviceitems/manage/by-service/${serviceId}`);
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
  },

  restore: async (itemId, serviceId) => {
    const response = await api.post(`/serviceitems/${itemId}/restore`, null, {
      params: { serviceId }
    });
    return response.data;
  }
};

export const uploadAPI = {
  uploadServiceItemImage: async (file, serviceId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceId', serviceId);

    const response = await api.post('/uploads/service-item-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  }
};

export const bulkItemsAPI = {
  getByService: async (serviceId) => {
    const response = await api.get(`/bulkitems/by-service/${serviceId}`);
    return response.data;
  },

  getForManage: async (serviceId) => {
    const response = await api.get(`/bulkitems/manage/by-service/${serviceId}`);
    return response.data;
  },

  add: async (payload) => {
    const response = await api.post('/bulkitems', payload);
    return response.data;
  },

  update: async (bulkItemId, payload) => {
    const response = await api.put(`/bulkitems/${bulkItemId}`, payload);
    return response.data;
  },

  delete: async (bulkItemId, serviceId) => {
    const response = await api.delete(`/bulkitems/${bulkItemId}`, { params: { serviceId } });
    return response.data;
  },

  restore: async (bulkItemId, serviceId) => {
    const response = await api.post(`/bulkitems/${bulkItemId}/restore`, null, { params: { serviceId } });
    return response.data;
  }
};

export const ordersAPI = {
  create: async (payload) => {
    const response = await api.post('/orders', payload);
    return response.data;
  },

  getMine: async () => {
    const response = await api.get('/orders/mine');
    return response.data;
  },

  getById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }
};

export const providerOrdersAPI = {
  getMine: async () => {
    const response = await api.get('/orders/provider/mine');
    return response.data;
  },
  // status: 'in-progress' (accept) | 'cancelled' (reject) | 'completed' (complete)
  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/provider-status`, { Status: status });
    return response.data;
  }
};

// upload for bulk items
uploadAPI.uploadBulkItemImage = async (file, serviceId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('serviceId', serviceId);

  // reuse existing service-item upload endpoint
  const response = await api.post('/uploads/service-item-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};
