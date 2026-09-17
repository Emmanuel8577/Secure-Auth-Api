import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  getAllUsers, // Fixed: Added missing controller import
} from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Emmanuel Adikwu
 *               email:
 *                 type: string
 *                 example: emmanuel@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               address:
 *                 type: string
 *                 example: Lagos, Nigeria
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone number already exists
 */
router.post('/register', authRateLimiter, validateBody(RegisterSchema), register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user & issue session cookie
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address or phone number
 *                 example: emmanuel@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful (returns HttpOnly cookie)
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimiter, validateBody(LoginSchema), login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token using long-lived refresh token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: New access and refresh tokens set in HttpOnly cookies
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user & clear session cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Session cleared successfully
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile fetched successfully
 *       401:
 *         description: Unauthorized or invalid session
 */
router.get('/profile', protect, getProfile);

/**
 * @openapi
 * /api/v1/auth/admin/users:
 *   get:
 *     summary: Get all registered users (ADMIN only)
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all users fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (non-admin)
 */
router.get('/admin/users', protect, authorize('ADMIN'), getAllUsers);

export default router;