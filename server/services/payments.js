import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

function assertStripeReady() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
}

function appendSessionPlaceholder(url) {
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('A success URL is required.');
  }

  if (url.includes('session_id=')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

export async function createCheckoutSession({
  priceId,
  customerId,
  clientReferenceId,
  successUrl,
  cancelUrl,
  metadata = {},
  mode = 'subscription'
}) {
  assertStripeReady();

  if (!priceId) {
    throw new Error('priceId is required to create a checkout session.');
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: appendSessionPlaceholder(successUrl),
    cancel_url: cancelUrl,
    customer: customerId || undefined,
    client_reference_id: clientReferenceId || undefined,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: {
      product: 'dpdpready',
      ...metadata
    }
  });

  return {
    sessionId: session.id,
    url: session.url
  };
}

export async function createPortalSession(customerId, returnUrl) {
  assertStripeReady();

  if (!customerId) {
    throw new Error('customerId is required to create a billing portal session.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return { url: session.url };
}

export async function cancelSubscription(subscriptionId) {
  assertStripeReady();

  if (!subscriptionId) {
    throw new Error('subscriptionId is required.');
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });

  return {
    cancelled: subscription.cancel_at_period_end,
    status: subscription.status
  };
}

export function handleWebhook(rawBody, signature) {
  assertStripeReady();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export default stripe;
