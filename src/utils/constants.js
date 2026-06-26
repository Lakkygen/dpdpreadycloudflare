export const PLANS = {
  free: {
    name: 'free',
    price: 0,
    scanLimit: 3,
    features: [
      '3 website scans / month',
      'Basic compliance score',
      'Email support',
    ],
    priceId: null,
    popular: false,
  },
  pro: {
    name: 'pro',
    price: 2999, // INR
    scanLimit: 30,
    features: [
      '30 scans / month',
      'AI-powered detailed report',
      'Downloadable PDF reports',
      'Continuous monitoring',
      'Priority support',
    ],
    priceId: 'price_pro_monthly', // Stripe Price ID placeholder
    popular: true,
  },
  business: {
    name: 'business',
    price: 8999,
    scanLimit: 100,
    features: [
      '100 scans / month',
      'White-label reports',
      'Multi-website management',
      'Team access (5 users)',
      'API access',
      'Dedicated account manager',
    ],
    priceId: 'price_business_monthly',
    popular: false,
  },
};

export const API_ENDPOINTS = {
  auth: {
    me: '/auth/me',
    sync: '/auth/sync',
  },
  scans: {
    base: '/scans',
  },
  reports: {
    base: '/reports',
  },
  billing: {
    subscription: '/billing/subscription',
    checkout: '/billing/checkout',
    portal: '/billing/portal',
    cancel: '/billing/cancel',
  },
  users: {
    profile: '/users/profile',
    usage: '/users/usage',
  },
};

export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
};

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'Something went wrong on our end. Please try again later.',
};
