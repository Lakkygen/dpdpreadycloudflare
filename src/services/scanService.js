import api from './api';

export const scanService = {
  /**
   * Start a new scan
   * @param {string} url - website URL
   * @returns {Promise<{ scanId: string }>}
   */
  startScan: (url) => api.post('/scans', { url }),

  /**
   * Get scan status (with progress)
   * @param {string} scanId
   * @returns {Promise<{ status: string, progress: number }>}
   */
  getStatus: (scanId) => api.get(`/scans/${scanId}/status`),

  /**
   * Get complete scan results
   * @param {string} scanId
   * @returns {Promise<{ scan: object, issues: array }>}
   */
  getResults: (scanId) => api.get(`/scans/${scanId}`),

  /**
   * Get scan history (paginated)
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{ scans: array, total: number }>}
   */
  getHistory: (page = 1, limit = 20) =>
    api.get('/scans', { params: { page, limit } }),

  /**
   * Rescan a website
   * @param {string} scanId
   * @returns {Promise<{ scanId: string }>}
   */
  rescan: (scanId) => api.post(`/scans/${scanId}/rescan`),

  /**
   * Toggle monitoring for a scan
   * @param {string} scanId
   * @param {boolean} enabled
   * @returns {Promise<{ monitoring: boolean }>}
   */
  setMonitoring: (scanId, enabled) =>
    api.patch(`/scans/${scanId}/monitor`, { monitoring: enabled }),

  /**
   * Delete a scan
   * @param {string} scanId
   */
  delete: (scanId) => api.delete(`/scans/${scanId}`),
};
