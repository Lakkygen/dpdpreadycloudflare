import api from './api';

export const reportService = {
  /**
   * Generate a report for a scan (async)
   * @param {string} scanId
   * @returns {Promise<{ reportId: string }>}
   */
  generate: (scanId) => api.post('/reports', { scanId }),

  /**
   * Get report generation status
   * @param {string} reportId
   * @returns {Promise<{ status: string }>}
   */
  getStatus: (reportId) => api.get(`/reports/${reportId}/status`),

  /**
   * Get report data (for preview)
   * @param {string} reportId
   * @returns {Promise<{ report: object }>}
   */
  getReport: (reportId) => api.get(`/reports/${reportId}`),

  /**
   * Download report as PDF (returns blob URL)
   * @param {string} reportId
   * @returns {Promise<Blob>}
   */
  download: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get all reports for user
   * @param {number} page
   * @param {number} limit
   */
  getHistory: (page = 1, limit = 20) =>
    api.get('/reports', { params: { page, limit } }),

  /**
   * Delete a report
   * @param {string} reportId
   */
  delete: (reportId) => api.delete(`/reports/${reportId}`),
};
