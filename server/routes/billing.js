import express from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import pool from '../database/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint – uses raw body from app-level middleware
router.post('/webhook', asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const userId = session.client_reference_id;

      if (userId) {
        // Upgrade user to 'pro' and store stripe IDs
        await pool.query(
          `UPDATE users 
           SET plan = 'pro', stripe_customer_id = $1, stripe_subscription_id = $2, updated_at = NOW()
           WHERE id = $3`,
          [customerId, subscriptionId, userId]
        );
        console.log(`User ${userId} upgraded to pro (subscription ${subscriptionId})`);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      // Downgrade to free
      await pool.query(
        `UPDATE users 
         SET plan = 'free', stripe_subscription_id = NULL, updated_at = NOW()
         WHERE stripe_customer_id = $1`,
        [customerId]
      );
      console.log(`Subscription ${subscription.id} cancelled for customer ${customerId}`);
      break;
    }
    case 'customer.subscription.updated': {
      // Optionally handle subscription updates (e.g., plan changes)
      // For simplicity, we can re-fetch the subscription and update plan if needed
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}));

// Create a checkout session (protected)
router.post('/create-checkout', requireAuth, asyncHandler(async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;
  const userId = req.user.id;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl || `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.CLIENT_URL}/pricing`,
    client_reference_id: userId,
    customer_email: req.user.email,
  });

  res.json({ sessionId: session.id, url: session.url });
}));

// Get subscription status
router.get('/status', requireAuth, asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT plan, stripe_subscription_id, stripe_customer_id FROM users WHERE id = $1',
    [req.user.id]
  );
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const status = {
    plan: user.plan,
    subscriptionId: user.stripe_subscription_id,
    customerId: user.stripe_customer_id,
  };
  if (user.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      status.currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      status.status = sub.status;
    } catch (err) {
      console.warn('Could not retrieve subscription from Stripe:', err.message);
    }
  }
  res.json(status);
}));

export default router;
