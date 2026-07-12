import api from '../utils/api';

const notificationsApi = {
  getAll:       ()  => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead:     (id) => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()  => api.patch('/notifications/read-all'),
  remove:       (id) => api.delete(`/notifications/${id}`),
};

export default notificationsApi;
