import api from './api';

export const paymentService = {
  createCheckout: (priceId, successUrl, cancelUrl) =>
    api.post('/billing/checkout-session', { priceId, successUrl, cancelUrl }),

  getPortalLink: () =>
    api.post('/billing/portal-session', { returnUrl: window.location.href }),

  getSubscription: () => api.get('/billing/status'),

  cancelSubscription: () => api.post('/billing/cancel-subscription'),
};

export default paymentService;
