import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import billingRoutes from './routes/billing.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VITE_CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed'));
    },
    credentials: true,
  })
);

// Webhook route MUST be BEFORE express.json() - Stripe needs raw body
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Regular body parsing for all other routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.use('/api', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Root API check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'dpdpready api',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Only start server if running directly (not on Vercel)
const isDirectRun =
  process.argv[1] &&
  new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
