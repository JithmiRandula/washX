import api from '../utils/api';

export const reviewsApi = {
  // POST /reviews  — customer only
  add: async (payload) => {
    const res = await api.post('/reviews', {
      OrderId:    payload.orderId,
      ProviderId: payload.providerId,
      Rating:     payload.rating,
      Comment:    payload.comment ?? null
    });
    return res.data;
  },

  // GET /reviews/provider/{id}  — public
  getByProvider: async (providerId) => {
    const res = await api.get(`/reviews/provider/${providerId}`);
    return res.data;
  },

  // GET /reviews/provider/{id}/summary  — public
  getSummary: async (providerId) => {
    const res = await api.get(`/reviews/provider/${providerId}/summary`);
    return res.data;
  },

  // GET /reviews/reviewable-orders  — customer only
  getReviewableOrders: async () => {
    const res = await api.get('/reviews/reviewable-orders');
    return res.data;
  }
};
