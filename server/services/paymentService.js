const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getAuthToken() {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

async function requestJson(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      (typeof data === 'string' ? data : null) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}) {
  return requestJson('/api/billing/checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      metadata
    })
  });
}

export async function createPortalSession(returnUrl) {
  return requestJson('/api/billing/portal-session', {
    method: 'POST',
    body: JSON.stringify({ returnUrl })
  });
}

export async function cancelSubscription() {
  return requestJson('/api/billing/cancel-subscription', {
    method: 'POST'
  });
}

export async function getBillingStatus() {
  return requestJson('/api/billing/status', {
    method: 'GET'
  });
}

export default {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  getBillingStatus
};
