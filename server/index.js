import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import scanRoutes from './routes/scans.js';
import reportRoutes from './routes/reports.js';
import billingRoutes from './routes/billing.js';
import userRoutes from './routes/users.js';

import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ------------------------------------------------------------------
// Security & parsing middleware
// ------------------------------------------------------------------
app.use(helmet());                          // Secure HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));   // Accept JSON up to 10MB
app.use(express.urlencoded({ extended: true }));

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ------------------------------------------------------------------
// Global rate limiter (applied to all /api routes)
// ------------------------------------------------------------------
app.use('/api', generalLimiter);

// ------------------------------------------------------------------
// Health check (no auth)
// ------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------------------------------------
// Route mounting
// ------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/users', userRoutes);

// ------------------------------------------------------------------
// Global error handler (must be after routes)
// ------------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------------
// Start server
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ DPDPready API running on port ${PORT}`);
});
