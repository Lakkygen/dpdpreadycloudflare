import api from './api';

export const authService = {
  canRunScan: async (user) => {
    if (!user) return false;
    try {
      const data = await api.get('/users/usage');
      const scanLimit = user.plan?.scanLimit || user.scanLimit || 0;
      return data.scansThisMonth < scanLimit;
    } catch {
      return false;
    }
  },

  hasPlan: (user, planName) => {
    return (user?.plan?.name || user?.plan) === planName;
  },

  isProOrHigher: (user) => {
    const plan = user?.plan?.name || user?.plan || 'free';
    return ['pro', 'business', 'agency'].includes(plan);
  },

  syncProfile: () => api.get('/auth/me'),
};

export default authService;
