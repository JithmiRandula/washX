import api from '../utils/api';

const chatApi = {
  getConversations:      ()                => api.get('/chat/conversations'),
  startConversation:     (payload)          => api.post('/chat/conversations/start', payload),
  getMessages:           (conversationId)   => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage:           (conversationId, body) => api.post(`/chat/conversations/${conversationId}/messages`, { body }),
  markRead:              (conversationId)   => api.patch(`/chat/conversations/${conversationId}/read`),
  getUnreadCount:        ()                => api.get('/chat/unread-count'),
};

export default chatApi;
