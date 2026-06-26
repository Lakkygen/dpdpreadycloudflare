import rateLimit from 'express-rate-limit';

// General API rate limit (60 requests per minute per IP)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter rate limit for scan endpoints (10 per hour per IP)
export const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Scan limit exceeded. Please wait an hour or upgrade your plan.' },
});

// Auth rate limit (5 attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});
