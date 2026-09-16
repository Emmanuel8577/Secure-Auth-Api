import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes with rate limiting and validation
router.post('/register', authRateLimiter, validateBody(RegisterSchema), register);
router.post('/login', authRateLimiter, validateBody(LoginSchema), login);
router.post('/logout', logout);

// Protected route example
router.get('/profile', protect, getProfile);

export default router;