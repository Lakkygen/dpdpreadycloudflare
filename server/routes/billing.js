import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  handleWebhook,
} from '../services/payments.js';
import pool from '../database/db.js';

const router = Router();

// GET /api/billing/subscription – user’s subscription
router.get(
  '/subscription',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows: [sub] } = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );
    res.json({ subscription: sub || null });
  })
);

// POST /api/billing/checkout – create Stripe checkout
router.post(
  '/checkout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { priceId, successUrl, cancelUrl } = req.body;
    if (!priceId) throw new ApiError(400, 'priceId required');

    const customerId = req.user.stripeCustomerId; // set after first checkout
    const session = await createCheckoutSession({
      priceId,
      customerId,
      successUrl: successUrl || `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${process.env.CLIENT_URL}/pricing?canceled=true`,
    });
    res.json(session);
  })
);

// POST /api/billing/portal – Stripe customer portal
router.post(
  '/portal',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Need stripe customer ID – from user record
    const { rows: [user] } = await pool.query(
      `SELECT stripe_customer_id FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!user?.stripe_customer_id) throw new ApiError(400, 'No Stripe customer found');
    const { url } = await createPortalSession(user.stripe_customer_id, req.body.returnUrl);
    res.json({ url });
  })
);

// POST /api/billing/cancel – cancel subscription
router.post(
  '/cancel',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows: [sub] } = await pool.query(
      `SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );
    if (!sub?.stripe_subscription_id) throw new ApiError(400, 'No active subscription');
    const result = await cancelSubscription(sub.stripe_subscription_id);
    // Update DB
    await pool.query(
      `UPDATE subscriptions SET status = 'canceled', canceled_at = now() WHERE stripe_subscription_id = $1`,
      [sub.stripe_subscription_id]
    );
    res.json(result);
  })
);

// POST /api/billing/webhook – Stripe webhook (no auth, uses signature)
// Note: This must be a raw body (express.raw) – adjust in server/index.js if needed
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // local middleware override
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = handleWebhook(req.body, sig);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // fulfill order: provision subscription
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        // Find user by stripe_customer_id
        const { rows: [user] } = await pool.query(
          `SELECT id FROM users WHERE stripe_customer_id = $1`,
          [customerId]
        );
        if (user) {
          // Upsert subscription
          await pool.query(
            `INSERT INTO subscriptions (user_id, stripe_subscription_id, status, current_period_end)
             VALUES ($1, $2, 'active', to_timestamp($3))
             ON CONFLICT (stripe_subscription_id)
             DO UPDATE SET status = 'active', updated_at = now()`,
            [user.id, subscriptionId, session.current_period_end]
          );
          // Update user plan based on the price (simple logic)
          await pool.query(
            `UPDATE users SET plan = 'pro' WHERE id = $1`,
            [user.id]
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const status = subscription.status === 'active' ? 'active' :
                       subscription.status === 'canceled' ? 'canceled' : 'past_due';
        await pool.query(
          `UPDATE subscriptions
           SET status = $1, current_period_end = to_timestamp($2), canceled_at = CASE WHEN $3 = 'canceled' THEN now() ELSE canceled_at END
           WHERE stripe_subscription_id = $4`,
          [status, subscription.current_period_end, status, subscription.id]
        );
        break;
      }
      // ... handle other events
    }

    res.json({ received: true });
  })
);

// small import for raw body parsing
import express from 'express';

export default router;
