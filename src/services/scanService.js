import api from './api';

export const scanService = {
  startScan: (url) => api.post('/scans', { url }),

  getStatus: (scanId) => api.get(`/scans/${scanId}/status`),

  getResults: (scanId) => api.get(`/scans/${scanId}`),

  getHistory: (page = 1, limit = 20) =>
    api.get('/scans', { params: { page, limit } }),

  rescan: (scanId) => api.post(`/scans/${scanId}/rescan`),

  setMonitoring: (scanId, enabled) =>
    api.patch(`/scans/${scanId}/monitor`, { monitoring: enabled }),

  delete: (scanId) => api.delete(`/scans/${scanId}`),
};

export default scanService;
