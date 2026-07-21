import api from '../utils/api';

const statsApi = {
  getPublic: () => api.get('/stats/public'),
};

export default statsApi;
