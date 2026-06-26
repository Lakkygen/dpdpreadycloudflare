import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create a Stripe Checkout Session.
 * @param {string} priceId - Stripe Price ID
 * @param {string} customerId - Stripe Customer ID (optional)
 * @param {string} successUrl
 * @param {string} cancelUrl
 * @returns {object} { sessionId, url }
 */
export async function createCheckoutSession({ priceId, customerId, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: cancelUrl,
    customer: customerId || undefined,
    metadata: { product: 'dpdpready' },
  });
  return { sessionId: session.id, url: session.url };
}

/**
 * Create a Stripe Customer Portal session.
 * @param {string} customerId
 * @param {string} returnUrl
 */
export async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}

/**
 * Cancel a subscription at period end.
 * @param {string} subscriptionId
 */
export async function cancelSubscription(subscriptionId) {
  const sub = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return { cancelled: sub.cancel_at_period_end };
}

/**
 * Handle webhook signature verification and event processing.
 * @param {string} rawBody - raw request body
 * @param {string} signature - stripe-signature header
 * @returns {object} { type, data }
 */
export function handleWebhook(rawBody, signature) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  // Event types we care about:
  // - customer.subscription.created / updated / deleted
  // - checkout.session.completed
  return event;
}
