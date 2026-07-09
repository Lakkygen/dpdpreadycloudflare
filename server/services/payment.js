import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession({
  priceId,
  customerId,
  clientReferenceId,
  successUrl,
  cancelUrl,
  metadata = {},
}) {
  const sessionConfig = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    client_reference_id: clientReferenceId,
  };

  if (customerId) {
    sessionConfig.customer = customerId;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);
  return { sessionId: session.id, url: session.url };
}

export async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: session.url };
}

export async function cancelSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return {
    cancelled: true,
    currentPeriodEnd: subscription.current_period_end,
  };
}

export function handleWebhook(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
