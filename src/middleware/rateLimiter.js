import rateLimit from 'express-rate-limit';

// Strict rate limiter for sensitive authentication endpoints (Register & Login)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});