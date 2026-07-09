import api from './api';

export const reportService = {
  generate: (scanId) => api.post('/reports', { scanId }),

  getStatus: (reportId) => api.get(`/reports/${reportId}/status`),

  getReport: (reportId) => api.get(`/reports/${reportId}`),

  download: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  getHistory: (page = 1, limit = 20) =>
    api.get('/reports', { params: { page, limit } }),

  delete: (reportId) => api.delete(`/reports/${reportId}`),
};

export default reportService;
