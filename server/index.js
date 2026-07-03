import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import paymentRoutes from './routes/billing.js'; // renamed to billing.js

dotenv.config();

const app = express();

// CORS – restrict in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:5173'
}));

// ⚠️ Webhook route MUST use raw body BEFORE JSON parsing
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Then JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes – note: we mount billing under /api/billing
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/billing', paymentRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Export for Vercel – do NOT call app.listen()
export default app;
