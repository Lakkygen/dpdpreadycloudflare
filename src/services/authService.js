import api from './api';
import { useAuth } from '../hooks/useAuth'; // can't use hook here; so these are utility functions that accept user object

export const authService = {
  /**
   * Check if user can run a scan (based on plan limits)
   * @param {object} user - user object from context
   * @returns {Promise<boolean>}
   */
  canRunScan: async (user) => {
    if (!user) return false;
    // Call backend to get usage
    try {
      const { data } = await api.get('/users/usage');
      const scanLimit = user.plan?.scanLimit || 0;
      return data.scansThisMonth < scanLimit;
    } catch {
      return false; // fail safe
    }
  },

  /**
   * Check if user has a specific plan
   * @param {object} user
   * @param {string} planName
   * @returns {boolean}
   */
  hasPlan: (user, planName) => {
    return user?.plan?.name === planName;
  },

  /**
   * Check if user has pro or higher
   * @param {object} user
   * @returns {boolean}
   */
  isProOrHigher: (user) => {
    return ['pro', 'business', 'agency'].includes(user?.plan?.name);
  },

  /**
   * Sync user profile from server (called on app load)
   * @returns {Promise<object>}
   */
  syncProfile: () => api.get('/auth/me'),
};
