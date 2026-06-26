import api from './api';

export const paymentService = {
  /**
   * Create a Stripe checkout session
   * @param {string} priceId
   * @param {string} successUrl
   * @param {string} cancelUrl
   * @returns {Promise<{ sessionId: string, url: string }>}
   */
  createCheckout: (priceId, successUrl, cancelUrl) =>
    api.post('/billing/checkout', { priceId, successUrl, cancelUrl }),

  /**
   * Redirect to Stripe customer portal
   * @returns {Promise<{ url: string }>}
   */
  getPortalLink: () => api.post('/billing/portal', { returnUrl: window.location.href }),

  /**
   * Get current subscription details
   * @returns {Promise<{ plan: string, status: string, currentPeriodEnd: string }>}
   */
  getSubscription: () => api.get('/billing/subscription'),

  /**
   * Cancel subscription at period end
   * @returns {Promise<{ cancelled: boolean }>}
   */
  cancelSubscription: () => api.post('/billing/cancel'),
};
