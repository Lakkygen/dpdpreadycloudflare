import express from 'express';
import Stripe from 'stripe';

import { requireAuth } from '../middleware/auth.js';
import pool from '../database/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  handleWebhook,
} from '../services/payments.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const PRICE_PLAN_MAP = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY]: 'pro',
  [process.env.STRIPE_PRICE_BUSINESS_MONTHLY]: 'business',
  [process.env.STRIPE_PRICE_AGENCY_MONTHLY]: 'agency',
};

const mapPriceIdToPlan = (priceId) => PRICE_PLAN_MAP[priceId] || 'free';

function getClientUrl() {
  return process.env.CLIENT_URL || process.env.VITE_CLIENT_URL || 'http://localhost:5173';
}

async function getUserBillingRow(userId) {
  const { rows } = await pool.query(
    `SELECT id, email, plan, stripe_customer_id, stripe_subscription_id
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function updateUserBilling(userId, values = {}) {
  const fields = [];
  const params = [];
  let idx = 1;

  for (const [key, value] of Object.entries(values)) {
    fields.push(`${key} = $${idx}`);
    params.push(value);
    idx += 1;
  }

  if (!fields.length) return;

  params.push(userId);

  await pool.query(
    `UPDATE users
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx}`,
    params
  );
}

router.post(
  ['/checkout-session', '/create-checkout-session'],
  requireAuth,
  asyncHandler(async (req, res) => {
    const { priceId, successUrl, cancelUrl, metadata = {} } = req.body || {};

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    const session = await createCheckoutSession({
      priceId,
      customerId: req.body.customerId,
      clientReferenceId: req.user.id,
      successUrl: successUrl || `${getClientUrl()}/billing/success`,
      cancelUrl: cancelUrl || `${getClientUrl()}/pricing`,
      metadata,
    });

    res.status(200).json(session);
  })
);

router.post(
  ['/portal-session', '/create-portal-session'],
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserBillingRow(req.user.id);

    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found for this user.' });
    }

    const { url } = await createPortalSession(
      user.stripe_customer_id,
      req.body?.returnUrl || `${getClientUrl()}/account/billing`
    );

    res.json({ url });
  })
);

router.post(
  ['/cancel-subscription', '/cancel'],
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserBillingRow(req.user.id);

    if (!user?.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found.' });
    }

    const result = await cancelSubscription(user.stripe_subscription_id);

    await updateUserBilling(req.user.id, {
      plan: 'free',
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

router.get(
  '/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserBillingRow(req.user.id);

    res.json({
      plan: user?.plan || 'free',
      hasCustomer: Boolean(user?.stripe_customer_id),
      hasSubscription: Boolean(user?.stripe_subscription_id),
    });
  })
);

router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body;

    let event;
    try {
      event = handleWebhook(rawBody, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer || null;
        const subscriptionId = session.subscription || null;
        const userId = session.client_reference_id || null;

        if (userId) {
          const plan = 'pro';
          await updateUserBilling(userId, {
            plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer || null;
        const subscriptionId = subscription.id || null;
        const priceId = subscription.items?.data?.[0]?.price?.id || null;
        const plan = mapPriceIdToPlan(priceId);

        await pool.query(
          `UPDATE users
           SET plan = $1,
               stripe_subscription_id = $2,
               updated_at = NOW()
           WHERE stripe_customer_id = $3`,
          [plan, subscriptionId, customerId]
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer || null;

        await pool.query(
          `UPDATE users
           SET plan = 'free',
               stripe_subscription_id = NULL,
               updated_at = NOW()
           WHERE stripe_customer_id = $1`,
          [customerId]
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer || null;

        await pool.query(
          `UPDATE users
           SET updated_at = NOW()
           WHERE stripe_customer_id = $1`,
          [customerId]
        );
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  })
);

export default router;
